import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from config import CUSTOMERS_CSV, POLICIES_CSV, INTERACTIONS_CSV, MODEL_PATH, PREPROCESS_CONFIG
from model.preprocess import preprocess_data

def recommend_policies(customer_id, top_n=5):
    # Load CSV data
    customers = pd.read_csv(CUSTOMERS_CSV)
    policies = pd.read_csv(POLICIES_CSV)
    interactions = pd.read_csv(INTERACTIONS_CSV)

    # Filter for the given customer_id in customers
    customer_data = customers[customers['customer_id'] == int(customer_id)]
    if customer_data.empty:
        return {'error': 'Customer not found'}

    # Retrieve recent interactions for the customer
    customer_interactions = interactions[interactions['customer_id'] == int(customer_id)]
    if not customer_interactions.empty:
        # Use the most recent interaction record
        interaction_data = customer_interactions.iloc[-1:]
    else:
        # Default interaction record if none exists
        interaction_data = pd.DataFrame([{'clicked': 0, 'viewed_duration': 0, 'comparison_count': 0, 'abandoned_cart': 0}])

    # Use all policies as candidates
    candidate_policies = policies.copy()
    num_candidates = candidate_policies.shape[0]

    # Replicate customer and interaction data to match candidate policies count
    customer_features_df = pd.concat([customer_data] * num_candidates, ignore_index=True)
    interaction_features_df = pd.concat([interaction_data] * num_candidates, ignore_index=True)

    # Preprocess data using our updated transformers that mimic training
    customer_features, policy_features, interaction_features = preprocess_data(
        customer_features_df, candidate_policies, interaction_features_df, PREPROCESS_CONFIG
    )

    # Load the pre-trained model
    model = load_model(MODEL_PATH)

    # Get predictions. Model expects a list: [customer_features, interaction_features, policy_features]
    predictions = model.predict([customer_features, interaction_features, policy_features])

    # Add predictions to candidate policies and return top recommendations
    candidate_policies['score'] = predictions
    recommended = candidate_policies.sort_values(by='score', ascending=False).head(top_n)
    result = recommended.to_dict(orient='records')
    return result
