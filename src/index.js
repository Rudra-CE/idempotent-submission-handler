// Load environment variables from .env file first
require('dotenv').config();

const express = require('express');
const submitRoute = require('./routes/submit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Health check route — visit http://localhost:3000/ to confirm app is running
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Idempotent Submission Handler is running!',
        usage: 'POST /submit with header Idempotency-Key: <your-unique-key>',
        ttl: `Requests are cached for ${process.env.TTL_SECONDS || 60} seconds`,
    });
});

// Mount the submit route
app.use('/submit', submitRoute);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Try: POST http://localhost:${PORT}/submit`);
});
