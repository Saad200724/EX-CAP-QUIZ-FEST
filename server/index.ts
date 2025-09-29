import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET'
];

// Optional email service environment variables
const emailEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASS',
  'FROM_EMAIL'
];

const missingEmailVars = emailEnvVars.filter(envVar => !process.env[envVar]);
if (missingEmailVars.length > 0) {
  console.warn('⚠️ Email service not configured. Missing environment variables:', missingEmailVars);
  console.warn('Email confirmations will be skipped. Add these variables to enable email notifications.');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file contains all required variables.');
  process.exit(1);
}

const app = express();
// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware with memory store
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'dev-secret-key-123',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    sameSite: 'strict', // CSRF protection
    maxAge: 4 * 60 * 60 * 1000 // Reduced to 4 hours for security
  }
}));

// CSRF protection middleware for admin routes
app.use('/api/admin', (req, res, next) => {
  // For state-changing operations, verify origin/referer
  if (req.method !== 'GET') {
    const origin = req.get('Origin') || req.get('Referer');
    const host = req.get('Host');
    
    if (!origin || !origin.includes(host)) {
      return res.status(403).json({ error: 'CSRF protection: Invalid origin' });
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();