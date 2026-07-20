// Load environment variables from .env file first
require('dotenv').config();

const express = require('express');
const path = require('path');
const submitRoute = require('./routes/submit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Serve the payment demo UI from the /public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount the submit route
app.use('/submit', submitRoute);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🌐 Open the demo UI at: http://localhost:${PORT}`);
    console.log(`📋 API: POST http://localhost:${PORT}/submit`);
});
