import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import express from 'express';

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Enhanced ShieldStack with XSS protection
 * @param {Object} options - Configuration
 * @param {boolean|Object} [options.sanitize] - XSS sanitization settings
 */
export const shieldStack = (options = {}) => {
  const router = express.Router();

  // =====================
  // 1. XSS PROTECTION (FIRST!)
  // =====================
  if (options.sanitize !== false) {
    router.use((req, res, next) => {
      try {
        // Sanitize all incoming data
        ['body', 'query', 'params'].forEach((key) => {
          if (req[key] && typeof req[key] === 'object') {
            req[key] = JSON.parse(
              purify.sanitize(JSON.stringify(req[key]), {
                RETURN_TRUSTED_TYPE: true,
                FORBID_TAGS: ['style', 'script'],
                FORBID_ATTR: ['on*'] // Block all event handlers
              })
            );
          }
        });
        next();
      } catch (err) {
        console.error('Sanitization error:', err);
        res.status(400).json({ error: 'Invalid input format' });
      }
    });
  }

  // =====================
  // 2. STANDARD SECURITY
  // =====================
  // Helmet (with strict CSP)
  if (options.helmet !== false) {
    router.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"], // No unsafe-inline!
          styleSrc: ["'self'"],
          imgSrc: ["'self'"]
        }
      },
      ...(typeof options.helmet === 'object' ? options.helmet : {})
    }));
  }

  // CORS
  if (options.cors !== false) {
    router.use(cors(typeof options.cors === 'object' ? options.cors : {
      origin: process.env.NODE_ENV === 'production' ? false : '*'
    }));
  }

  // Rate Limiting
  if (options.rateLimit !== false) {
    router.use(rateLimit(typeof options.rateLimit === 'object' ? options.rateLimit : {
      windowMs: 15 * 60 * 1000,
      max: 100
    }));
  }

  return router;
};
