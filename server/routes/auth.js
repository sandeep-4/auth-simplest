const express = require("express");
const {
  registerAccount,
  login,
  activationAccount,
  forgetPassword,
  resetPassword,
} = require("../controllers/auth");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome buddy" });
});

router.post("/auth/signup", registerAccount);
router.post("/auth/signin", login);
router.get("/auth/activation/:token", activationAccount);
router.post("/auth/forgotpassword", forgetPassword);
router.put("/auth/resetpassword/:token", resetPassword);

module.exports = router;
