import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { userRoutes } from "./routes/userRoutes.js"; // Update the import path
import authMiddleware from "./middlewares/authMiddleware.js";
import { problemRoutes } from "./routes/problemRoutes.js";
const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/problems", authMiddleware, problemRoutes);
