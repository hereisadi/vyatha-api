const jwt = require("jsonwebtoken");
const { SignUpModel } = require("../models/Localauth/Signup");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      console.error("Missing token");
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.YOUR_SECRET_KEY
    );
    req.user = decoded;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    const user = await SignUpModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const allTokens = user.loginTokens;

    for (let i = 0; i < allTokens.length; i++) {
      if (allTokens[i].token === token) {
        if (allTokens[i].isTokenExpired === true) {
          return res.status(401).json({
            error: "Token has been expired means user has logged out",
          });
        } else if (allTokens[i].isTokenExpired === false) {
          next();
        }
      }
    }
  } catch (error) {
    console.error("error in verifying the token", error);
    return res
      .status(401)
      .json({ error: "Something went wrong to verify the token" });
  }
};

module.exports = {
  verifyToken,
};
