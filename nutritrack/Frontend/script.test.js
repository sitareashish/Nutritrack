/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Load HTML file
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Smart Diet Planner - NUTRITRACK', () => {
    let script;

    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        script = require('./script'); // Ensure your script exports testable functions
    });

    test('calculateCalories calculates and displays correct calories', () => {
        document.getElementById("name").value = "Ashish";
        document.getElementById("age").value = 20;
        document.getElementById("weight").value = 70;
        document.getElementById("height").value = 175;
        document.getElementById("gender").value = "Male";
        document.getElementById("activity").value = 1.55;

        // Simulate a fake event
        const fakeEvent = { preventDefault: jest.fn() };
        script.calculateCalories(fakeEvent);

        const output = document.getElementById("calories-result").innerText;
        expect(output).toMatch(/Daily Calories: \d+ kcal/);
    });

    test('generateMealPlan returns 3 random meals', () => {
        script.generateMealPlan();
        const output = document.getElementById("meal-output").innerText;
        const meals = output.split(':')[1].split(',').map(m => m.trim());
        expect(meals.length).toBe(3);
    });

    test('searchFood finds correct food info from CSV', async () => {
        // Mock fetch to return CSV text
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve("Food_Item,Calories,Fat,Carbohydrates,Fiber,Sugars,Sodium\nOatmeal,150,5,27,4,1,50")
            })
        );

        document.getElementById("food-input").value = "Oatmeal";
        await script.searchFood();

        const result = document.getElementById("food-result").innerText;
        expect(result).toMatch(/Food: oatmeal: Calories: 150kcal/);
    });
});
