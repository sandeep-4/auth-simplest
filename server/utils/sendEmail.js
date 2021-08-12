const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "springboottest123@gmail.com",
    pass: "spring@123",
  },
});

const sendEmail = async (message) => {
  await transporter.sendMail({
    from: "no_reply@auth.com",
    to: email,
    html: message,
  });
};

module.exports = sendEmail;
