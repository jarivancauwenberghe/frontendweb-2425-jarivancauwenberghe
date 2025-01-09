import { createLogger, format, transports } from 'winston';

/**
 * Winston logger configuration.
 * Tests (Optional):
 * - Typically, we don't test logging output directly in integration tests.
 * - You can mock logger methods in unit tests to ensure errors are logged as expected.
 */
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'movie-review-api' },
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
});

// In development, add console logging
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        ),
    }));
}

export default logger;
