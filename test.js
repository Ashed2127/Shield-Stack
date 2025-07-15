import express from 'express';
import { safe } from './shield-stack.js'; // or from your package name

const app = express();

// Apply security middleware with custom rate limiting
app.use(safe({
  //rateLimit: {
   // windowMs: 15 * 60 * 1000, // 15 minutes
    //max: 5, // Limit each IP to 5 requests per window
    //message: 'Too many submissions, please try again later'
 // }  
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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
