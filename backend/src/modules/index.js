// Central export for modularized backend. Each module re-exports existing code.

module.exports = {
  auth: require('./auth'),
  users: require('./users'),
  files: require('./files'),
  decrypt: require('./decrypt'),
  sftp: require('./sftp'),
  schedule: require('./schedule')
};


