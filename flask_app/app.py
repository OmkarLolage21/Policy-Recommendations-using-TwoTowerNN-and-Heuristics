from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import threading
from datetime import datetime, timedelta
import traceback
import csv
import os
from pathlib import Path
from cart_service import CartService

app = Flask(__name__)
CORS(app)

# ==== File paths and directory setup ====
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
TRACKING_FILE = DATA_DIR / 'interactions_tracking.csv'
POLICIES_FILE = DATA_DIR / 'policies.csv'
CUSTOMERS_FILE = DATA_DIR / 'customers.csv'
INTERACTIONS_FILE = DATA_DIR / 'interactions.csv'

DATA_DIR.mkdir(exist_ok=True)

if not TRACKING_FILE.exists():
    with open(TRACKING_FILE, 'w') as f:
        writer = csv.writer(f)
        writer.writerow([
            'timestamp', 'event_type', 'session_id', 'page', 
            'customer_id', 'policy_id', 'interaction_type', 
            'duration', 'query', 'referrer', 'additional_data'
        ])

# ==== Utility Functions ====

def log_interaction(data):
    """Log interaction to CSV file"""
    row = [
        data.get('timestamp', datetime.now().isoformat()),
        data.get('eventType'),
        data.get('sessionId'),
        data.get('page'),
        data.get('customerId'),
        data.get('policyId'),
        data.get('interactionType'),
        data.get('duration'),
        data.get('query'),
        data.get('referrer'),
        str(data.get('additional_data', {}))
    ]
    
    with open(TRACKING_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(row)

def safe_read_csv(path, default_columns=None):
    try:
        df = pd.read_csv(path)
        print(f"Available columns in {path}: {df.columns.tolist()}")
        if default_columns:
            for col in default_columns:
                if col not in df.columns:
                    df[col] = None
        return df
    except Exception as e:
        print(f"Error reading {path}: {str(e)}")
        return pd.DataFrame(columns=default_columns if default_columns else [])

# ==== Cart Service Initialization ====
cart_service = CartService()

@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    customer_id = data.get('customer_id')
    policy_id = data.get('policy_id')
    
    try:
        cart_service.add_to_cart(customer_id, policy_id)
        
        log_interaction({
            'eventType': 'cart_add',
            'customerId': customer_id,
            'policyId': policy_id,
            'timestamp': datetime.now().isoformat(),
            'interactionType': 'cart_add'
        })
        
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/cart/checkout', methods=['POST'])
def checkout():
    data = request.json
    customer_id = data.get('customer_id')
    
    try:
        success = cart_service.checkout(customer_id)
        if success:
            return jsonify({'status': 'success'})
        else:
            return jsonify({'error': 'Checkout failed'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/cart', methods=['GET'])
def get_cart():
    customer_id = request.args.get('customer_id')
    
    try:
        cart = cart_service.get_cart(customer_id)
        return jsonify(cart)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==== Tracking and Core APIs ====

@app.route('/track', methods=['POST'])
def track():
    data = request.json
    log_interaction(data)
    return jsonify({'status': 'success'})

@app.route('/search_policies', methods=['GET'])
def search_policies():
    query = request.args.get('q', '').lower()
    
    try:
        policies = pd.read_csv(POLICIES_FILE)
        if not query:
            return jsonify(policies.head(20).to_dict('records'))
        
        mask = (
            policies['policy_name'].str.lower().str.contains(query) |
            policies['policy_type'].str.lower().str.contains(query) |
            policies['description'].str.lower().str.contains(query) |
            policies['keywords'].str.lower().str.contains(query)
        )
        results = policies[mask].to_dict('records')
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend_policies', methods=['GET'])
def recommend_policies():
    customer_id = request.args.get('customer_id')
    top_n = int(request.args.get('top_n', 5))
    
    try:
        policies = pd.read_csv(POLICIES_FILE)
        recommended = policies.sample(min(top_n, len(policies)))
        
        for i, policy in recommended.iterrows():
            log_interaction({
                'eventType': 'policy_recommendation',
                'customerId': customer_id,
                'policyId': policy['policy_id'],
                'timestamp': datetime.now().isoformat(),
                'additional_data': {
                    'recommendation_rank': i + 1
                }
            })
        
        return jsonify(recommended.to_dict('records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        policies = safe_read_csv(POLICIES_FILE, ['policy_id', 'policy_name', 'policy_type', 'premium_amount (INR)', 'sum_assured (INR)'])
        customers = safe_read_csv(CUSTOMERS_FILE, ['customer_id', 'name', 'age', 'location_city'])
        interactions = safe_read_csv(INTERACTIONS_FILE, ['interaction_id', 'customer_id', 'policy_id', 'purchased', 'timestamp'])

        policies['premium'] = policies['premium_amount (INR)'].replace('[^\d.]', '', regex=True).astype(float)
        policies['sum_assured'] = policies['sum_assured (INR)'].replace('[^\d.]', '', regex=True).astype(float)
        
        interactions['date'] = pd.to_datetime(interactions['timestamp'], errors='coerce')
        interactions = interactions.dropna(subset=['date'])
        
        metrics = {
            'total_policies': len(policies),
            'total_customers': len(customers),
            'conversion_rate': round(interactions['purchased'].mean() * 100, 2) if len(interactions) > 0 else 0,
            'avg_premium': round(policies['premium'].mean(), 2) if len(policies) > 0 else 0
        }
        
        policy_types = policies['policy_type'].value_counts()
        policy_performance = {
            'labels': policy_types.index.tolist(),
            'datasets': [{
                'label': 'Policy Types',
                'data': policy_types.values.tolist(),
                'backgroundColor': ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b']
            }]
        }
        
        customers['age_group'] = pd.cut(
            customers['age'],
            bins=[0, 30, 50, 100],
            labels=['<30', '30-50', '50+']
        )
        age_counts = customers['age_group'].value_counts()
        customer_segments = {
            'labels': age_counts.index.tolist(),
            'datasets': [{
                'data': age_counts.values.tolist(),
                'backgroundColor': ['#7e22ce', '#3b82f6', '#10b981']
            }]
        }
        
        last_week = datetime.now() - timedelta(days=7)
        sales_data = interactions[interactions['date'] > last_week]
        sales_trend = sales_data.groupby(sales_data['date'].dt.date).size()
        
        recent_activities = []
        if not interactions.empty:
            recent_activities = (
                interactions.sort_values('date', ascending=False)
                .head(5)
                .merge(policies, on='policy_id')
                .merge(customers, on='customer_id')
                .apply(lambda x: {
                    'id': str(x['interaction_id']),
                    'type': 'purchase' if x['purchased'] else 'view',
                    'customer': x['name'],
                    'policy': x['policy_name'],
                    'time': x['date'].strftime('%H:%M %b %d')
                }, axis=1)
                .tolist()
            )
        
        top_policies = []
        if not policies.empty:
            top_policies = (
                policies.nlargest(5, 'premium')[['policy_id', 'policy_name', 'premium']]
                .rename(columns={'premium': 'value'})
                .to_dict('records')
            )
        
        return jsonify({
            'metrics': metrics,
            'policy_performance': policy_performance,
            'customer_segments': customer_segments,
            'sales_trend': {
                'labels': [str(d) for d in sales_trend.index],
                'datasets': [{
                    'label': 'Policies Sold',
                    'data': sales_trend.tolist(),
                    'borderColor': '#7e22ce',
                    'backgroundColor': 'rgba(126, 34, 206, 0.1)'
                }]
            },
            'top_policies': top_policies,
            'recent_activities': recent_activities
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

# ==== Startup ====
if __name__ == '__main__':
    abandoned_cart_thread = threading.Thread(target=cart_service.check_abandoned_carts)
    abandoned_cart_thread.daemon = True
    abandoned_cart_thread.start()
    
    app.run(debug=True, port=5000)
