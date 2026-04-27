import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.tree import DecisionTreeClassifier
import pickle
import os

class PLMSRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        self.topic_encoder = LabelEncoder()
        self.knn = NearestNeighbors(n_neighbors=5, metric='cosine')
        self.dt_model = DecisionTreeClassifier()
        self.is_trained = False
        self.topics_mapping = {}
        
    def preprocess_and_engineer(self, df):
        # 1. Handle missing values
        df.fillna(0, inplace=True)
        
        # 2. Encode categorical data
        if 'Encoded Topic' not in df.columns:
            df['Encoded Topic'] = self.topic_encoder.fit_transform(df['Topic Name'])
            # Store topic mapping
            for idx, name in enumerate(self.topic_encoder.classes_):
                self.topics_mapping[idx] = name
        
        # 3. Feature Engineering
        # Calculate time efficiency (score/time)
        df['Time Efficiency'] = df.apply(
            lambda row: row['Quiz scores'] / row['Time spent'] if row['Time spent'] > 0 else 0, 
            axis=1
        )
        
        # 4. Normalize numerical features
        features_to_scale = ['Quiz scores', 'Time spent', 'Time Efficiency', 'Attempt count']
        # Create a copy to prevent SettingWithCopyWarning
        df_scaled = df.copy()
        df_scaled[features_to_scale] = self.scaler.fit_transform(df[features_to_scale])
        
        return df_scaled
        
    def train(self, data_path):
        df = pd.read_csv(data_path)
        processed_df = self.preprocess_and_engineer(df)
        
        # We aggregate user data to find similar users using KNN
        user_profiles = processed_df.groupby('User ID').agg({
            'Quiz scores': 'mean',
            'Time spent': 'mean',
            'Completion status': 'mean',
            'Time Efficiency': 'mean'
        }).reset_index()
        
        # If we have enough data, fit KNN
        if len(user_profiles) > 5:
            features = ['Quiz scores', 'Time spent', 'Completion status', 'Time Efficiency']
            self.knn.fit(user_profiles[features])
        
        # Basic decision tree to predict if strong/weak (1 or 0) based on Time Efficiency and attempts
        # Label: Strong if avg score > 0 (since it's normalized, mean is 0)
        user_profiles['Is_Strong'] = (user_profiles['Quiz scores'] > 0).astype(int)
        
        X = user_profiles[['Time spent', 'Time Efficiency']]
        y = user_profiles['Is_Strong']
        if len(y.unique()) > 1: # Ensure we have both classes
            self.dt_model.fit(X, y)
        
        self.is_trained = True
        self.user_profiles = user_profiles
        
        # Save model
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'plms_model.pkl')
        
        with open(model_path, 'wb') as f:
            pickle.dump({
                'scaler': self.scaler,
                'topic_encoder': self.topic_encoder,
                'knn': self.knn,
                'user_profiles': self.user_profiles,
                'topics_mapping': self.topics_mapping,
                'dt_model': self.dt_model
            }, f)
        print(f"Model trained and saved to {model_path}.")
        
    def load_model(self, model_path='plms_model.pkl'):
        # Try relative to this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        full_path = os.path.join(script_dir, model_path)
        
        if os.path.exists(full_path):
            with open(full_path, 'rb') as f:
                data = pickle.load(f)
                self.scaler = data['scaler']
                self.topic_encoder = data['topic_encoder']
                self.knn = data.get('knn')
                self.user_profiles = data.get('user_profiles')
                self.topics_mapping = data.get('topics_mapping', {})
                self.dt_model = data.get('dt_model')
                self.is_trained = True
        else:
            raise FileNotFoundError(f"Model file not found at {full_path}")
                
    def get_recommendations(self, user_id):
        if not self.is_trained:
            self.load_model()
            
        try:
            # We assume dummy data is available for lookup
            script_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(script_dir, 'student_data.csv')
            df = pd.read_csv(data_path)
            user_data = df[df['User ID'] == int(user_id)]
            
            if user_data.empty:
                return {
                    "user_id": user_id,
                    "recommended_topics": ["Variables", "Loops Basics"],
                    "difficulty": "Beginner",
                    "reason": "New user with no history, starting with foundational topics"
                }
                
            # Find weakest topic (lowest raw score)
            weakest_idx = user_data['Quiz scores'].idxmin()
            weakest_topic_row = user_data.loc[weakest_idx]
            weak_score = weakest_topic_row['Quiz scores']
            weak_topic = weakest_topic_row['Topic Name']
            
            # Recommendation Logic Rule
            if weak_score < 50:
                difficulty = "Beginner"
                action = "recommend beginner content to strengthen foundations"
                topics = [weak_topic]
            elif weak_score < 80:
                difficulty = "Intermediate"
                action = "recommend practice quizzes"
                topics = [weak_topic]
            else:
                difficulty = "Advanced"
                action = "recommend advanced topics based on strong performance"
                attempted = user_data['Topic Name'].tolist()
                all_topics = list(self.topics_mapping.values())
                unattempted = [t for t in all_topics if t not in attempted]
                topics = unattempted[:2] if unattempted else ["Advanced Masterclass Project"]
            
            # Use KNN to find similar users if we wanted to expand topics
            # omitted for simplicity, but object is available
            
            return {
                "user_id": user_id,
                "recommended_topics": topics,
                "difficulty": difficulty,
                "reason": f"Score of {weak_score} in {weak_topic} - {action}"
            }
            
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    recommender = PLMSRecommender()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'student_data.csv')
    recommender.train(data_path)
    print("Test recommendation for User 1:")
    print(recommender.get_recommendations(1))
