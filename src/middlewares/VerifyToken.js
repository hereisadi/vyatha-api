const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.YOUR_SECRET_KEY
    );
    req.user = decoded;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    console.error("error in verifying the token", error);
    res.status(401).json({ error: "Something went wrong to verify the token" });
  }
};

module.exports = {
  verifyToken,
};
