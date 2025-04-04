/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load HTML and JS
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
let functions;

describe('Smart Diet Planner Tests', () => {
    let dom;
    let document;

    beforeEach(() => {
        dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
        document = dom.window.document;

        // Simulate input fields required by calculateCalories
        document.body.innerHTML += `
            <input id="name" value="Jacob">
            <input id="gender" value="male">
            <input id="age" value="25">
            <input id="weight" value="70">
            <input id="height" value="170">
            <input id="activity" value="1.55">
            <div id="calories-result"></div>
        `;

        // Exported functions from the script tag
        functions = require('./index.html');
    });

    test('calculateCalories calculates and displays correct result', async () => {
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            })
        );
        global.fetch = mockFetch;

        const event = { preventDefault: jest.fn() };
        await functions.calculateCalories(event);

        expect(document.getElementById("calories-result").textContent).toContain('Daily Calories:');
        expect(mockFetch).toHaveBeenCalled();
    });

    test('generateMealPlan fetches CSV and parses data', async () => {
        const csvMock = `
            Meal_Type,Food_Item,Calories,Protein,Carbohydrates,Fat
            Breakfast,Oats,300,10,40,5
            Lunch,Rice & Dal,500,15,70,10
            Dinner,Grilled Chicken,400,35,10,15
            Snack,Fruit Salad,150,2,30,1
        `;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(csvMock)
            })
        );

        document.body.innerHTML += `<div id="meal-output"></div>`;
        await functions.generateMealPlan();

        const output = document.getElementById("meal-output").innerHTML;
        expect(output).toContain("Today's Meals:");
        expect(output).toMatch(/Breakfast:|Lunch:|Dinner:|Snack:/);
    });

    test('searchFood displays food information if found', async () => {
        const csvMock = `
            Food_Item,Calories,Fat,Carbohydrates,Fiber,Sugars,Sodium
            Banana,100,0.3,27,3,14,1
        `;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(csvMock)
            })
        );

        document.body.innerHTML += `
            <input id="food-input" value="banana">
            <div id="food-result"></div>
        `;

        await functions.searchFood();

        const result = document.getElementById("food-result").innerText;
        expect(result).toContain("BANANA");
        expect(result).toContain("Calories: 100 kcal");
    });

    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });
});
