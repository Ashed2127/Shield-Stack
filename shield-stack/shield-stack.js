 import helmet from 'helmet';
 import cors from 'cors';
 import rateLimit from 'express-rate-limit';
 import express from 'express';
 
 /**
  * Comprehensive security middleware for Express.js
  * @param {Object} options - Configuration
  * @param {Object} [options.cors] - CORS options (default: production-safe)
  * @param {Object|boolean} [options.helmet] - Helmet options (false to disable)
  * @param {Object|boolean} [options.rateLimit] - Rate limiting options (false to disable)
  * @param {Object} [options.json] - express.json options (default: { limit: '1mb' })
  * @param {Object} [options.urlencoded] - express.urlencoded options (default: { extended: true })
  */
 export const shieldStack = (options = {}) => {
   const router = express.Router();
 
   // 1. Security Headers (Helmet - can be disabled)
   if (options.helmet !== false) {
     router.use(helmet(options.helmet || {}));
   }
 
   // 2. CORS (Configurable - can be disabled)
   if (options.cors !== false) {
     router.use(cors(typeof options.cors === 'object' 
       ? options.cors 
       : { origin: process.env.NODE_ENV === 'production' ? false : '*' }
     ));
   }
 
   // 3. Body Parsing
   router.use(express.json(options.json || { limit: '1mb' }));
   router.use(express.urlencoded(options.urlencoded || { extended: true }));
 
   // 4. Rate Limiting (Opt-in)
   if (options.rateLimit && options.rateLimit !== false) {
     router.use(rateLimit(typeof options.rateLimit === 'object'
       ? options.rateLimit
       : { 
           windowMs: 15 * 60 * 1000, 
           max: 20,
           standardHeaders: true,
           legacyHeaders: false
         }
     ));
   }
 
   return router;
 };
 
 export default shieldStack;
