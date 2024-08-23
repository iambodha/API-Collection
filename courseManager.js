const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const sequelize = new Sequelize('sqlite::memory:');

class Course extends Model {}
Course.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING
}, { sequelize, modelName: 'Course' });

class Student extends Model {}
Student.init({
    name: DataTypes.STRING
}, { sequelize, modelName: 'Student' });

class Enrollment extends Model {}
Enrollment.init({
    completed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, modelName: 'Enrollment' });

Course.hasMany(Enrollment, { as: 'students' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });
Student.hasMany(Enrollment, { as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });

sequelize.sync();

const app = express();
app.use(bodyParser.json());

app.post('/courses', async (req, res) => {
    const course = await Course.create(req.body);
    res.json(course);
});

app.get('/courses', async (req, res) => {
    const courses = await Course.findAll({ include: 'students' });
    res.json(courses);
});

app.post('/students', async (req, res) => {
    const student = await Student.create(req.body);
    res.json(student);
});

app.get('/students', async (req, res) => {
    const students = await Student.findAll({ include: 'enrollments' });
    res.json(students);
});

app.post('/enrollments', async (req, res) => {
    const enrollment = await Enrollment.create(req.body);
    res.json(enrollment);
});

app.put('/enrollments/:id/complete', async (req, res) => {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    enrollment.completed = true;
    await enrollment.save();
    res.json(enrollment);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
