import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectToDatabase } from "./config/db";
import { config } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import parentRoutes from "./routes/parent.routes";
import teacherRoutes from "./routes/teacher.routes";

const app = express();

// Middlewares globaux
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get("/api/v1/health", (_req, res) => {
  res.json({ 
    success: true,
    message: "Madrassati API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Route racine
app.get("/", (_req, res) => {
  res.json({ 
    message: "Madrassati API - Plateforme Scolaire",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/auth",
      student: "/api/v1/student",
      parent: "/api/v1/parent",
      teacher: "/api/v1/teacher"
    }
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/parent", parentRoutes);
app.use("/api/v1/teacher", teacherRoutes);

// Middleware de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectToDatabase(config.mongoUri);
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📚 Madrassati API - Plateforme Scolaire`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/api/v1/health`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

