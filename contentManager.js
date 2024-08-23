const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const sequelize = new Sequelize('sqlite::memory:');

class Content extends Model {}
Content.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    content_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    published_on: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    sequelize,
    modelName: 'Content',
    tableName: 'content'
});

sequelize.sync();

const app = express();
app.use(bodyParser.json());

app.post('/content', 
    body('title').notEmpty(),
    body('body').notEmpty(),
    body('content_type').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, body, content_type } = req.body;

        try {
            const newContent = await Content.create({ title, body, content_type });
            res.status(201).json(newContent);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create content' });
        }
    }
);

app.get('/content', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    try {
        const contents = await Content.findAll({ offset: parseInt(skip), limit: parseInt(limit) });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

app.get('/content/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});


