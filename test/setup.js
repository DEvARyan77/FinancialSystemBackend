const path = require('path');
const fs = require('fs');

// Set a test database file
const TEST_DB_PATH = path.join(__dirname, 'test.db');
process.env.DB_PATH = TEST_DB_PATH;

// Remove any existing test database
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

// Import the database module to create tables
require('../config/db');

// Export cleanup function
module.exports = {
  TEST_DB_PATH,
  cleanup: () => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  }
};