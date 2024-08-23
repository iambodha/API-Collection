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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
