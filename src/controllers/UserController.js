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
    const user = await User.findOne({ email, role: 'student' });

    if (!user) {
      return res.status(401).json({ error: "Please try with correct student credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: "Please try with correct student credentials" });
    }

    const expiresIn = 15 * 24 * 60 * 60; // 15 days in seconds

    const data = {
      user: {
        _id: user._id,
        email:user.email,
        role: 'student',
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET,{ expiresIn });

    res.status(200).json({ message: "Login successful", authtoken });
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Internal server error"});
  }
};

//Admin login


const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'admin' });

    if (!user) {
      return res.status(401).json({ error: "Please try with correct admin credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: "Please try with correct admin credentials" });
    }

    const expiresIn = 15 * 24 * 60 * 60;
    const data = {
      user: {
        _id: user._id,
        email: user.email,
        role: 'admin',
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET ,{ expiresIn } );

    res.status(200).json({ message: "Login succesful", authtoken });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
};

module.exports = {
  home,
  studentLogin,
  adminLogin,
};
