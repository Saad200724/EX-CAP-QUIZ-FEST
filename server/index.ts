// Load environment variables from .env file in development
// In production, environment variables should be set by the system
// If .env doesn't exist, dotenv will silently skip loading
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

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
  console.error('Please check your environment variables are set correctly.');
  process.exit(1);
}

const app = express();
// Trust proxy - for production behind reverse proxy/load balancer
// Set to true to trust all proxies, or specify the number of hops
app.set('trust proxy', true);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite dev needs eval
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"], // Allow WebSocket for Vite HMR
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], // Allow Google Fonts
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false, // Disable HSTS in development
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'none'"],
    },
  },
}));

// Force HTTPS in production (only if behind a proxy that sets x-forwarded-proto)
// Set FORCE_HTTPS=false in environment to disable this
if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS !== 'false') {
  app.use((req, res, next) => {
    // Only redirect if we have the forwarded proto header and it's not https
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware with production-ready session store
const PgSession = connectPgSimple(session);
const MemoryStoreSession = MemoryStore(session);

// Choose session store based on environment
const sessionStore = process.env.NODE_ENV === 'production'
  ? new PgSession({
      pool: pool, // Use the existing database pool
      tableName: 'session', // Table name for sessions
      createTableIfMissing: true, // Auto-create table if needed
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
    })
  : new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

if (process.env.NODE_ENV === 'production') {
  console.log('✅ Using PostgreSQL session store for production');
} else {
  console.log('⚠️ Using MemoryStore for development (sessions will be lost on restart)');
}

// Enhanced session security configuration
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'dev-secret-key-123',
  resave: false,
  saveUninitialized: false,
  name: 'session_id', // Change default session name for security
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    sameSite: 'lax', // Allow cross-site requests while maintaining security
    maxAge: 2 * 60 * 60 * 1000, // 2 hours for enhanced security
    // Remove domain restriction to allow host-only cookies
  },
  // Force session ID regeneration more frequently
  rolling: true // Reset expiration on activity
}));

// Simplified CSRF protection for admin routes
// Only logs suspicious requests but doesn't block them to avoid false positives
app.use('/api/admin', (req, res, next) => {
  if (req.method !== 'GET') {
    const origin = req.get('Origin') || req.get('Referer');
    const host = req.get('Host');
    
    // Log suspicious requests for monitoring
    if (!origin) {
      console.warn(`⚠️ Admin request without Origin/Referer: ${req.method} ${req.path} - IP: ${req.ip}`);
    } else if (!origin.includes(host || '')) {
      console.warn(`⚠️ Admin request with mismatched origin: ${origin} vs ${host} - IP: ${req.ip}`);
    }
  }
  next();
});

// Logging middleware - NO PII in logs for security
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Log only method, path, status, and duration - NO response body to prevent PII leaks
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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
  // Default to 5000 if not specified.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
