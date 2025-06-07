from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from collections import defaultdict, Counter
import sqlite3
import threading
import time

app = Flask(__name__)
CORS(app)

# Global storage for tracking data
tracking_data = []
tracking_lock = threading.Lock()

# Initialize SQLite database for persistent storage
def init_db():
    conn = sqlite3.connect('tracking.db')
    cursor = conn.cursor()
    
    # Create tracking events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tracking_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            event_type TEXT,
            customer_id TEXT,
            policy_id TEXT,
            session_id TEXT,
            page TEXT,
            interaction_type TEXT,
            duration REAL,
            additional_data TEXT
        )
    ''')
    
    # Create cart table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id TEXT,
            policy_id TEXT,
            policy_name TEXT,
            premium_amount REAL,
            added_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Load datasets
try:
    customers_df = pd.read_csv('./data/customers.csv')
    policies_df = pd.read_csv('./data/policies.csv')
    interactions_df = pd.read_csv('./data/interactions.csv')
    user_policy_df = pd.read_csv('./data/interactions_tracking.csv')
    print("✅ All datasets loaded successfully")
except Exception as e:
    print(f"❌ Error loading datasets: {e}")
    customers_df = pd.DataFrame()
    policies_df = pd.DataFrame()
    interactions_df = pd.DataFrame()
    user_policy_df = pd.DataFrame()

def clean_numeric_value(value):
    """Clean and convert numeric values from string format"""
    if pd.isna(value) or value == '':
        return 0
    if isinstance(value, str):
        # Remove commas and quotes
        cleaned = value.replace(',', '').replace('"', '').strip()
        try:
            return float(cleaned)
        except ValueError:
            return 0
    return float(value) if not pd.isna(value) else 0

# Clean the datasets
if not policies_df.empty:
    policies_df['premium_amount_clean'] = policies_df['premium_amount (INR)'].apply(clean_numeric_value)
    policies_df['sum_assured_clean'] = policies_df['sum_assured (INR)'].apply(clean_numeric_value)

@app.route('/track', methods=['POST'])
def track_event():
    """Store tracking events"""
    try:
        data = request.get_json()
        
        # Store in memory for real-time access
        with tracking_lock:
            tracking_data.append(data)
            # Keep only last 1000 events in memory
            if len(tracking_data) > 1000:
                tracking_data.pop(0)
        
        # Store in database for persistence
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tracking_events 
            (timestamp, event_type, customer_id, policy_id, session_id, page, interaction_type, duration, additional_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('timestamp'),
            data.get('eventType'),
            data.get('customerId'),
            data.get('policyId'),
            data.get('sessionId'),
            data.get('currentPage'),
            data.get('interactionType'),
            data.get('duration'),
            json.dumps(data)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error tracking event: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data for dashboard"""
    try:
        time_range = request.args.get('range', '7d')
        
        # Calculate time filter
        now = datetime.now()
        if time_range == '24h':
            start_time = now - timedelta(hours=24)
        elif time_range == '7d':
            start_time = now - timedelta(days=7)
        elif time_range == '30d':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(days=7)
        
        # Get tracking data from database
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM tracking_events 
            WHERE timestamp >= ? 
            ORDER BY timestamp DESC
        ''', (start_time.isoformat(),))
        
        events = cursor.fetchall()
        conn.close()
        
        # Process events for analytics
        policy_interactions = defaultdict(int)
        customer_activity = defaultdict(int)
        event_types = Counter()
        recent_activities = []
        
        for event in events[:100]:  # Last 100 events
            event_data = {
                'id': event[0],
                'timestamp': event[1],
                'event_type': event[2],
                'customer_id': event[3],
                'policy_id': event[4],
                'session_id': event[5],
                'page': event[6],
                'interaction_type': event[7],
                'duration': event[8],
                'additional_data': event[9]
            }
            
            if event_data['policy_id']:
                policy_interactions[event_data['policy_id']] += 1
            
            if event_data['customer_id']:
                customer_activity[event_data['customer_id']] += 1
            
            event_types[event_data['event_type']] += 1
            
            # Format for recent activities
            if len(recent_activities) < 20:
                try:
                    additional = json.loads(event_data['additional_data']) if event_data['additional_data'] else {}
                    policy_name = 'Unknown Policy'
                    
                    if event_data['policy_id'] and not policies_df.empty:
                        policy_row = policies_df[policies_df['policy_id'] == int(event_data['policy_id'])]
                        if not policy_row.empty:
                            policy_name = policy_row.iloc[0]['policy_name']
                    
                    recent_activities.append({
                        'id': str(event_data['id']),
                        'type': 'view' if event_data['event_type'] == 'policy_interaction' else 'activity',
                        'customer': f"Customer {event_data['customer_id']}" if event_data['customer_id'] else 'Anonymous',
                        'policy': policy_name,
                        'time': event_data['timestamp']
                    })
                except:
                    pass
        
        # Calculate metrics
        total_policies = len(policies_df) if not policies_df.empty else 0
        total_customers = len(customers_df) if not customers_df.empty else 0
        
        # Policy performance data
        policy_interactions_counter = Counter(policy_interactions)
        top_policies = []
        if not policies_df.empty:
            for policy_id, count in policy_interactions_counter.most_common(10):
                try:
                    policy_row = policies_df[policies_df['policy_id'] == int(policy_id)]
                    if not policy_row.empty:
                        top_policies.append({
                            'id': str(policy_id),
                            'name': policy_row.iloc[0]['policy_name'],
                            'views': count,
                            'conversions': np.random.randint(5, 25)  # Mock conversion rate
                        })
                except:
                    continue
        
        # Create chart data
        policy_performance = {
            'labels': [p['name'][:20] + '...' if len(p['name']) > 20 else p['name'] for p in top_policies[:5]],
            'datasets': [{
                'label': 'Policy Views',
                'data': [p['views'] for p in top_policies[:5]],
                'backgroundColor': ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']
            }]
        }
        
        customer_segments = {
            'labels': ['Active Users', 'New Users', 'Returning Users', 'Inactive Users'],
            'datasets': [{
                'label': 'Customer Segments',
                'data': [
                    len([c for c in customer_activity.values() if c > 5]),
                    len([c for c in customer_activity.values() if c <= 2]),
                    len([c for c in customer_activity.values() if 2 < c <= 5]),
                    max(0, total_customers - len(customer_activity))
                ],
                'backgroundColor': ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
            }]
        }
        
        # Sales trend (mock data based on events)
        sales_trend = {
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'datasets': [{
                'label': 'Daily Interactions',
                'data': [45, 52, 38, 65, 72, 48, 55],
                'borderColor': '#8B5CF6',
                'backgroundColor': 'rgba(139, 92, 246, 0.1)',
                'tension': 0.4
            }]
        }
        
        return jsonify({
            'metrics': {
                'total_policies': total_policies,
                'total_customers': total_customers,
                'conversion_rate': np.random.uniform(15, 25),  # Mock conversion rate
                'avg_premium': policies_df['premium_amount_clean'].mean() if not policies_df.empty else 0
            },
            'policy_performance': policy_performance,
            'customer_segments': customer_segments,
            'sales_trend': sales_trend,
            'recent_activities': recent_activities,
            'top_policies': top_policies
        })
        
    except Exception as e:
        print(f"Error getting analytics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    """Add policy to cart"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        policy_id = data.get('policy_id')
        
        if not customer_id or not policy_id:
            return jsonify({'error': 'Missing customer_id or policy_id'}), 400
        
        # Get policy details
        policy_row = policies_df[policies_df['policy_id'] == int(policy_id)]
        if policy_row.empty:
            return jsonify({'error': 'Policy not found'}), 404
        
        policy_data = policy_row.iloc[0]
        
        # Add to database
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        # Check if already in cart
        cursor.execute('''
            SELECT id FROM cart_items 
            WHERE customer_id = ? AND policy_id = ?
        ''', (customer_id, policy_id))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({'message': 'Policy already in cart'})
        
        # Add to cart
        cursor.execute('''
            INSERT INTO cart_items (customer_id, policy_id, policy_name, premium_amount, added_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            customer_id,
            policy_id,
            policy_data['policy_name'],
            policy_data['premium_amount_clean'],
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Policy added to cart successfully'})
        
    except Exception as e:
        print(f"Error adding to cart: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cart', methods=['GET'])
def get_cart():
    """Get cart items for a customer"""
    try:
        customer_id = request.args.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Missing customer_id'}), 400
        
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT policy_id, policy_name, premium_amount, added_at
            FROM cart_items 
            WHERE customer_id = ?
            ORDER BY added_at DESC
        ''', (customer_id,))
        
        items = cursor.fetchall()
        conn.close()
        
        cart_items = []
        for item in items:
            cart_items.append({
                'policy_id': item[0],
                'policy_name': item[1],
                'premium_amount': item[2],
                'added_at': item[3]
            })
        
        return jsonify({'items': cart_items})
        
    except Exception as e:
        print(f"Error getting cart: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cart/remove', methods=['POST'])
def remove_from_cart():
    """Remove policy from cart"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        policy_id = data.get('policy_id')
        
        if not customer_id or not policy_id:
            return jsonify({'error': 'Missing customer_id or policy_id'}), 400
        
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM cart_items 
            WHERE customer_id = ? AND policy_id = ?
        ''', (customer_id, policy_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Policy removed from cart'})
        
    except Exception as e:
        print(f"Error removing from cart: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cart/checkout', methods=['POST'])
def checkout_cart():
    """Checkout cart items"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Missing customer_id'}), 400
        
        conn = sqlite3.connect('tracking.db')
        cursor = conn.cursor()
        
        # Get cart items
        cursor.execute('''
            SELECT policy_id, policy_name, premium_amount
            FROM cart_items 
            WHERE customer_id = ?
        ''', (customer_id,))
        
        items = cursor.fetchall()
        
        if not items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Clear cart after checkout
        cursor.execute('''
            DELETE FROM cart_items WHERE customer_id = ?
        ''', (customer_id,))
        
        conn.commit()
        conn.close()
        
        # Track checkout event
        checkout_data = {
            'timestamp': datetime.now().isoformat(),
            'eventType': 'checkout',
            'customerId': customer_id,
            'items': len(items),
            'total_amount': sum(item[2] for item in items)
        }
        
        with tracking_lock:
            tracking_data.append(checkout_data)
        
        return jsonify({
            'message': 'Checkout successful',
            'items_purchased': len(items),
            'total_amount': sum(item[2] for item in items)
        })
        
    except Exception as e:
        print(f"Error during checkout: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/recommend_policies', methods=['GET'])
def recommend_policies():
    """Get recommended policies for a customer"""
    try:
        customer_id = request.args.get('customer_id')
        
        if not customer_id or policies_df.empty:
            return jsonify([])
        
        # Simple recommendation based on customer profile
        customer_row = customers_df[customers_df['customer_id'] == int(customer_id)]
        
        if customer_row.empty:
            # Return random policies if customer not found
            recommended = policies_df.sample(n=min(6, len(policies_df))).to_dict('records')
        else:
            customer_data = customer_row.iloc[0]
            preferred_type = customer_data.get('preferred_policy_type', '')
            
            # Filter policies by preferred type
            if preferred_type and preferred_type in policies_df['policy_type'].values:
                type_policies = policies_df[policies_df['policy_type'] == preferred_type]
                other_policies = policies_df[policies_df['policy_type'] != preferred_type]
                
                # Get 3 from preferred type and 3 from others
                recommended = []
                if not type_policies.empty:
                    recommended.extend(type_policies.sample(n=min(3, len(type_policies))).to_dict('records'))
                if not other_policies.empty:
                    recommended.extend(other_policies.sample(n=min(3, len(other_policies))).to_dict('records'))
            else:
                recommended = policies_df.sample(n=min(6, len(policies_df))).to_dict('records')
        
        return jsonify(recommended)
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return jsonify([])

@app.route('/search_policies', methods=['GET'])
def search_policies():
    """Search policies based on query"""
    try:
        query = request.args.get('q', '').lower()
        
        if policies_df.empty:
            return jsonify([])
        
        if not query:
            return jsonify(policies_df.to_dict('records'))
        
        # Search in policy name, type, and keywords
        mask = (
            policies_df['policy_name'].str.lower().str.contains(query, na=False) |
            policies_df['policy_type'].str.lower().str.contains(query, na=False) |
            policies_df['keywords'].str.lower().str.contains(query, na=False) |
            policies_df['description'].str.lower().str.contains(query, na=False)
        )
        
        results = policies_df[mask].to_dict('records')
        return jsonify(results)
        
    except Exception as e:
        print(f"Error searching policies: {e}")
        return jsonify([])

if __name__ == '__main__':
    print("🚀 Starting SBI Insurance Recommendation API...")
    print("📊 Dashboard analytics available at /analytics")
    print("🛒 Cart functionality available at /cart/*")
    print("📈 Tracking events at /track")
    app.run(debug=True, host='0.0.0.0', port=5000)