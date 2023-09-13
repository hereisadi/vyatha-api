// routes/student/studentCreateUser.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "uctech";
const User = require('../../models/User');

// Create a student user route: POST "/api/auth/student/createuser"
router.post('/createuser', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    let user = await User.findOne({ email, role: 'student' });

    if (user) {
      return res.status(400).json({ error: "Sorry, a student with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      password: hashedPassword,
      email,
      role: 'student',
    });

    const data = {
      user: {
        id: user.id,
        role: 'student',
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    res.json({ authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
