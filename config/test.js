module.exports = {
  port: 9000,
  log: {
    level: 'info',
    disabled: true, // no logs during tests
  },
  database: {
    name: 'movie_review_api_test', // dedicated test DB
  },
  auth: {
    jwt: {
      audience: 'test_audience',
      issuer: 'test_issuer',
    },
  },
};

/**
 * Tests & Notes:
 * - Run tests with `npm run test` and ensure the test DB is used.
 * - Confirm logs are disabled for faster test output.
 */
