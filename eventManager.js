const express = require('express');
const app = express();
app.use(express.json());

class Venue {
    constructor(id, name, address, capacity) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.capacity = capacity;
    }
}

class Participant {
    constructor(id, name, email, eventId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.eventId = eventId;
    }
}

class Event {
    constructor(id, title, description, venueId, date, time, participants = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.venueId = venueId;
        this.date = date;
        this.time = time;
        this.participants = participants;
    }
}

let venues = {
    1: new Venue(1, "Conference Hall A", "123 Main St", 100),
    2: new Venue(2, "Open Air Theater", "456 Park Ave", 500)
};

let events = {
    1: new Event(1, "Tech Conference 2024", "A conference on emerging technologies.", 1, "2024-10-20", "10:00"),
    2: new Event(2, "Music Festival", "A day-long festival featuring live music.", 2, "2024-11-15", "12:00")
};

let participants = {};

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Event Management API" });
});

app.post('/venues', (req, res) => {
    const venue = req.body;
    if (venues[venue.id]) {
        return res.status(400).json({ detail: "Venue with this ID already exists" });
    }
    venues[venue.id] = new Venue(venue.id, venue.name, venue.address, venue.capacity);
    res.json(venues[venue.id]);
});

app.get('/venues/:venueId', (req, res) => {
    const venueId = parseInt(req.params.venueId);
    if (venues[venueId]) {
        res.json(venues[venueId]);
    } else {
        res.status(404).json({ detail: "Venue not found" });
    }
});

app.get('/venues', (req, res) => {
    res.json(Object.values(venues));
});

app.post('/events', (req, res) => {
    const event = req.body;
    if (events[event.id]) {
        return res.status(400).json({ detail: "Event with this ID already exists" });
    }
    if (!venues[event.venueId]) {
        return res.status(404).json({ detail: "Venue not found" });
    }
    events[event.id] = new Event(event.id, event.title, event.description, event.venueId, event.date, event.time);
    res.json(events[event.id]);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
