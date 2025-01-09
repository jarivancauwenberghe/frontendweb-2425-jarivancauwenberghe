module.exports = {
  log: {
    level: 'debug', // More verbose logs in development
  },
  database: {
    // The name is overridden to your development DB name
    name: 'movie_review_api',
  },
  auth: {
    jwt: {
      audience: 'development_audience',
      issuer: 'development_issuer',
    },
  },
};

/**
 * Tests & Notes:
 * - Run `npm run start:dev` and verify that debug logs appear.
 * - Ensure DB name matches your local dev database.
 */
