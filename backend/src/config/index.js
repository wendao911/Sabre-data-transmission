const env = process.env.NODE_ENV || 'development';
let cfg;
try {
  cfg = require(`./env/${env}`);
} catch (e) {
  cfg = require('./env/development');
}

module.exports = cfg;


