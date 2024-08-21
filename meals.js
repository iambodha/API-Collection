const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize('sqlite::memory:');

class Meal extends Model {}
Meal.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    day: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, { 
    sequelize, 
    modelName: 'Meal',
    tableName: 'meals',
});

sequelize.sync();

async function addMeal(req, res) {
    const { name, day } = req.body;
    try {
        const meal = await Meal.create({ name, day });
        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add meal' });
    }
}

async function listMeals(req, res) {
    try {
        const meals = await Meal.findAll({
            order: [['day', 'ASC']],
        });
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list meals' });
    }
}

async function updateMeal(req, res) {
    const { meal_id } = req.params;
    const { name, day } = req.body;
    try {
        const meal = await Meal.findByPk(meal_id);
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }
        meal.name = name;
        meal.day = day;
        await meal.save();
        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update meal' });
    }
}

async function deleteMeal(req, res) {
    const { meal_id } = req.params;
    try {
        const meal = await Meal.findByPk(meal_id);
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }
        await meal.destroy();
        res.json({ message: 'Meal deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete meal' });
    }
}

app.post('/meals', addMeal);
app.get('/meals', listMeals);
app.put('/meals/:meal_id', updateMeal);
app.delete('/meals/:meal_id', deleteMeal);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
