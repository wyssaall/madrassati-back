import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectToDatabase } from "./config/db";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Madrassati API is running 🚀" });
});
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 4000;

connectToDatabase(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection failed", err));
