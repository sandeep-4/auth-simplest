const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: "user",
  },
  activation_account: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

userSchema.static("hash", (password) => {
  const salt = bcrypt.genSaltSync(12);
  const hashPassword = bcrypt.hashSync(password, salt);
  return hashPassword;
});

userSchema.static("verify", (password, hashPassword) => {
  const verifyPassword = bcrypt.compareSync(password, hashPassword);
  return verifyPassword;
});

module.exports = mongoose.model("User", userSchema);
