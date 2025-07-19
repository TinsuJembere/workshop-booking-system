const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));
// Workshops routes
app.use('/api/workshops', require('./routes/workshops'));
// Bookings routes
app.use('/api/bookings', require('./routes/bookings'));
// Stats routes
app.use('/api/stats', require('./routes/stats'));
app.use('/api/timeslots', require('./routes/timeslots'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 