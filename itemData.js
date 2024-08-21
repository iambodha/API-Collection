const express = require('express');
const app = express();
app.use(express.json());

let items = [];

app.get('/', (req, res) => {
    res.json({ message: "Welcome to ItemXpress!!!" });
});

app.get('/greet/:name', (req, res) => {
    const { name } = req.params;
    res.json({ message: `What's Good, ${name}!` });
});

app.post('/items', (req, res) => {
    const { id, name, description, price } = req.body;

    // Check for existing ID
    if (items.some(item => item.id === id)) {
        return res.status(400).json({ detail: "Item with this ID already exists :(" });
    }

    const newItem = { id, name, description, price };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.get('/items', (req, res) => {
    const { search } = req.query;

    // If a search query is provided, filter items by name
    if (search) {
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
        return res.json(filteredItems);
    }

    res.json(items);
});

app.get('/items/:item_id', (req, res) => {
    const { item_id } = req.params;
    const item = items.find(i => i.id == item_id);

    if (!item) {
        return res.status(404).json({ detail: "Item not found :(" });
    }

    res.json(item);
});

app.put('/items/:item_id', (req, res) => {
    const { item_id } = req.params;
    const { id, name, description, price } = req.body;

    const itemIndex = items.findIndex(i => i.id == item_id);

    if (itemIndex === -1) {
        return res.status(404).json({ detail: "Item not found :(" });
    }

    const updatedItem = { id, name, description, price };
    items[itemIndex] = updatedItem;
    res.json(updatedItem);
});

app.delete('/items/:item_id', (req, res) => {
    const { item_id } = req.params;
    const itemIndex = items.findIndex(i => i.id == item_id);

    if (itemIndex === -1) {
        return res.status(404).json({ detail: "Item not found :(" });
    }

    items.splice(itemIndex, 1);
    res.json({ message: "Item deleted successfully :)" });
});

// New feature: Get items in a price range
app.get('/items/price-range/:min/:max', (req, res) => {
    const { min, max } = req.params;
    const filteredItems = items.filter(item => item.price >= min && item.price <= max);
    
    if (filteredItems.length === 0) {
        return res.status(404).json({ detail: "No items found in this price range :(" });
    }

    res.json(filteredItems);
});

const port = 3000;
app.listen(port, () => {
    console.log(`ItemXpress server running on port ${port}`);
});
