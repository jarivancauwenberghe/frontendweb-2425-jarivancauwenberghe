const { 
  DB_HOST, 
  DB_PORT, 
  DB_NAME, 
  DB_USER, 
  DB_PASSWORD, 
  JWT_SECRET, 
  JWT_AUDIENCE, 
  JWT_ISSUER 
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD || !JWT_SECRET || !JWT_AUDIENCE || !JWT_ISSUER) {
  throw new Error('Missing required environment variables for production configuration.');
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 9000,
  log: {
    level: process.env.LOG_LEVEL || 'warn',
    disabled: process.env.LOG_DISABLED === 'true',
  },
  database: {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    name: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
  },
  auth: {
    jwt: {
      secret: JWT_SECRET,
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    },
  },
};
