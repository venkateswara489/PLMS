from flask import Flask, jsonify
from recommender import PLMSRecommender

app = Flask(__name__)
recommender = PLMSRecommender()

@app.route('/api/recommend/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    """
    Endpoint to get topics recommendation for a specific user based on their performance.
    """
    try:
        recommendation = recommender.get_recommendations(user_id)
        if "error" in recommendation:
            return jsonify({"status": "error", "message": recommendation["error"]}), 500
        
        return jsonify(recommendation), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ML Recommendation"}), 200

if __name__ == '__main__':
    # Initialize recommender by attempting to load the model early on
    try:
        recommender.load_model()
        print("Model loaded successfully on startup.")
    except FileNotFoundError:
        print("No pre-trained model found. Make sure to train the model first.")
        
    app.run(host='0.0.0.0', port=5000, debug=True)
