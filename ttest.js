import express from 'express';
import shieldStack from './shield-stack/shield-stack.js';

const app = express();

// ===== [1] Add Performance Measurement Middleware =====
app.use((req, res, next) => {
  const startTime = process.hrtime(); // High-resolution timer
  const startMs = Date.now(); // Fallback timer (milliseconds)

  // Measure AFTER ShieldStack processes the request
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const totalMs = (seconds * 1000) + (nanoseconds / 1_000_000);
    const totalMsFallback = Date.now() - startMs;

    console.log(`[${req.method}] ${req.url} - ${totalMs.toFixed(2)}ms (hrtime) / ${totalMsFallback}ms (Date)`);
  });

  next();
});

// ===== [2] Apply ShieldStack =====
/*app.use(shieldStack({
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 requests/minute
    message: 'Too many requests, try again later'
  }
}));*/

app.use(shieldStack({
  rateLimit: false
})); 

// ===== [3] Test Route =====
app.post('/submit', (req, res) => {
  console.log('Received form data:', req.body);

  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  res.json({
    success: true,
    receivedData: {
      username: req.body.username,
      passwordLength: req.body.password.length
    }
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
