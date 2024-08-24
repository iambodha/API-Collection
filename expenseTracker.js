const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'expense_tracker';
let db;

client.connect().then(() => {
    console.log('Connected to database');
    db = client.db(dbName);
});

app.post('/expenses/', async (req, res) => {
    const expense = req.body;
    expense._id = new ObjectId();
    try {
        const result = await db.collection('expenses').insertOne(expense);
        res.json({ ...expense, _id: result.insertedId.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/expenses/', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    try {
        const expenses = await db.collection('expenses').find().skip(Number(skip)).limit(Number(limit)).toArray();
        res.json(expenses.map(expense => ({ ...expense, _id: expense._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/expenses/:expense_id', async (req, res) => {
    const { expense_id } = req.params;
    const expense = req.body;
    try {
        const result = await db.collection('expenses').updateOne({ _id: new ObjectId(expense_id) }, { $set: expense });
        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Expense not found' });
        } else {
            res.json({ ...expense, _id: expense_id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/expenses/:expense_id', async (req, res) => {
    const { expense_id } = req.params;
    try {
        const result = await db.collection('expenses').deleteOne({ _id: new ObjectId(expense_id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ error: 'Expense not found' });
        } else {
            res.json({ message: 'Expense deleted' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
