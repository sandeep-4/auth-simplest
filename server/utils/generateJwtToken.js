const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const generateJwtToken = async (user) => {
  const token = await jwt.sign(
    { id: user._id, username: user.username },
    secret,
    {
      expiresIn: "10m",
    }
  );
  return token;
};

// const jwtVerify = async (req) => {
//   const verify = await jwt.verify(req.params.token, secret);
//   return verify;
// };

module.exports = generateJwtToken;
