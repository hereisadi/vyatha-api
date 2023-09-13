require("dotenv").config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/UserRoutes");
const connectToDB = require("./db/DbConnection");
app.use(express.json());

connectToDB();

app.use('/api/auth/student', require('./routes/student/studentLogin'));
app.use('/api/auth/admin', require('./routes/admin/adminLogin'));


app.use("/", userRoutes);
module.exports = app;