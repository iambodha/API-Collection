const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const DATABASE_URL = 'sqlite::memory:';
const sequelize = new Sequelize(DATABASE_URL);

const app = express();
app.use(bodyParser.json());

class Booking extends Model {}
Booking.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bookingDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'confirmed'
    },
    isCancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Booking'
});

sequelize.sync();

app.post('/bookings/', async (req, res) => {
    try {
        const booking = await Booking.create(req.body);
        res.json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/bookings/', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    const bookings = await Booking.findAll({ offset: parseInt(skip), limit: parseInt(limit) });
    res.json(bookings);
});

app.get('/bookings/:id', async (req, res) => {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
});

app.put('/bookings/:id/cancel/', async (req, res) => {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    booking.isCancelled = true;
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
