const mongoose = require('mongoose');
const { DB_URL } = require('../config');

module.exports = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log('Db Connected');
  } catch (error) {
    console.error('DB Connection Error ============');
    console.error(error);
    process.exit(1);
  }
};
