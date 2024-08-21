const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

// Initialize the app and database connection
const app = express();
app.use(bodyParser.json());

const DATABASE_URL = 'sqlite:./employees.db';
const sequelize = new Sequelize(DATABASE_URL);

// Define Employee model
class Employee extends Model {}

Employee.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Employee',
  tableName: 'employees',
  timestamps: false,
});

// Sync the database
sequelize.sync();

// Add a new employee
app.post('/employees', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List employees with pagination and optional department filter
app.get('/employees', async (req, res) => {
  const { page = 1, size = 10, department } = req.query;
  const where = department ? { department } : {};

  try {
    const employees = await Employee.findAndCountAll({
      where,
      limit: parseInt(size),
      offset: (page - 1) * size,
    });
    res.json({
      data: employees.rows,
      total: employees.count,
      totalPages: Math.ceil(employees.count / size),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an employee by ID
app.put('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an employee by ID
app.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
