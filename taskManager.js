const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './task_time_tracking.db'
});

class Task extends Model {}
Task.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Task'
});

class TimeEntry extends Model {}
TimeEntry.init({
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'TimeEntry'
});

Task.hasMany(TimeEntry, { as: 'timeEntries', foreignKey: 'taskId' });
TimeEntry.belongsTo(Task, { foreignKey: 'taskId' });

sequelize.sync();

app.post('/tasks', async (req, res) => {
    const task = await Task.create({ name: req.body.name });
    res.json(task);
});

app.get('/tasks', async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
});

app.post('/tasks/:taskId/start', async (req, res) => {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const timeEntry = await TimeEntry.create({
        taskId: req.params.taskId,
        startTime: req.body.startTime
    });
    res.json(timeEntry);
});

app.put('/tasks/:taskId/stop/:entryId', async (req, res) => {
    const timeEntry = await TimeEntry.findOne({
        where: {
            id: req.params.entryId,
            taskId: req.params.taskId,
            endTime: null
        }
    });
    if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found or already stopped' });
    }
    timeEntry.endTime = new Date();
    await timeEntry.save();
    res.json(timeEntry);
});

app.get('/tasks/:taskId/time_entries', async (req, res) => {
    const timeEntries = await TimeEntry.findAll({
        where: { taskId: req.params.taskId }
    });
    res.json(timeEntries);
});

app.delete('/tasks/:taskId', async (req, res) => {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    await task.destroy();
    res.status(204).send();
});

app.delete('/tasks/:taskId/time_entries/:entryId', async (req, res) => {
    const timeEntry = await TimeEntry.findOne({
        where: {
            id: req.params.entryId,
            taskId: req.params.taskId
        }
    });
    if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
    }
    await timeEntry.destroy();
    res.status(204).send();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
