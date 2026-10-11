# Shield-Stack

Comprehensive security middleware for Express.js with sensible defaults.

## What It Does

Shield-Stack combines essential security features into one easy-to-use middleware:
- **Helmet** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - DDoS and brute force protection
- **Body Parsing** - JSON and URL-encoded parsing
- **XSS Sanitization** - Input sanitization (enhanced version)

## Installation

```bash
npm install @neuralpush/shield-stack
```

## Quick Start

```javascript
import express from 'express';
import shieldStack from '@neuralpush/shield-stack';

const app = express();
app.use(shieldStack());

app.listen(3000);
```

## Configuration

```javascript
app.use(shieldStack({
  cors: {
    origin: 'https://yourdomain.com',
    credentials: true
  },
  helmet: {
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"] }
    }
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },
  json: { limit: '10mb' }
}));
```

## XSS Protection

For enhanced XSS protection with input sanitization:

```javascript
import { shieldStack } from '@neuralpush/shield-stack/sanitize';

app.use(shieldStack({ sanitize: true }));
```

## License

ISC
