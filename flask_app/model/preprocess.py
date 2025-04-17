import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from config import CUSTOMERS_CSV, POLICIES_CSV, INTERACTIONS_CSV

def preprocess_data(customer_df, policy_df, interaction_df, config):
    """
    Preprocesses customer, policy, and interaction data using the provided configuration.
    Instead of fitting on the small subset, we load the full historical (merged) data to fit the transformers,
    ensuring that the one-hot encodings and scalings match what was used during model training.
    
    Parameters:
        customer_df (pd.DataFrame): DataFrame containing customer features for inference.
        policy_df (pd.DataFrame): DataFrame containing candidate policy features.
        interaction_df (pd.DataFrame): DataFrame containing interaction features.
        config (dict): Dictionary with preprocessing configuration.
    
    Returns:
        tuple: (customer_features, policy_features, interaction_features) as numpy arrays.
    """
    # Extract column names from config
    customer_numeric_cols = config['customer_numeric_cols']
    customer_categorical_cols = config['customer_categorical_cols']
    policy_numeric_cols = config['policy_numeric_cols']
    policy_categorical_cols = config['policy_categorical_cols']
    interaction_numeric_cols = config['interaction_numeric_cols']

    # --- CUSTOMER FEATURES ---
    # Load full customers CSV to mimic training fitting
    full_customers = pd.read_csv(CUSTOMERS_CSV)
    full_customer_features = full_customers[customer_numeric_cols + customer_categorical_cols]
    
    customer_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), customer_numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), customer_categorical_cols)
        ]
    )
    # Fit on full customer data from training, then transform the inference customer_df
    customer_preprocessor.fit(full_customer_features)
    customer_features = customer_preprocessor.transform(customer_df)
    
    # --- POLICY FEATURES ---
    # Instead of fitting on candidate policies, load the merged training data
    customers_full = pd.read_csv(CUSTOMERS_CSV)
    policies_full = pd.read_csv(POLICIES_CSV)
    interactions_full = pd.read_csv(INTERACTIONS_CSV)
    
    # Merge to reproduce training data (as done in the Colab notebook)
    data_full = interactions_full.merge(customers_full, on='customer_id', how='left') \
                                 .merge(policies_full, on='policy_id', how='left')
    policy_fit_df = data_full[policy_numeric_cols + policy_categorical_cols]
    
    # Clean numeric columns in policy_fit_df: remove commas and convert to float
    for col in ['sum_assured (INR)', 'premium_amount (INR)']:
        if col in policy_fit_df.columns:
            policy_fit_df[col] = policy_fit_df[col].astype(str).str.replace(',', '').astype(float)
    
    # Also clean numeric columns in the candidate policy_df (if needed)
    for col in ['sum_assured (INR)', 'premium_amount (INR)']:
        if col in policy_df.columns:
            policy_df[col] = policy_df[col].astype(str).str.replace(',', '').astype(float)
    
    policy_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), policy_numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), policy_categorical_cols)
        ]
    )
    # Fit on the merged training data so that the categories match those seen during training
    policy_preprocessor.fit(policy_fit_df)
    policy_features = policy_preprocessor.transform(policy_df)
    
    # --- INTERACTION FEATURES ---
    # Load full interactions CSV for fitting
    full_interaction_features = pd.read_csv(INTERACTIONS_CSV)[interaction_numeric_cols]
    
    interaction_preprocessor = StandardScaler()
    interaction_preprocessor.fit(full_interaction_features)
    # Use only the specified numeric columns from the passed interaction_df
    interaction_features = interaction_preprocessor.transform(interaction_df[interaction_numeric_cols])
    
    return customer_features, policy_features, interaction_features
