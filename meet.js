const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'supersecretkey';

// Initialize Sequelize and SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './conference_room_booking.db'
});

// Define Room model
const Room = sequelize.define('Room', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
    }
});

// Define Booking model
const Booking = sequelize.define('Booking', {
    user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

// Establish relationships
Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

// Sync the database
sequelize.sync();

app.use(bodyParser.json());

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Create a room
app.post('/rooms', authenticateToken, async (req, res) => {
    try {
        const { name, capacity } = req.body;
        const room = await Room.create({ name, capacity });
        res.json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all rooms
app.get('/rooms', authenticateToken, async (req, res) => {
    const rooms = await Room.findAll();
    res.json(rooms);
});

