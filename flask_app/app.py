# backend/app.py
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import csv
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Path configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
TRACKING_FILE = DATA_DIR / 'interactions_tracking.csv'
POLICIES_FILE = DATA_DIR / 'policies.csv'
CUSTOMERS_FILE = DATA_DIR / 'customers.csv'
INTERACTIONS_FILE = DATA_DIR / 'interactions.csv'

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

if not TRACKING_FILE.exists():
    with open(TRACKING_FILE, 'w') as f:
        writer = csv.writer(f)
        writer.writerow([
            'timestamp', 'event_type', 'session_id', 'page', 
            'customer_id', 'policy_id', 'interaction_type', 
            'duration', 'query', 'referrer', 'additional_data'
        ])

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

@app.route('/track', methods=['POST'])
def track():
    """Endpoint for tracking all events"""
    data = request.json
    log_interaction(data)
    return jsonify({'status': 'success'})

@app.route('/search_policies', methods=['GET'])
def search_policies():
    """Search policies endpoint"""
    query = request.args.get('q', '').lower()
    
    try:
        policies = pd.read_csv(POLICIES_FILE)
        
        if not query:
            return jsonify(policies.head(20).to_dict('records'))
        
        # Search in multiple fields
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
    """Policy recommendation endpoint"""
    customer_id = request.args.get('customer_id')
    top_n = int(request.args.get('top_n', 5))
    
    try:
        # In a real implementation, you'd use your ML model here
        policies = pd.read_csv(POLICIES_FILE)
        
        # Simple "recommendation" - just return random policies
        recommended = policies.sample(min(top_n, len(policies)))
        
        # Log the recommendation
        for _, policy in recommended.iterrows():
            log_interaction({
                'eventType': 'policy_recommendation',
                'customerId': customer_id,
                'policyId': policy['policy_id'],
                'timestamp': datetime.now().isoformat(),
                'additional_data': {
                    'recommendation_rank': _ + 1
                }
            })
        
        return jsonify(recommended.to_dict('records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        # Load data with fallbacks
        policies = safe_read_csv(POLICIES_FILE, ['policy_id', 'policy_name', 'policy_type', 'premium_amount (INR)', 'sum_assured (INR)'])
        customers = safe_read_csv(CUSTOMERS_FILE, ['customer_id', 'name', 'age', 'location_city'])
        interactions = safe_read_csv(INTERACTIONS_FILE, ['interaction_id', 'customer_id', 'policy_id', 'purchased', 'timestamp'])
        
        # Clean data
        policies['premium'] = policies['premium_amount (INR)'].replace('[^\d.]', '', regex=True).astype(float)
        policies['sum_assured'] = policies['sum_assured (INR)'].replace('[^\d.]', '', regex=True).astype(float)
        
        interactions['date'] = pd.to_datetime(interactions['timestamp'], errors='coerce')
        interactions = interactions.dropna(subset=['date'])
        
        # Calculate metrics
        metrics = {
            'total_policies': len(policies),
            'total_customers': len(customers),
            'conversion_rate': round(interactions['purchased'].mean() * 100, 2) if len(interactions) > 0 else 0,
            'avg_premium': round(policies['premium'].mean(), 2) if len(policies) > 0 else 0
        }
        
        # Prepare chart data - ensure we're working with Series, not DataFrames
        policy_types = policies['policy_type'].value_counts()
        policy_performance = {
            'labels': policy_types.index.tolist(),
            'datasets': [{
                'label': 'Policy Types',
                'data': policy_types.values.tolist(),
                'backgroundColor': ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b']
            }]
        }
        
        # Customer segments by age
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
        
        # Sales trend (last 7 days)
        last_week = datetime.now() - timedelta(days=7)
        sales_data = interactions[interactions['date'] > last_week]
        sales_trend = sales_data.groupby(sales_data['date'].dt.date).size()
        
        # Prepare recent activities - ensure we're converting to list properly
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
        
        # Prepare top policies - ensure we're working with proper DataFrame operations
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

def safe_read_csv(path, default_columns=None):
    """Safely read CSV with error handling"""
    try:
        df = pd.read_csv(path)
        print(f"Available columns in {path}: {df.columns.tolist()}")  # Fixed variable name

        if default_columns:
            for col in default_columns:
                if col not in df.columns:
                    df[col] = None
        return df
    except Exception as e:
        print(f"Error reading {path}: {str(e)}")
        return pd.DataFrame(columns=default_columns if default_columns else [])
# Initialize tracking file if it doesn't exist

if __name__ == '__main__':
    app.run(debug=True, port=5000)