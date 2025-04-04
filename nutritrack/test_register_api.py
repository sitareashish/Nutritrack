import unittest
import requests

BASE_URL = "http://127.0.0.1:5000"

class TestUserRegistration(unittest.TestCase):

    def test_valid_users(self):
        test_users = [
            {
                "name": "Ashish",
                "age": 21,
                "weight": 70,
                "height": 175,
                "gender": "male",
                "activity_level": 1.55,
                "goal": "build muscle"
            },
            {
                "name": "Sangeeta",
                "age": 23,
                "weight": 60,
                "height": 160,
                "gender": "female",
                "activity_level": 1.2,
                "goal": "weight loss"
            },
            {
                "name": "Test123",
                "age": 30,
                "weight": 80,
                "height": 180,
                "gender": "male",
                "activity_level": 1.9,
                "goal": "fit life"
            }
        ]

        for user in test_users:
            with self.subTest(user=user):
                response = requests.post(f"{BASE_URL}/register", json=user)
                self.assertEqual(response.status_code, 200)
                self.assertIn("registered", response.text.lower())

    def test_invalid_user_data(self):
        invalid_users = [
            {
                "name": "",
                "age": 21,
                "weight": 70,
                "height": 175,
                "gender": "male",
                "activity_level": 1.55,
                "goal": "build muscle"
            },
            {
                "name": "InvalidAge",
                "age": -5,
                "weight": 60,
                "height": 160,
                "gender": "female",
                "activity_level": 1.2,
                "goal": "weight loss"
            },
            {
                "name": "NoGender",
                "age": 30,
                "weight": 80,
                "height": 180,
                "gender": "",
                "activity_level": 1.9,
                "goal": "fit life"
            }
        ]

        for user in invalid_users:
            with self.subTest(user=user):
                response = requests.post(f"{BASE_URL}/register", json=user)
                self.assertNotEqual(response.status_code, 200)  # Expecting failure
                self.assertIn("error", response.text.lower())  # Optional, if backend returns proper error

if __name__ == '__main__':
    unittest.main()
