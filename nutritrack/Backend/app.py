from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import math
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nutritrack.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    activity_level = db.Column(db.String(50), nullable=False)
    goal = db.Column(db.String(50), nullable=False)

# BMR & TDEE Calculation
def calculate_bmr_tdee(weight, height, age, gender, activity_level):
    if gender.lower() == 'male':
        bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)
    else:
        bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)
    
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    tdee = bmr * activity_multipliers.get(activity_level, 1.2)
    return bmr, tdee

# checking the working
@app.route('/', methods=['GET'])
def testing():
    return "hi"

# User Registration
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    print(data)
    new_user = User(
        name=data['name'], age=data['age'], weight=data['weight'],
        height=data['height'], gender=data['gender'], activity_level=data['activity_level'],
        goal=data['goal']
    )
    print(new_user)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

# Calculate BMR & TDEE
# @app.route('/calculate', methods=['POST'])
# def calculate():
#     data = request.json
#     bmr, tdee = calculate_bmr_tdee(data['weight'], data['height'], data['age'], data['gender'], data['activity_level'])
#     return jsonify({"BMR": bmr, "TDEE": tdee})

@app.route('/calculate', methods=['POST'])
def calculate():
    return jsonify({"message": "API working!"})


# Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
