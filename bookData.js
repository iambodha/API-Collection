const express = require('express');
const app = express();
const PORT = 3000;

// Mock Data
const booksData = {
    "1": { "title": "Pride and Prejudice", "author": "Jane Austen", "year": 1813 },
    "2": { "title": "Moby-Dick", "author": "Herman Melville", "year": 1851 },
    "3": { "title": "The Catcher in the Rye", "author": "J.D. Salinger", "year": 1951 },
    "4": { "title": "The Hobbit", "author": "J.R.R. Tolkien", "year": 1937 },
    "5": { "title": "War and Peace", "author": "Leo Tolstoy", "year": 1869 }
};

// Home route
app.get('/', (req, res) => {
    res.json({ message: "Hello! This is the Book Collection API" });
});

// Fetch details about a book using its ID
app.get('/book/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    if (booksData[bookId]) {
        res.json({ book_id: bookId, details: booksData[bookId] });
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// List all available books
app.get('/books', (req, res) => {
    res.json({ books: booksData });
});

// Find books by a specific author
app.get('/books/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = Object.entries(booksData)
        .filter(([id, info]) => info.author.toLowerCase() === author)
        .reduce((acc, [id, info]) => {
            acc[id] = info;
            return acc;
        }, {});

    if (Object.keys(result).length > 0) {
        res.json({ books_by_author: author, details: result });
    } else {
        res.status(404).json({ error: "No books found by this author" });
    }
});

// Feature 1: Add a new book
app.post('/books', express.json(), (req, res) => {
    const newId = String(Object.keys(booksData).length + 1);
    const { title, author, year } = req.body;

    if (title && author && year) {
        booksData[newId] = { title, author, year };
        res.status(201).json({ message: "Book added", book_id: newId, details: booksData[newId] });
    } else {
        res.status(400).json({ error: "Invalid book data" });
    }
});

// Feature 2: Delete a book by its ID
app.delete('/book/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    if (booksData[bookId]) {
        delete booksData[bookId];
        res.json({ message: `Book with ID ${bookId} deleted` });
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
