# Shield-Stack

Comprehensive security middleware for Express.js - easy setup for beginners with sensible defaults.

## Installation

```bash
npm install @neuralpush/shield-stack
```

## Quick Start

```javascript
import express from 'express';
import shieldStack from '@neuralpush/shield-stack';

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
import { shieldStack } from '@neuralpush/shield-stack/sanitize';

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

## API Reference

### shieldStack(options)

Returns an Express middleware router with security features enabled.

#### Parameters

- **options** `Object` - Configuration object
  - **cors** `Object|boolean` - CORS configuration (default: production-safe)
    - `origin` `string|function|boolean` - Allowed origins (default: `false` in production, `'*'` in development)
    - `methods` `string[]` - Allowed HTTP methods
    - `credentials` `boolean` - Allow cookies/authorization headers
    - Set to `false` to disable CORS
  - **helmet** `Object|boolean` - Helmet security headers (default: enabled)
    - `contentSecurityPolicy` `Object` - CSP directives
    - Any other Helmet configuration options
    - Set to `false` to disable security headers
  - **rateLimit** `Object|boolean` - Rate limiting configuration (default: disabled)
    - `windowMs` `number` - Time window in milliseconds (default: 15 minutes)
    - `max` `number` - Max requests per window (default: 15)
    - `message` `string` - Custom rate limit message
    - `standardHeaders` `boolean` - Return rate limit info in headers
    - `legacyHeaders` `boolean` - Disable legacy headers
    - Set to `false` to disable rate limiting
  - **json** `Object` - express.json() options (default: `{ limit: '1mb' }`)
  - **urlencoded** `Object` - express.urlencoded() options (default: `{ extended: true }`)

### shieldStack/sanitize

Enhanced version with XSS protection. Additional parameter:

- **sanitize** `boolean|Object` - XSS sanitization (default: enabled)
  - Set to `false` to disable sanitization
  - Custom DOMPurify configuration can be passed as object

## Security Overview

Shield-Stack protects against the following security threats:

| Threat | Protection | Middleware |
|--------|------------|------------|
| XSS Attacks | Input sanitization, CSP headers | DOMPurify, Helmet |
| CSRF | CORS configuration | CORS |
| DDoS/Brute Force | Rate limiting | express-rate-limit |
| Clickjacking | X-Frame-Options header | Helmet |
| MIME Sniffing | X-Content-Type-Options header | Helmet |
| Man-in-the-Middle | HSTS header (HTTPS) | Helmet |
| Data Injection | Content Security Policy | Helmet |

## Best Practices

### Development Environment
```javascript
app.use(shieldStack({
  cors: { origin: '*' }, // Allow all origins for development
  helmet: { contentSecurityPolicy: false } // Disable CSP for easier debugging
}));
```

### Production Environment
```javascript
app.use(shieldStack({
  cors: { 
    origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
    credentials: true 
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.trusted.com'],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  }
}));
```

### High-Security Applications
```javascript
import { shieldStack } from '@neuralpush/shield-stack/sanitize';

app.use(shieldStack({
  sanitize: true, // Enable XSS protection
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  },
  helmet: {
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    frameguard: { action: 'deny' }
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Stricter limit
    skipSuccessfulRequests: false
  }
}));
```

## Troubleshooting

### CORS Issues

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**: Ensure CORS is properly configured:
```javascript
cors: {
  origin: 'https://your-frontend-domain.com',
  credentials: true
}
```

### Rate Limiting Too Strict

**Problem**: Legitimate users getting rate limited

**Solution**: Adjust limits or add whitelisting:
```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase limit
  skip: (req) => req.ip === '127.0.0.1' // Skip localhost
}
```

### CSP Blocking Resources

**Problem**: External scripts/styles not loading

**Solution**: Add trusted domains to CSP:
```javascript
helmet: {
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", 'https://cdn.trusted-cdn.com'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com']
    }
  }
}
```

### Large Payloads Rejected

**Problem**: "Payload too large" error

**Solution**: Increase body size limit:
```javascript
json: { limit: '10mb' },
urlencoded: { limit: '10mb', extended: true }
```

## Advanced Examples

### Multi-Environment Configuration
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(shieldStack({
  cors: {
    origin: isProduction 
      ? process.env.ALLOWED_ORIGINS?.split(',')
      : '*',
    credentials: isProduction
  },
  helmet: isDevelopment 
    ? { contentSecurityPolicy: false } 
    : undefined,
  rateLimit: isProduction 
    ? { windowMs: 15 * 60 * 1000, max: 100 }
    : false
}));
```

### API vs Web Routes
```javascript
// Strict rate limiting for API
app.use('/api', shieldStack({
  cors: { origin: process.env.FRONTEND_URL },
  rateLimit: { windowMs: 60 * 1000, max: 60 }
}));

// Relaxed settings for web routes
app.use(shieldStack({
  cors: { origin: '*' },
  rateLimit: false
}));
```

### Custom Error Handling
```javascript
app.use(shieldStack({
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  }
}));
```

## Performance Considerations

- **Rate Limiting**: Uses in-memory storage by default. For distributed systems, consider Redis-backed storage
- **XSS Sanitization**: DOMPurify adds minimal overhead (~1-2ms per request)
- **Security Headers**: Helmet headers are pre-computed and have negligible performance impact
- **Body Parsing**: JSON parsing is CPU-intensive; consider streaming for very large payloads

## License

ISC