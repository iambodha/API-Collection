const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './elearning_platform.db'
});

class Course extends Model {}
Course.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'course' });

class Student extends Model {}
Student.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: 'student' });

class Enrollment extends Model {}
Enrollment.init({
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'enrollment'
});

Course.hasMany(Enrollment, { as: 'students' });
Enrollment.belongsTo(Course);
Student.hasMany(Enrollment, { as: 'enrollments' });
Enrollment.belongsTo(Student);

sequelize.sync();

app.post('/courses', async (req, res) => {
    const { title, description } = req.body;
    const course = await Course.create({ title, description });
    res.json(course);
});

app.get('/courses', async (req, res) => {
    const courses = await Course.findAll({ include: 'students' });
    res.json(courses);
});

app.post('/students', async (req, res) => {
    const { name } = req.body;
    const student = await Student.create({ name });
    res.json(student);
});

app.get('/students', async (req, res) => {
    const students = await Student.findAll({ include: 'enrollments' });
    res.json(students);
});

app.post('/enrollments', async (req, res) => {
    const { courseId, studentId } = req.body;
    const enrollment = await Enrollment.create({ courseId, studentId });
    res.json(enrollment);
});

app.put('/enrollments/:id/progress', async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollment.progress = progress;
    enrollment.completed = progress === 100;
    await enrollment.save();

    res.json(enrollment);
});

app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    await Course.destroy({ where: { id } });
    res.status(204).send();
});

app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    await Student.destroy({ where: { id } });
    res.status(204).send();
});

app.delete('/enrollments/:id', async (req, res) => {
    const { id } = req.params;
    await Enrollment.destroy({ where: { id } });
    res.status(204).send();
});

app.get('/courses/:courseId/students/:studentId', async (req, res) => {
    const { courseId, studentId } = req.params;
    const enrollment = await Enrollment.findOne({ where: { courseId, studentId } });

    if (!enrollment) {
        return res.status(404).json({ error: 'Student is not enrolled in this course' });
    }

    res.json(enrollment);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
