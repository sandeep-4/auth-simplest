const User = require("../models/auth");
const generateJwtToken = require("../utils/generateJwtToken");
const jwtVerify = require("../utils/jwtVerify");
const mailResetEmail = require("../utils/mailResetEmail");
const sendRegisterEmail = require("../utils/sendRegisterEmail");

exports.registerAccount = async (req, res) => {
  const { username, password, email, role } = req.body;
  const hashPassword = await User.hash(password);

  const findUser = await User.findOne({ username: username }).lean();
  if (findUser) res.status(401).json({ error: "User already exists" });

  const user = new User({
    username: username,
    email: email,
    password: hashPassword,
    role: role,
    create_at: Date.now(),
  });
  const savedData = await user.save();
  if (!savedData) res.status(200).json({ error: "Couldnt saved" });

  const token = await generateJwtToken(user);
  const mail = await sendRegisterEmail(username, email, token);
  if (!mail) res.status(401).json({ error: "User cant send email" });
  else res.status(201).json({ success: "Registered sucessfully" });
};

exports.login = async (req, res) => {
  const findUser = await User.findOne({ username: req.body.username }).lean();
  if (!findUser) res.status(401).json({ error: "Invalid credintials" });

  if (!findUser.activation_account)
    res.status(403).json({ error: "Please activate your account" });

  const verifyAcoount = await User.verify(req.body.password, findUser.password);
  if (!verifyAcoount) res.status(401).json({ error: "Invalid credintials" });

  const { _id, username } = findUser;
  const token = await generateJwtToken(findUser);
  res.status(200).json({ success: "Logged in " });
};

exports.activationAccount = async (req, res) => {
  const decoded = await jwtVerify(req);
  console.log(decoded);
  if (!decoded) res.status(401).json({ error: "Invalid token" });
  const findUser = await User.findById(decoded.id);
  if (!findUser) res.status(401).json({ error: "User not found" });
  console.log(findUser);
  await User.findByIdAndUpdate(findUser._id, {
    $set: { activation_account: true },
  });
  res.status(201).json({ success: "Registered user activated" });
};

exports.forgetPassword = async (req, res) => {
  const findUser = await User.findOne({ email: req.body.email }).lean();
  if (!findUser) res.status(401).json({ error: "User not found" });
  let message;
  const token = await generateJwtToken(findUser);

  if (!findUser.activation_account)
    await sendRegisterEmail(findUser.username, findUser.email, token);
  else await mailResetEmail(findUser.username, findUser.email, token);

  res.status(201).json({ success: "Password reset sent" });
};

exports.resetPassword = async (req, res) => {
  const decoded = await jwtVerify(req);
  if (!decoded) res.status(401).json({ error: "Token expired" });
  const findUser = await User.findById(decoded.id).lean();
  const verifyPassword = await User.verify(
    req.body.oldPassword,
    findUser.password
  );
  if (!verifyPassword)
    res.status(401).json({ error: "Old password dont match" });

  const hashPassword = await User.hash(req.body.newPass);
  const changedPassword = await User.findByIdAndUpdate(findUser._id, {
    $set: { password: hashPassword },
  });

  res.status(201).json({ success: "Password changed " });
};
