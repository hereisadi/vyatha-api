// signup and login authentication logic goes here
// require the UserModel

// const home = (req, res) => {
//   res.send("<p>Welcome to Vyatha api.</p>");
// };

// const signUp = async () => {};
// const logIn = async () => {};

// module.exports = {
//   home
// };

// userController.js

const User  = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const home = (req, res) => {
  res.send("<p>Welcome to Vyatha api.</p>");
};

const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email, role: 'student' });

    if (!user) {
      return res.status(400).json({ error: "Please try with correct student credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try with correct student credentials" });
    }

    const data = {
      user: {
        id: user.id,
        role: 'student',
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET);

    res.json({ authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
};

//Admin login


const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email, role: 'admin' });

    if (!user) {
      return res.status(400).json({ error: "Please try with correct admin credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try with correct admin credentials" });
    }

    const data = {
      user: {
        id: user.id,
        role: 'admin',
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET);

    res.json({ authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  home,
  studentLogin,
  adminLogin,
};
