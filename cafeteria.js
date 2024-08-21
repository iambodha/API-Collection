const express = require('express');
const app = express();

app.use(express.json());

let menu = {
    "1": { "name": "Pizza", "description": "Cheesy pepperoni pizza", "price": 12.0 },
    "2": { "name": "Sushi", "description": "Fresh sushi platter", "price": 18.5 },
    "3": { "name": "Steak", "description": "Grilled ribeye steak", "price": 25.0 }
};

let bookings = [];

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Restaurant Food Booking API" });
});

app.get('/menu', (req, res) => {
    res.json({ menu });
});

app.post('/book', (req, res) => {
    const { meal_id, customer_name, quantity } = req.body;

    if (!menu[meal_id]) {
        return res.status(404).json({ detail: "Meal not found" });
    }
    if (quantity < 1) {
        return res.status(400).json({ detail: "Quantity must be at least 1" });
    }

    const booking = { meal_id, customer_name, quantity };
    bookings.push(booking);
    res.json(booking);
});

app.get('/bookings', (req, res) => {
    res.json({ bookings });
});

// New Feature: Get a specific booking
app.get('/bookings/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (index >= 0 && index < bookings.length) {
        res.json(bookings[index]);
    } else {
        res.status(404).json({ detail: "Booking not found" });
    }
});

// New Feature: Update a booking
app.put('/bookings/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (index >= 0 && index < bookings.length) {
        const { meal_id, customer_name, quantity } = req.body;

        if (meal_id && !menu[meal_id]) {
            return res.status(404).json({ detail: "Meal not found" });
        }
        if (quantity && quantity < 1) {
            return res.status(400).json({ detail: "Quantity must be at least 1" });
        }

        const updatedBooking = { ...bookings[index], ...req.body };
        bookings[index] = updatedBooking;
        res.json(updatedBooking);
    } else {
        res.status(404).json({ detail: "Booking not found" });
    }
});

// New Feature: Delete a booking
app.delete('/bookings/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (index >= 0 && index < bookings.length) {
        bookings.splice(index, 1);
        res.json({ detail: "Booking deleted successfully" });
    } else {
        res.status(404).json({ detail: "Booking not found" });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
