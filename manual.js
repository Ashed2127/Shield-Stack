 import express from 'express';
 import helmet from 'helmet';
 import cors from 'cors';
 import rateLimit from 'express-rate-limit';
 import hpp from 'hpp';
 import { body, validationResult } from 'express-validator';
 
 const app = express();
 
 // Middleware to measure response time
 app.use((req, res, next) => {
   const start = process.hrtime();
   res.on('finish', () => {
     const [seconds, nanoseconds] = process.hrtime(start);
     const ms = (seconds * 1000) + (nanoseconds / 1000000);
     console.log(`${req.method} ${req.url} - ${ms.toFixed(2)}ms`);
   });
   next();
 });
 
 // 1. Security Headers
 app.use(helmet());
 
 // 2. CORS Configuration
 app.use(cors({
   origin: process.env.NODE_ENV === 'production' ? [/\.yourdomain\.com$/] : '*',
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization']
 }));
 
 // 3. Rate Limiting
 const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 10,
   standardHeaders: true,
   legacyHeaders: false
 });
 app.use(limiter);
 
 // 4. Body Parsing
 app.use(express.json({ limit: '1mb' }));
 app.use(express.urlencoded({ extended: true }));
 
 // 5. HPP Protection
 app.use(hpp());
 
 // Validation endpoint
 app.post('/submit',
   [
     body('username').trim().isLength({ min: 3 }).escape(),
     body('password').isLength({ min: 8 })
   ],
   (req, res) => {
     console.log('Received data:', {
       username: req.body.username,
       password: '***' // Never log actual passwords
     });
 
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
 
     res.json({
       success: true,
       data: {
         username: req.body.username,
         passwordLength: '***'
       }
     });
   }
 );
 
 app.listen(5000, () => console.log('Server running on port 5000'));
