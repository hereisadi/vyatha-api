const errors = require("../utils/error/error");

const emailValidator = (req, res, next) => {
  let { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email is missing" });
  }
  email = email?.toLowerCase().toString().trim();
  const emailValidatorRegex = RegExp(
    /^[a-zA-Z0-9._-]+@([a-z]+\.)?nits\.ac\.in$/
  );

  if (!emailValidatorRegex.test(email)) {
    res.status(400).json({ error: errors.InvalidEmail });
  } else {
    next();
  }
};

module.exports = emailValidator;
