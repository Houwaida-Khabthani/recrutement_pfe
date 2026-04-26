const jwt = require("jsonwebtoken");
const config = require("../config/env");

exports.generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "24h"
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};