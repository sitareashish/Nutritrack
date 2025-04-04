<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smart Diet Planner</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js"></script>
</head>
<body>
    <!-- Input Fields, Results, Chart, etc. -->
    <button onclick="generateMealPlan()">Generate Meal Plan</button>
    <div id="meal-output"></div>

    <canvas id="progressChart" width="400" height="200"></canvas>

    <script>
        function calculateCalories(event) {
            const name = document.getElementById("name").value;
            const gender = document.getElementById("gender").value;
            const age = parseFloat(document.getElementById("age").value);
            const weight = parseFloat(document.getElementById("weight").value);
            const height = parseFloat(document.getElementById("height").value);
            const activity = parseFloat(document.getElementById("activity").value);

            if (!isNaN(age) && !isNaN(weight) && !isNaN(height) && age > 0 && weight > 0 && height > 0) {
                let bmr;
                if (gender.toLowerCase() === "female") {
                    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                } else {
                    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                }
                const calories = Math.round(bmr * activity);
                document.getElementById("calories-result").innerText = `Daily Calories: ${calories} kcal`;

                event?.preventDefault();

                fetch("http://127.0.0.1:5000/register", {
                    method: "POST",
                    body: JSON.stringify({
                        name, age, weight, height, gender, activity_level: activity, goal: "fit life"
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                })
                .then(response => {
                    alert(response.ok ? "User registered successfully!" : "Registration failed.");
                })
                .catch(error => {
                    console.error("Registration error:", error);
                    alert("Error connecting to server.");
                });
            } else {
                alert("Please fill all fields with valid numbers!");
            }
        }

        function generateMealPlan() {
            fetch("daily_food_nutrition_dataset.csv")
                .then(response => response.text())
                .then(csvText => {
                    Papa.parse(csvText, {
                        header: true,
                        complete: function(results) {
                            const data = results.data.filter(row => row.Meal_Type && row.Food_Item);

                            const mealsByType = {};
                            data.forEach(row => {
                                const type = row.Meal_Type.trim();
                                if (!mealsByType[type]) mealsByType[type] = [];
                                mealsByType[type].push(row);
                            });

                            const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
                            const plan = mealTypes.map(type => {
                                if (mealsByType[type]?.length > 0) {
                                    const meal = mealsByType[type][Math.floor(Math.random() * mealsByType[type].length)];
                                    return `<strong>${type}:</strong> ${meal.Food_Item} | ${meal.Calories} kcal, P: ${meal.Protein}g, C: ${meal.Carbohydrates}g, F: ${meal.Fat}g`;
                                }
                                return null;
                            }).filter(Boolean).join("<br>");

                            document.getElementById("meal-output").innerHTML = `<h3>Today's Meals:</h3>${plan}`;
                        },
                        error: function(error) {
                            console.error('Error parsing meal CSV:', error);
                            document.getElementById("meal-output").innerText = "Error loading meal plan.";
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching meal CSV:', error);
                    document.getElementById("meal-output").innerText = "Error loading meal plan.";
                });
        }

        function searchFood() {
            const foodName = document.getElementById("food-input").value.toLowerCase();
            let result = "Food not found in database";

            fetch('daily_food_nutrition_dataset.csv')
                .then(response => response.text())
                .then(csvText => {
                    Papa.parse(csvText, {
                        header: true,
                        complete: function(results) {
                            for (const item of results.data) {
                                if (item.Food_Item?.toLowerCase() === foodName) {
                                    result = `Food: ${foodName.toUpperCase()} | Calories: ${item.Calories} kcal | Fat: ${item.Fat}g | Carbs: ${item.Carbohydrates}g | Fiber: ${item.Fiber}g | Sugars: ${item.Sugars}g | Sodium: ${item.Sodium}mg`;
                                    break;
                                }
                            }
                            document.getElementById("food-result").innerText = result;
                        },
                        error: function(error) {
                            console.error('Error parsing CSV:', error);
                            document.getElementById("food-result").innerText = "Error loading data.";
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching CSV:', error);
                    document.getElementById("food-result").innerText = "Error loading data.";
                });
        }

        function processWeeklyReport() {
            const weights = Array.from({ length: 7 }, (_, i) => parseFloat(document.getElementById(`weight-day${i + 1}`).value));
            const validWeights = weights.filter(w => !isNaN(w));

            if (validWeights.length < 2) {
                alert("Please enter at least 2 days of data.");
                return;
            }

            const avgCalories = validWeights
                .map(w => 10 * w + 6.25 * 170 - 5 * 25 + 5)
                .map(bmr => bmr * 1.55)
                .reduce((a, b) => a + b, 0) / validWeights.length;

            document.getElementById("weekly-calories-result").innerText =
                `Average Daily Calorie Burn: ${Math.round(avgCalories)} kcal`;

            const labels = validWeights.map((_, i) => `Day ${i + 1}`);
            renderProgressChart(labels, validWeights);
        }

        let chartInstance = null;
        function renderProgressChart(labels, data) {
            const ctx = document.getElementById('progressChart').getContext('2d');
            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: "Weight Progress (kg)",
                        data,
                        borderColor: "#007bff",
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            title: { display: true, text: "Weight (kg)" }
                        },
                        x: {
                            title: { display: true, text: "Day" }
                        }
                    }
                }
            });
        }

        if (typeof module !== 'undefined') {
            module.exports = {
                calculateCalories,
                generateMealPlan,
                searchFood
            };
        }
    </script>
</body>
</html>