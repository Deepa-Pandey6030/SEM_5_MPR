const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes'); // we'll create this

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ message: 'Backend up' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
