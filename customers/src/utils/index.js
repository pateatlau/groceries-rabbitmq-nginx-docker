const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get('Authorization');
    const payload = await jwt.verify(signature.split(' ')[1], JWT_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.FormatData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};
