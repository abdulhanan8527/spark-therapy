const config = require('./environment');

module.exports = {
  jwtSecret: config.get('JWT_SECRET'),
  jwtExpire: config.get('JWT_EXPIRE'),
  jwtRefreshSecret: config.get('JWT_REFRESH_SECRET'),
  jwtRefreshExpire: config.get('JWT_REFRESH_EXPIRE'),
  bcryptSaltRounds: 12 // Increased for better security
};