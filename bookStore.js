const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const DATABASE_URL = 'postgresql://user:password@localhost/bookstore';

const sequelize = new Sequelize(DATABASE_URL);

class Book extends Model {}

Book.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Book',
    tableName: 'books'
});

sequelize.sync();

const app = express();
app.use(bodyParser.json());

app.post('/books', async (req, res) => {
    const book = await Book.create(req.body);
    res.json(book);
});

app.get('/books', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    const books = await Book.findAll({ offset: parseInt(skip), limit: parseInt(limit) });
    res.json(books);
});

app.put('/books/:bookId', async (req, res) => {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
        return res.status(404).json({ detail: 'Book not found' });
    }
    await book.update(req.body);
    res.json(book);
});

app.delete('/books/:bookId', async (req, res) => {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
        return res.status(404).json({ detail: 'Book not found' });
    }
    await book.destroy();
    res.json({ message: 'Book deleted' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
