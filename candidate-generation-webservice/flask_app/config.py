import os

# Base directory of the application
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Data directory and CSV file paths
DATA_DIR = os.path.join(BASE_DIR, 'data')
CUSTOMERS_CSV = os.path.join(DATA_DIR, 'customers.csv')
POLICIES_CSV = os.path.join(DATA_DIR, 'policies.csv')
INTERACTIONS_CSV = os.path.join(DATA_DIR, 'interactions.csv')

# Model path (if you decide to save and load a pre-trained model)
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'saved_model.h5')

# Preprocessing configuration
PREPROCESS_CONFIG = {
    'customer_numeric_cols': ['age', 'policy_ownership_count', 'credit_score'],
    'customer_categorical_cols': ['gender', 'income_bracket', 'employment_status',
                                  'marital_status', 'location_city', 'preferred_policy_type'],
    'policy_numeric_cols': ['sum_assured (INR)', 'premium_amount (INR)', 'policy_duration_years'],
    'policy_categorical_cols': ['policy_type', 'risk_category', 'customer_target_group'],
    'interaction_numeric_cols': ['clicked', 'viewed_duration', 'comparison_count', 'abandoned_cart']
}
