const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const DATABASE_URL = 'sqlite::memory:';
const sequelize = new Sequelize(DATABASE_URL);

class Car extends Model {}
Car.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Car',
    tableName: 'cars',
    timestamps: false
});

sequelize.sync();

const app = express();
app.use(bodyParser.json());

app.post('/cars', async (req, res) => {
    try {
        const car = await Car.create(req.body);
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/cars', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    const cars = await Car.findAll({ offset: parseInt(skip), limit: parseInt(limit) });
    res.json(cars);
});

app.put('/cars/:carId/rent', async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.carId);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        if (!car.available) return res.status(400).json({ error: 'Car already rented' });
        car.available = false;
        await car.save();
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/cars/:carId/return', async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.carId);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        if (car.available) return res.status(400).json({ error: 'Car is not rented' });
        car.available = true;
        await car.save();
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/cars/:carId', async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.carId);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        await car.destroy();
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/cars/:carId', async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.carId);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        await car.update(req.body);
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/cars/search', async (req, res) => {
    const { make, model } = req.query;
    const whereClause = {};
    if (make) whereClause.make = make;
    if (model) whereClause.model = model;
    const cars = await Car.findAll({ where: whereClause });
    res.json(cars);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
