"use strict";
const crypto = require("node:crypto");

module.exports = (password) => {
  return crypto.pbkdf2Sync(password, process.env.SECRET_KEY, 10000, 24, "sha512").toString('hex');

};
