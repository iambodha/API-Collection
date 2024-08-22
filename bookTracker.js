const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './reading.db',
});

const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
});

sequelize.sync();

app.use(bodyParser.json());

app.post('/books', async (req, res) => {
    try {
        const { title, author } = req.body;
        const book = await Book.create({ title, author });
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/books', async (req, res) => {
    const { search, sort_by, order = 'ASC', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let queryOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset),
    };

    if (search) {
        queryOptions.where = {
            [Sequelize.Op.or]: [
                { title: { [Sequelize.Op.like]: `%${search}%` } },
                { author: { [Sequelize.Op.like]: `%${search}%` } },
            ],
        };
    }

    if (sort_by) {
        queryOptions.order = [[sort_by, order]];
    }

    const books = await Book.findAndCountAll(queryOptions);
    res.json({
        total: books.count,
        pages: Math.ceil(books.count / limit),
        data: books.rows,
    });
});

app.put('/books/:book_id', async (req, res) => {
    try {
        const { book_id } = req.params;
        const { progress, rating } = req.body;
        const book = await Book.findByPk(book_id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (progress !== undefined) book.progress = progress;
        if (rating !== undefined) book.rating = rating;

        await book.save();
        res.json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/books/:book_id', async (req, res) => {
    try {
        const { book_id } = req.params;
        const book = await Book.findByPk(book_id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        await book.destroy();
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
