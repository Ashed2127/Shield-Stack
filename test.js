import express from 'express';
import shieldStack from './index.js'; // Testing local package structure

const app = express();

// Apply security middleware with custom rate limiting
app.use(shieldStack({
  rateLimit: {
    windowMs: 60 * 1000,
    max: 3,
    message: 'Too many request, try again'
  }
}));

// Protected route (rate limiting is already applied globally)
app.post('/submit', (req, res) => {
  console.log('Received form data:', req.body);

  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  res.json({
    success: true,
    receivedData: {
      username: req.body.username,
      passwordLength: req.body.password.length // Safer than returning actual password
    }
  });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));