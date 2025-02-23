from flask import Flask, request, jsonify
from model.inference import recommend_policies

app = Flask(__name__)

@app.route('/recommend_policies', methods=['GET'])
def recommend():
    # Get the customer_id from query parameters
    customer_id = request.args.get('customer_id')
    if not customer_id:
        return jsonify({'error': 'Missing customer_id parameter'}), 400

    # Call the recommendation function for the given customer_id.
    # This function loads CSVs, preprocesses data using full historical data to ensure consistent feature shapes,
    # performs inference, and returns recommended policies.
    recommendations = recommend_policies(customer_id)
    
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
