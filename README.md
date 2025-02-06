# SBI Hackathon Project

## Table of Contents
- [Introduction](#introduction)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Future Incorporations](#future-incorporations)
- [Setup Guide](#setup-guide)
- [Contributing](#contributing)
- [License](#license)

## Introduction
**[Provide a brief overview of the project, its purpose, and key objectives.]**

## System Architecture
**[Explain the architecture of the system, including components, interactions, and technologies used. You can add diagrams if needed.]**

## Data Model
The dataset consists of multiple structured tables:

### 1️⃣ Customers Table (customers.csv)
Contains structured demographic and financial details of customers.

| Column Name              | Data Type     | Description |
|--------------------------|--------------|-------------|
| customer_id             | INT (PK)     | Unique identifier for the customer |
| age                     | INT          | Customer age |
| gender                  | VARCHAR(10)  | Gender (Male, Female, Other) |
| income_bracket          | VARCHAR(20)  | Low, Medium, High |
| employment_status       | VARCHAR(50)  | Salaried, Self-Employed, Retired |
| marital_status         | VARCHAR(20)  | Single, Married, Divorced |
| location_city          | VARCHAR(100) | Customer city |
| policy_ownership_count | INT          | Active policies owned |
| last_policy_purchase_date | DATE       | Last purchased policy date |
| credit_score           | FLOAT        | Creditworthiness of the customer |
| preferred_policy_type  | VARCHAR(50)  | Term, Health, ULIP, etc. |

### 2️⃣ Policies Table (policies.csv)
Contains metadata of life insurance policies.

| Column Name             | Data Type     | Description |
|-------------------------|--------------|-------------|
| policy_id              | INT (PK)     | Unique identifier for the policy |
| policy_name           | VARCHAR(255) | Name of the policy |
| policy_type          | VARCHAR(50)  | Term, Whole Life, Health, etc. |
| sum_assured         | FLOAT        | Total coverage amount |
| premium_amount     | FLOAT        | Monthly/Yearly premium |
| policy_duration_years | INT        | Duration of policy |
| policy_provider      | VARCHAR(100) | Insurance company name |
| risk_category       | VARCHAR(50)  | High, Medium, Low risk policy |
| customer_target_group | VARCHAR(50) | Example: "Young Professionals, Retirees" |
| description         | TEXT        | Full policy description |
| keywords           | TEXT        | Keywords extracted (e.g., "term, critical illness, family, investment") |
| embedding_vector   | VECTOR(768) | Vector representation of the policy description |

### 3️⃣ User-Policy Interaction Table (interactions.csv)
Captures behavioral interactions between users and policies.

| Column Name          | Data Type  | Description |
|----------------------|-----------|-------------|
| interaction_id      | INT (PK)  | Unique ID for interaction |
| customer_id        | INT (FK)  | Customer ID |
| policy_id          | INT (FK)  | Policy ID |
| clicked           | BOOLEAN   | Whether the policy was clicked |
| viewed_duration   | FLOAT     | Time spent on policy page (seconds) |
| purchased        | BOOLEAN   | Whether the user bought this policy |
| comparison_count  | INT       | Number of times the policy was compared |
| abandoned_cart   | BOOLEAN   | If the policy was added to cart but not purchased |

### 4️⃣ Session Behavior Table (session_behavior.csv)
Tracks session-based behavioral insights for Google Analytics and ranking refinements.

| Column Name                  | Data Type     | Description |
|------------------------------|--------------|-------------|
| session_id                  | VARCHAR(50)  | Unique session ID |
| customer_id                 | INT (FK)     | Customer ID |
| search_keywords             | TEXT         | Keywords entered in search |
| policy_clicked_count        | INT          | Number of policies clicked in session |
| premium_adjusted            | BOOLEAN      | If the user changed coverage amounts |
| recommended_policy_clicked  | BOOLEAN      | Whether the user clicked a recommended policy |
| google_search_tracking     | BOOLEAN      | Whether external search data was available |

### 5️⃣ Policy Corpus Dataset (policy_corpus.csv)
For semantic search and embedding models, we store policy descriptions.

| Column Name       | Data Type     | Description |
|------------------|--------------|-------------|
| policy_id       | INT (PK)     | Reference to policies.csv |
| policy_name     | VARCHAR(255) | Name of the policy |
| description     | TEXT        | Full description of the policy |
| keywords       | TEXT        | Extracted keywords |
| embeddings     | VECTOR(768) | Policy embeddings (if using vector database) |

### 6️⃣ Derived Features for XGBoost Training (xgboost_train.csv)
This dataset aggregates features for ranking models.

| Column Name               | Data Type     | Description |
|---------------------------|--------------|-------------|
| customer_id              | INT          | Unique ID for the customer |
| policy_id                | INT          | Unique ID for the policy |
| age                      | INT          | Age of the customer |
| income_bracket_encoded   | INT          | Encoded income bracket |
| employment_status_encoded| INT          | Encoded job type |
| marital_status_encoded   | INT          | Encoded marital status |
| credit_score             | FLOAT        | Customer credit score |
| policy_type_encoded      | INT          | Encoded policy type |
| policy_risk_category     | INT          | Encoded risk category |
| click_probability        | FLOAT        | Predicted probability of clicking |
| purchase_probability     | FLOAT        | Predicted probability of purchase |
| session_engagement_score | FLOAT        | Time spent + comparison count |

## Final Data Flow
1️⃣ **Data Collection** → User actions, policy details, and historical transactions are recorded.
2️⃣ **Feature Engineering** → Convert categorical data into numeric features (encoding).
3️⃣ **Model Training**
   - XGBoost → Uses xgboost_train.csv to learn ranking.
   - Two-Tower NN → Uses policy_corpus.csv for embedding-based matching.
4️⃣ **Real-Time Inference**
   - API returns ranked policies based on customer behavior.
   - Google Analytics updates behavioral insights for dynamic recommendations.

## Future Incorporations
**[List potential enhancements, new features, and improvements planned for future versions.]**

## Setup Guide
### Prerequisites
**[List the dependencies, tools, and environments required to set up the project.]**

### Installation Steps
1. **[Clone the repository]**
   ```bash
   git clone https://github.com/your-repo/sbi-hackathon.git
   ```
2. **[Navigate to the project directory]**
   ```bash
   cd sbi-hackathon
   ```
3. **[Install dependencies]**
   ```bash
   [Add relevant command here]
   ```
4. **[Run the application]**
   ```bash
   [Add relevant command here]
   ```

## Contributing
**[Provide guidelines for contributing, including coding standards, branching strategies, and pull request procedures.]**

## License
**[Specify the license under which the project is distributed.]**