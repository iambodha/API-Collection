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

app.put('/content/:id', 
    body('title').notEmpty(),
    body('body').notEmpty(),
    body('content_type').notEmpty(),
    async (req, res) => {
        const { id } = req.params;
        const { title, body, content_type } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const content = await Content.findByPk(id);
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            content.title = title;
            content.body = body;
            content.content_type = content_type;
            await content.save();
            res.json(content);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update content' });
        }
    }
);

app.delete('/content/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        await content.destroy();
        res.json({ message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

app.get('/content/search', async (req, res) => {
    const { q } = req.query;
    try {
        const contents = await Content.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { title: { [Sequelize.Op.like]: `%${q}%` } },
                    { content_type: { [Sequelize.Op.like]: `%${q}%` } }
                ]
            }
        });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search content' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
