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
 * @param {Object|boolean} [options.helmet] - Helmet options (false to disable)
 * @param {Object|boolean} [options.cors] - CORS options (false to disable)
 * @param {Object|boolean} [options.rateLimit] - Rate limiting options (false to disable)
 * @param {Object} [options.json] - express.json options (default: { limit: '1mb' })
 * @param {Object} [options.urlencoded] - express.urlencoded options (default: { extended: true })
 */
export const shieldStack = (options = {}) => {
  const router = express.Router();

  // =====================
  // 1. BODY PARSING (MUST BE FIRST!)
  // =====================
  router.use(express.json(options.json || { limit: '1mb' }));
  router.use(express.urlencoded(options.urlencoded || { extended: true }));

  // =====================
  // 2. XSS PROTECTION
  // =====================
  if (options.sanitize !== false) {
    router.use((req, res, next) => {
      try {
        // Sanitize request body (query and params are read-only in Express)
        if (req.body && typeof req.body === 'object') {
          const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
              return purify.sanitize(obj, {
                FORBID_TAGS: ['style', 'script'],
                FORBID_ATTR: ['on*']
              });
            } else if (Array.isArray(obj)) {
              return obj.map(sanitizeObject);
            } else if (typeof obj === 'object' && obj !== null) {
              const sanitized = {};
              for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
              }
              return sanitized;
            }
            return obj;
          };
          req.body = sanitizeObject(req.body);
        }
        next();
      } catch (err) {
        console.error('Sanitization error:', err);
        res.status(400).json({ error: 'Invalid input format' });
      }
    });
  }

  // =====================
  // 3. STANDARD SECURITY
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

  // Rate Limiting (Opt-in)
  if (options.rateLimit && options.rateLimit !== false) {
    router.use(rateLimit(typeof options.rateLimit === 'object' ? options.rateLimit : {
      windowMs: 15 * 60 * 1000,
      max: 100
    }));
  }

  return router;
};

export default shieldStack;
