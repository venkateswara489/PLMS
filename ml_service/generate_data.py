import pandas as pd
import numpy as np
import random
import os

def generate_random_data(num_students=100):
    topics = [
        "Variables", "Loops Basics", "Conditional Statements", 
        "Functions", "Arrays", "Dictionaries", 
        "Object Oriented Programming", "Exception Handling"
    ]
    
    data = []
    # simulate varying students
    for user_id in range(1, num_students + 1):
        num_topics_attempted = random.randint(4, len(topics))
        attempted_topics = random.sample(topics, num_topics_attempted)
        course_id = 101 # hardcode to a dummy course id
        
        for topic in attempted_topics:
            scores = random.randint(30, 100) # score out of 100
            # give less time spent to higher scores generally to simulate efficiency
            if scores > 80:
                time_spent = random.randint(10, 40)
            elif scores > 50:
                time_spent = random.randint(30, 80)
            else:
                time_spent = random.randint(60, 120)

            completion_status = 1 if scores >= 40 else 0
            attempts = random.randint(1, 3) if completion_status == 0 else random.randint(1, 2)
            
            data.append({
                "User ID": user_id,
                "Course ID": course_id,
                "Topic ID": topics.index(topic) + 1,
                "Topic Name": topic,
                "Quiz scores": scores,
                "Time spent": time_spent,
                "Completion status": completion_status,
                "Attempt count": attempts
            })
            
    df = pd.DataFrame(data)
    
    # Save the data relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "student_data.csv")
    df.to_csv(output_path, index=False)
    print(f"Dummy dataset generated at {output_path}")

if __name__ == "__main__":
    generate_random_data()
