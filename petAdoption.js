import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './pet_haven.db',
});

const Pet = sequelize.define('Pet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    species: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    adopted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

sequelize.sync();

app.post('/creatures', async (req, res) => {
    try {
        const pet = await Pet.create(req.body);
        res.json(pet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/creatures', async (req, res) => {
    const pets = await Pet.findAll();
    res.json(pets);
});

app.put('/creatures/:pet_id/adopt', async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.pet_id);
        if (!pet) {
            return res.status(404).json({ error: 'Creature not found' });
        }
        if (pet.adopted) {
            return res.status(400).json({ error: 'Creature already adopted' });
        }
        pet.adopted = true;
        await pet.save();
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/creatures/:pet_id', async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.pet_id);
        if (!pet) {
            return res.status(404).json({ error: 'Creature not found' });
        }
        await pet.destroy();
        res.json({ message: 'Creature deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/creatures/:pet_id', async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.pet_id);
        if (!pet) {
            return res.status(404).json({ error: 'Creature not found' });
        }
        await pet.update(req.body);
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4000, () => {
    console.log('Pet Haven is running on port 4000');
});
