import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Movie } from '../entity/movie';
import { Review } from '../entity/review';
import { User } from '../entity/user';
import { Watchlist } from '../entity/watchlist';
import { Recommendation } from '../entity/recommendation';
import config from 'config';
import logger from '../core/logger';

const dbConfig = config.get<{
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}>('database');

const isProduction = config.get<string>('env') === 'production';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  synchronize: false, // Use migrations in production
  logging: config.get<string>('env') === 'development',
  entities: [Movie, Review, User, Watchlist, Recommendation],
  migrations: isProduction ? ['dist/migration/**/*.js'] : ['src/migration/**/*.ts'],
  subscribers: [],
});

/**
 * Initialize the data source.
 * Tests:
 * - Try running integration tests with a test database.
 * - Ensure initialization logs success or fails gracefully.
 */
export async function initializeDataSource() {
  try {
    await AppDataSource.initialize();
    logger.info('Data Source has been initialized!');

    if (isProduction) {
      await AppDataSource.runMigrations();
      logger.info('Migrations have been run in production!');
    }
  } catch (error) {
    logger.error('Error during Data Source initialization:', { error });
    process.exit(1);
  }
}

/**
 * Gracefully close the data source.
 * Tests:
 * - Ensure that after tests, calling closeDataSource shuts down cleanly.
 */
export async function closeDataSource() {
  try {
    await AppDataSource.destroy();
    logger.info('Data Source has been closed!');
  } catch (error) {
    logger.error('Error closing Data Source:', { error });
  }
}

process.on('SIGINT', async () => {
  await closeDataSource();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDataSource();
  process.exit(0);
});
