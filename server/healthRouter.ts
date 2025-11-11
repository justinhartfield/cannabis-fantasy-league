import { Router } from "express";
import { getDb } from "./db";

export const healthRouter = Router();

// Basic health check
healthRouter.get("/health", async (req, res) => {
  try {
    // Check database connection
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database not available"
      });
    }
    await db.execute("SELECT 1");
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Detailed status endpoint
healthRouter.get("/status", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        status: "degraded",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: "disconnected",
          error: "Database not available"
        },
        environment: process.env.NODE_ENV || "development"
      });
    }
    const dbCheck = await db.execute("SELECT 1");
    
    res.status(200).json({
      status: "operational",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        type: "mysql"
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown"
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      environment: process.env.NODE_ENV || "development"
    });
  }
});
