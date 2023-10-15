const express = require("express");

const redirect = express();

redirect.use((req, res, next) => {
  if (req.url === "/") {
    res.redirect(301, "/vyatha/api");
  } else {
    next();
  }
});

module.exports = { redirect };
