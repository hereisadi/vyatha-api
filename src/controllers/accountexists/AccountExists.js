const { SignUpModel } = require("../../models/Localauth/Signup");

// access: public
// endpoint: /accountexists/:email
// payload: email as params
// role: all
// desc: check if account exists or not

const accountExists = async (req, res) => {
  try {
    let { email } = req.params;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    email = email?.toString().toLowerCase().trim();

    if (!email.includes("@")) {
      return res.status(200).json({
        message: "not the correct email format",
      });
    }

    const user = await SignUpModel.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "no account found",
      });
    } else {
      return res.status(200).json({
        message: "accounts exists",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  accountExists,
};
