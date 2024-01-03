const errors = require("../utils/error/error");

const emailValidator = (req, res, next) => {
  let { email, designation } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email is missing" });
  }
  email = email?.toLowerCase().toString().trim();
  const emailValidatorRegex = RegExp(
    /^[a-zA-Z0-9._-]+@([a-z]+\.)?nits\.ac\.in$/
  );

  if (designation !== "" && designation === "Supervisor") {
    next();
  } else if (
    // for login and forgot password things
    designation === "" ||
    designation === undefined ||
    designation === null ||
    // for signup things
    designation === "Student" ||
    designation === "Warden" ||
    designation === "Dean"
  ) {
    if (!emailValidatorRegex.test(email)) {
      return res.status(400).json({ error: errors.InvalidEmail });
    } else {
      next();
    }
  }
};

module.exports = emailValidator;
