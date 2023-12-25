require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/UserRoutes");
const connectToDB = require("./db/DbConnection");
const { redirect } = require("./middlewares/Redirect");

app.use(express.json());
app.use(morgan("combined"));
app.use(cors());

connectToDB();

app.use(redirect);
app.use("/vyatha/api", userRoutes);

module.exports = app;
