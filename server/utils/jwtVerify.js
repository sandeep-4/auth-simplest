const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const jwtVerify = async (req) => {
  const verify = await jwt.verify(req.params.token, secret);
  return verify;
};

module.exports = jwtVerify;
