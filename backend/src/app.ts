import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs, swaggerUIOptions } from './swagger.js';

import toProcessRoute from '@routes/to-process/to-process.js';
import {
  profileMaintenanceRoutes,
  userMaintenanceRoutes,
  methodMaintenanceRoutes,
  menuMaintenanceRoutes
} from './routes/maintenance/index.js';
import authRoutes from '@routes/auth/auth.js';

import { config, frontend } from '@const/constants.js';

import { session, db } from '@components/index.js';

const app = express();

// Session middleware
session.enable(app, config.session.type);

// Database connection
db.connect(config.database.type);

// Middleware to parse JSON from request body
app.use(express.json());

// CORS
app.use(cors({
  origin: frontend.url,
  credentials: true
}));

// Swagger UI
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs, swaggerUIOptions));

// To-Process route
app.use('/', toProcessRoute);

// Maintenance routes
app.use('/maintenance', profileMaintenanceRoutes);
app.use('/maintenance', userMaintenanceRoutes);
app.use('/maintenance', methodMaintenanceRoutes);
app.use('/maintenance', menuMaintenanceRoutes);

// Auth routes
app.use('/auth', authRoutes);

/**
 * @swagger
 * /health:
 *  get:
 *    tags:
 *      - health 
 *    description: Allows the client to perform a basic server health check.
 *    responses:
 *      200:
 *        description: Server status OK.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: OK
 *                timestamp:
 *                  type: string
 *                  format: date-time
 *                  example: 2025-10-07T17:35:05.392Z
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(function(req, res, next) {
  res.status(404);

  // Respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // Default to plain-text. send()
  res.type('txt').send('Not found');
});

export default app;