import 'reflect-metadata';
import express from 'express';
import config from 'config';
import installRest from '../rest';
import { initializeDataSource, closeDataSource } from '../data/data-source'; 
import { errorMiddleware } from './errorMiddleware';
import logger from './logger';

const app = express();

// Use JSON middleware
app.use(express.json());

// Install all API routes
installRest(app);

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error middleware at the end
app.use(errorMiddleware);

/**
 * startServer:
 * - Initializes DB connection
 * - Starts server listening on the configured port
 * - Handles graceful shutdown
 *
 * Tests:
 * - Integration tests start the server (possibly in test env) and make requests.
 * - Ensure that shutdown logic (SIGINT, SIGTERM) closes DB and server.
 */
const startServer = async () => {
  const port = process.env.PORT || config.get<number>('port');

  await initializeDataSource();

  const server = app.listen(port, () => {
    logger.info(`🚀 Server listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    await closeDataSource();
    server.close(() => {
      logger.info('Server closed and database connection terminated');
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
};

// If run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start server', { error });
    process.exit(1);
  });
}

export { startServer, app };
