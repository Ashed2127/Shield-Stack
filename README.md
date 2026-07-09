# Shield-Stack

Comprehensive security middleware for Express.js - easy setup for beginners with sensible defaults.

## Installation

```bash
npm install shield-stack
```

## Quick Start

```javascript
import express from 'express';
import shieldStack from 'shield-stack';

const app = express();

// Apply security middleware with sensible defaults
app.use(shieldStack());

app.post('/submit', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.listen(3000);
```

## Features

- **Security Headers** - Helmet middleware for secure HTTP headers
- **CORS** - Configurable Cross-Origin Resource Sharing
- **Rate Limiting** - Protect against DDoS and brute force attacks
- **Body Parsing** - Built-in JSON and URL-encoded body parsing
- **Production-Ready Defaults** - Secure by default in production

## Configuration Options

```javascript
app.use(shieldStack({
  // CORS configuration (default: production-safe)
  cors: {
    origin: 'https://yourdomain.com',
    methods: ['GET', 'POST'],
    credentials: true
  },
  
  // Helmet security headers (default: enabled)
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    }
  },
  
  // Rate limiting (default: disabled)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: 'Too many requests, please try again later'
  },
  
  // Body parsing options
  json: { limit: '10mb' },
  urlencoded: { extended: true }
}));
```

## XSS Protection (Enhanced Version)

For enhanced XSS protection with input sanitization:

```javascript
import { shieldStack } from 'shield-stack/sanitize';

app.use(shieldStack({
  sanitize: true, // Enable XSS sanitization
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
}));
```

## Testing

### Simple manual test:
```bash
curl -X POST http://localhost:5000/submit \
  -H "Content-Type: application/json" \
  -d '{"username":"ab", "password":"short"}' \
  -w "Status: %{http_code} | Time: %{time_total}s\n"
```

### Iterative test:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/submit \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\", \"password\":\"testpass$i\"}" \
    -w "Request $i: HTTP %{http_code} | Time: %{time_total}s\n"
done
```

## License

ISC