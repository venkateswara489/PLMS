from flask import Flask, jsonify, request
from recommender import PLMSRecommender

app = Flask(__name__)
recommender = PLMSRecommender()

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """
    Endpoint to get course recommendations based on user performance.
    Input: { user_id, score, progress }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        score = data.get('score', 0)
        progress = data.get('progress', 0)

        if not user_id:
            return jsonify({"status": "error", "message": "user_id is required"}), 400

        # Get recommendations from the recommender
        recommendation = recommender.get_recommendations(user_id)
        
        if "error" in recommendation:
            return jsonify({"status": "error", "message": recommendation["error"]}), 500
        
        # Add score and progress context to response
        recommendation['user_score'] = score
        recommendation['user_progress'] = progress
        
        return jsonify(recommendation), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/recommend/<int:user_id>', methods=['GET'])
def get_recommendations_by_id(user_id):
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
        
    app.run(host='0.0.0.0', port=5001, debug=True)
