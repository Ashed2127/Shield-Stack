 import helmet from 'helmet';
 import cors from 'cors';
 import rateLimit from 'express-rate-limit';
 import express from 'express';
 
 /**
 * One-stop security middleware for Express.js
 * @param {Object} options - Configuration
 * @param {Object} [options.cors] - cors options (default: production-safe)
 * @param {Object} [options.helmet] - helmet options (default: all protections)
 * @param {Object} [options.rateLimit] - express-rate-limit options (disabled if undefined)
 * @param {Object} [options.json] - express.json options (default: { limit: '1mb' })
 * @param {Object} [options.urlencoded] - express.urlencoded options (default: { extended: true })
 */
 export const safe = (options = {}) => {
   const router = express.Router();
 
   // 1. Security Headers (Helmet)
   router.use(helmet(options.helmet || {}));
 
   // 2. CORS (Configurable)
   router.use(cors(options.cors || {
     origin: process.env.NODE_ENV === 'production' ? false : '*'
   }));
 
   // 3. Body Parsing
   router.use(express.json(options.json || { limit: '1mb' }));
   router.use(express.urlencoded(options.urlencoded || { extended: true }));
 
   // 4. Rate Limiting (Opt-in)
   if (options.rateLimit) {
     router.use(rateLimit(typeof options.rateLimit === 'object'
       ? options.rateLimit
       : { windowMs: 15 * 60 * 1000, max: 10 }
     ));
   }
 
   return router;
 };
 
 export default safe;
