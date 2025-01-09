module.exports = {
  env: 'NODE_ENV',
  port: 'PORT',
  database: {
    host: 'DB_HOST',
    port: 'DB_PORT',
    name: 'DB_NAME',
    username: 'DB_USER', 
    password: 'DB_PASSWORD',
  },
  auth: {
    jwt: {
      secret: 'AUTH_JWT_SECRET',
      expiresIn: 'JWT_EXPIRES_IN',
      audience: 'AUTH_JWT_AUDIENCE',
      issuer: 'AUTH_JWT_ISSUER',     
    },
  },
  log: {
    level: 'LOG_LEVEL',
    disabled: 'LOG_DISABLED',
  },
};

/**
 * Tests & Notes:
 * - Check that when running in production, required env vars are present. If not, the app should fail early.
 * - For integration tests, use a .env.test file to override default values and ensure test database is used.
 */
