// routes/admin/adminLogin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "uc";
const User = require('../../models/User');

// Admin login route: POST "/api/auth/admin/login"
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email, role: 'admin' });

    if (!user) {
      return res.status(400).json({ error: "Please try with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try with correct credentials" });
    }

    const data = {
      user: {
        id: user.id,
        role: 'admin',
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
