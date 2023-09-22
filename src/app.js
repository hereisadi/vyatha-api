require("dotenv").config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/UserRoutes");
const connectToDB = require("./db/DbConnection");
app.use(express.json());

connectToDB();
app.use('/vyatha/api', userRoutes);

module.exports = app;
