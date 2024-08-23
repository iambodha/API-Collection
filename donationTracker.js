const express = require('express');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './donation_management.db'
});

class Donor extends Model {}
Donor.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: 'Donor' });

class Donation extends Model {}
Donation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    donor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Donor,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, { sequelize, modelName: 'Donation' });

Donor.hasMany(Donation, { foreignKey: 'donor_id' });
Donation.belongsTo(Donor, { foreignKey: 'donor_id' });

sequelize.sync();

app.post('/donors', async (req, res) => {
    const { name, email } = req.body;
    try {
        const donor = await Donor.create({ name, email });
        res.json(donor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
