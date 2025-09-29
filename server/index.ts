import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import helmet from "helmet";
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

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"], // Vite dev needs eval, allow Replit scripts
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], // Allow Google Fonts
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
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

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware with enhanced security warnings
const MemoryStoreSession = MemoryStore(session);

// SECURITY WARNING for production deployments
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  SECURITY WARNING: Using MemoryStore for sessions in production!');
  console.warn('   This is NOT suitable for multi-process VPS deployments.');
  console.warn('   Sessions will be lost on restart and inconsistent across processes.');
  console.warn('   RECOMMENDATION: Use Redis or persistent session store for production.');
  console.warn('   This could be how attackers gained access - session security failure!');
}

// Enhanced session security configuration
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'dev-secret-key-123',
  resave: false,
  saveUninitialized: false,
  name: 'session_id', // Change default session name for security
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    sameSite: 'lax', // Allow cross-site requests while maintaining security
    maxAge: 2 * 60 * 60 * 1000, // Reduced to 2 hours for enhanced security
    // Remove domain restriction to allow host-only cookies
  },
  // Force session ID regeneration more frequently
  rolling: true // Reset expiration on activity
}));

// Enhanced CSRF protection middleware for admin routes
app.use('/api/admin', (req, res, next) => {
  // For state-changing operations, verify origin/referer with stronger checks
  if (req.method !== 'GET') {
    const origin = req.get('Origin') || req.get('Referer');
    const host = req.get('Host');
    const xForwardedHost = req.get('X-Forwarded-Host');
    const xForwardedProto = req.get('X-Forwarded-Proto');
    
    // Build expected host list to handle proxy scenarios
    const expectedHosts = [host];
    if (xForwardedHost) {
      expectedHosts.push(xForwardedHost);
    }
    
    // Check if origin is missing
    if (!origin) {
      console.log(`⚠️ SECURITY: Missing Origin/Referer header for ${req.method} ${req.path} - IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'CSRF protection: Missing origin header',
        message: 'Request origin must be specified'
      });
    }
    
    // Verify origin matches expected hosts
    const originMatches = expectedHosts.some(expectedHost => {
      const expectedProto = xForwardedProto || 'http';
      return origin.includes(expectedHost) || 
             origin === `${expectedProto}://${expectedHost}` ||
             origin.startsWith(`${expectedProto}://${expectedHost}/`);
    });
    
    if (!originMatches) {
      console.log(`⚠️ SECURITY: CSRF attempt detected - Origin: ${origin}, Host: ${host} - IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'CSRF protection: Invalid origin',
        message: 'Request origin does not match expected host'
      });
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