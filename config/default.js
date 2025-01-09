module.exports = {
  env: 'development',
  port: 3000,
  database: {
    host: 'localhost',
    port: 3306,
    name: 'movie_review_api',
    username: 'root',
    password: 'password123!',
  },
  auth: {
    jwt: {
      secret: 'default_jwt_secret',
      expiresIn: '1h',
      audience: 'default_audience',
      issuer: 'default_issuer',
    },
  },
  log: {
    level: 'info',
    disabled: false,
  },
};

/**
* Tests & Notes:
* - Default config used in development if no environment overrides.
* - Consider using a .env.development file to override some values.
* - Test by running the server in dev mode and checking logs, DB connection, token generation.
*/
