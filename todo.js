const express = require('express');
const app = express();
app.use(express.json());

let todos = [];

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the To-Do List API" });
});

app.get('/todos', (req, res) => {
    res.json({ todos });
});

app.get('/todo/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: "Todo item not found" });
    res.json({ todo });
});

app.post('/todo', (req, res) => {
    const { id, task, completed } = req.body;
    if (todos.find(t => t.id === id)) {
        return res.status(400).json({ message: "Todo item with this ID already exists" });
    }
    const newTodo = { id, task, completed: completed || false };
    todos.push(newTodo);
    res.json(newTodo);
});

app.put('/todo/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: "Todo item not found" });
    const { task, completed } = req.body;
    if (task) todo.task = task;
    if (typeof completed === 'boolean') todo.completed = completed;
    res.json({ message: "Task updated", todo });
});

app.put('/todo/:id/complete', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: "Todo item not found" });
    todo.completed = true;
    res.json({ message: "Task marked as completed", todo });
});

app.delete('/todo/:id', (req, res) => {
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (todoIndex === -1) return res.status(404).json({ message: "Todo item not found" });
    todos.splice(todoIndex, 1);
    res.json({ message: "Task deleted" });
});

app.delete('/todos/clear', (req, res) => {
    todos = [];
    res.json({ message: "All tasks deleted" });
});

app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter(t => t.completed);
    res.json({ todos: completedTodos });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
