const errors = require("../utils/error/error");

const passwordValidator = (req, res, next) => {
  const { password, cpassword } = req.body;
  if (!password || !cpassword) {
    return res.status(400).json({ error: "password missing" });
  }

  const lowerCase = /[a-z]/.test(password),
    upperCase = /[A-Z]/.test(password),
    numbers = /\d/.test(password),
    specialChar = /[`!@#$%^&*()_+=|:;<>,./?"'{}]/.test(password);

  if (/\s/.test(password) || /\s/.test(cpassword)) {
    return res.status(400).json({ error: errors.NoSpace });
  } else if (password !== cpassword) {
    return res.status(400).json({ error: errors.NotSame });
  } else if (password.length < 8) {
    return res.status(400).json({ error: errors.AtLeast8 });
  } else if (!(lowerCase && upperCase && numbers && specialChar)) {
    return res.status(400).json({ error: errors.MustChar });
  } else {
    next();
  }
};

module.exports = passwordValidator;
