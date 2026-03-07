const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'Connected', timestamp: new Date() });
});


// Seed initial facilities if they don't exist
const seedFacilities = async () => {
  const count = await prisma.facility.count();
  if (count === 0) {
    await prisma.facility.createMany({
      data: [
        { name: 'City General Hospital', type: 'Medical', address: '452 Health Ave', distance: '1.2 miles' },
        { name: 'Central Police Precinct', type: 'Security', address: '12 Safety Blvd', distance: '2.4 miles' },
        { name: 'Metro Fire Station 4', type: 'Fire', address: '89 Rescue Lane', distance: '3.1 miles' },
        { name: 'Volunteer: David (Medic)', type: 'Community', address: 'Sector 4', distance: '0.4 miles' },
        { name: 'Volunteer: Maria (First Aid)', type: 'Community', address: 'Sector 7', distance: '0.9 miles' }
      ]
    });
    console.log('Facilities seeded.');
  }
};
seedFacilities();

// Auth Endpoint: Find or Create User
app.post('/api/auth/login', async (req, res) => {
  const { email, phone, carName, role, stationId } = req.body;
  
  try {
    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { contacts: true }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { email, phone, carName, role, stationId },
        include: { contacts: true }
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage Emergency Contacts
app.post('/api/users/:email/contacts', async (req, res) => {
  const { email } = req.params;
  const { name, phone, relation } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const contact = await prisma.emergencyContact.create({
      data: { name, phone, relation, userId: user.id }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:email/contacts', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { contacts: true }
    });
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.emergencyContact.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Facilities (Real-world lookup)
app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Incident (SOS)

app.post('/api/incidents', async (req, res) => {
  const { type, location, driverEmail, fuelSnapshot, batterySnapshot } = req.body;
  
  try {
    const incident = await prisma.incident.create({
      data: {
        type,
        location,
        driverEmail,
        fuelSnapshot,
        batterySnapshot,
        status: 'OPEN'
      }
    });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get All Incidents (for Authority Boards)
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: { 
        driver: {
          include: { contacts: true }
        } 
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update Incident Status (Dispatch & Resolution)
app.patch('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedUnit, eta } = req.body;
  
  try {
    const incident = await prisma.incident.update({
      where: { id: parseInt(id) },
      data: { status, assignedUnit, eta }
    });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Polling Stat for specific user (Driver view)
app.get('/api/users/:email/active-incident', async (req, res) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: { 
        driverEmail: req.params.email,
        status: { not: 'RESOLVED' }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Safety Ecosystem Server is LIVE`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});

