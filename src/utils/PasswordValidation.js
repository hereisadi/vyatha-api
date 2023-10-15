const errors = require("../utils/error/error");

const passwordValidator = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const lowerCase = /[a-z]/.test(password),
    upperCase = /[A-Z]/.test(password),
    numbers = /\d/.test(password),
    specialChar = /[`!@#$%^&*()_+=|:;<>,./?"'{}]/.test(password);

  if (/\s/.test(password) || /\s/.test(confirmPassword)) {
    res.status(400).json({ error: errors.NoSpace });
  } else if (password !== confirmPassword) {
    res.status(400).json({ error: errors.NotSame });
  } else if (password.length < 8) {
    res.status(400).json({ error: errors.AtLeast8 });
  } else if (!(lowerCase && upperCase && numbers && specialChar)) {
    res.status(400).json({ error: errors.MustChar });
  } else {
    next();
  }
};

module.exports = passwordValidator;
