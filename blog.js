const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const DATABASE_URL = 'sqlite::memory:';
const SECRET_KEY = 'arcade_is_amazing';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

const sequelize = new Sequelize(DATABASE_URL);

class User extends Model {}
User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: 'User' });

class BlogPost extends Model {}
BlogPost.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, { sequelize, modelName: 'BlogPost' });

User.hasMany(BlogPost, { foreignKey: 'userId', as: 'posts' });
BlogPost.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

sequelize.sync();

const app = express();
app.use(bodyParser.json());

const generateAccessToken = (data, expiresIn = '30m') => {
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM, expiresIn });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', body('username').notEmpty(), body('password').notEmpty(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ username, hashedPassword });
        res.status(201).json({ username: user.username });
    } catch (error) {
        res.status(400).json({ error: 'Username already taken' });
    }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
