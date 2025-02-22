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
        # For simplicity, we'll use the most recent interaction record (assuming data is ordered)
        interaction_data = customer_interactions.iloc[-1:]
    else:
        # If no interaction exists, create a default record with zeros
        interaction_data = pd.DataFrame([{'clicked': 0, 'viewed_duration': 0, 'comparison_count': 0, 'abandoned_cart': 0}])

    # Use all policies as candidates
    candidate_policies = policies.copy()

    # Number of candidate policies
    num_candidates = candidate_policies.shape[0]

    # Replicate the customer data and interaction data to match candidate policies count
    customer_features_df = pd.concat([customer_data] * num_candidates, ignore_index=True)
    interaction_features_df = pd.concat([interaction_data] * num_candidates, ignore_index=True)

    # Preprocess the data using the shared preprocessing routine.
    # This function should return preprocessed arrays for customer, policy, and interaction features.
    customer_features, policy_features, interaction_features = preprocess_data(
        customer_features_df, candidate_policies, interaction_features_df, PREPROCESS_CONFIG
    )

    # Load the pre-trained model
    model = load_model("./twotower.h5")

    # Get predictions. Model expects a list of inputs: [customer_features, interaction_features, policy_features]
    predictions = model.predict([customer_features, interaction_features, policy_features])

    # Add predictions (scores) to the candidate policies DataFrame
    candidate_policies['score'] = predictions
    # Sort policies by descending score and pick the top N
    recommended = candidate_policies.sort_values(by='score', ascending=False).head(top_n)

    # Convert the recommendations to a dictionary for JSON response
    result = recommended.to_dict(orient='records')
    return result
