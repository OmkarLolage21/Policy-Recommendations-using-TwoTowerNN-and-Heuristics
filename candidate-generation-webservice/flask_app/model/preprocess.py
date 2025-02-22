import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

def preprocess_data(customer_df, policy_df, interaction_df, config):
    """
    Preprocesses customer, policy, and interaction data using the provided configuration.
    Note: In production, persist and reuse the fitted transformers from training to ensure consistency.
    
    Parameters:
        customer_df (pd.DataFrame): DataFrame containing customer features.
        policy_df (pd.DataFrame): DataFrame containing policy features.
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

    # Clean numeric columns in policy_df: remove commas and convert to float
    for col in ['sum_assured (INR)', 'premium_amount (INR)']:
        if col in policy_df.columns:
            policy_df[col] = policy_df[col].astype(str).str.replace(',', '').astype(float)
    
    # Create a ColumnTransformer for customer features
    customer_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), customer_numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), customer_categorical_cols)
        ]
    )
    
    # Create a ColumnTransformer for policy features
    policy_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), policy_numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), policy_categorical_cols)
        ]
    )
    
    # Create a StandardScaler for interaction features
    interaction_preprocessor = StandardScaler()

    # Fit and transform the data
    customer_features = customer_preprocessor.fit_transform(customer_df)
    policy_features = policy_preprocessor.fit_transform(policy_df)
    interaction_features = interaction_preprocessor.fit_transform(interaction_df[interaction_numeric_cols])
    
    return customer_features, policy_features, interaction_features
