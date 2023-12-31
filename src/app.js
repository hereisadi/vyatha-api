require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

const userRoutes = require("./routes/UserRoutes");
const connectToDB = require("./db/DbConnection");
const { redirect } = require("./middlewares/Redirect");

app.use(express.json());
app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
require("dotenv").config();
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

connectToDB();

app.use(redirect);
app.use("/vyatha/api", userRoutes);

module.exports = app;
