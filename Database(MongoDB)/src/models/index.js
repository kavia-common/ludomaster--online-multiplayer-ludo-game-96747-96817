/**
 * Export all model accessors to simplify backend imports.
 */
module.exports = {
  ...require('./users'),
  ...require('./rooms'),
  ...require('./games'),
  ...require('./chat'),
  ...require('./stats'),
};
