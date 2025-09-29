import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { createGoogleSheetsService } from "./googleSheets";
import { createEmailService } from "./emailService";

// Rate limiting storage
const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Extend Express Request type for admin session
declare module 'express-session' {
  interface SessionData {
    adminUser?: string;
    twoFactorVerified?: boolean;
    twoFactorSecret?: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: Express.Session & Partial<Express.SessionData> & { adminUser?: string };
}

// Rate limiting middleware
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${req.route?.path}_${clientIp}`;
    const now = Date.now();
    
    const limit = rateLimits.get(key);
    
    if (!limit || now > limit.resetTime) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.' 
      });
    }
    
    limit.count++;
    next();
  };
}

// Admin middleware with 2FA verification
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.adminUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Additional session validation
  if (!req.session.adminUser || req.session.adminUser.length < 3) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  // Check if 2FA is enabled and verified
  const twoFactorSecret = process.env.ADMIN_2FA_SECRET;
  if (twoFactorSecret && !req.session.twoFactorVerified) {
    return res.status(403).json({ 
      error: '2FA required',
      message: 'Two-factor authentication verification required',
      requiresTwoFactor: true
    });
  }
  
  next();
}

// Constant-time string comparison for credentials
function compareCredentials(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// Server-side data redaction for security - masks PII
function redactRegistration(reg: any) {
  // Mask phone numbers: show first 3 and last 3 digits
  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 7) return '***';
    return phone.substring(0, 3) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 3);
  };
  
  // Mask email: show first 2 chars and domain
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain || local.length < 2) return '***@***';
    return local.substring(0, 2) + '****@' + domain;
  };
  
  // Mask addresses: show only first 20 characters
  const maskAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return address.substring(0, 20) + '...';
  };
  
  // Mask names: show only first name
  const maskName = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts[0] + (parts.length > 1 ? ' ***' : '');
  };
  
  return {
    ...reg,
    nameEnglish: reg.nameEnglish, // Keep for admin reference
    nameBangla: reg.nameBangla, // Keep for admin reference
    fatherName: maskName(reg.fatherName),
    motherName: maskName(reg.motherName),
    email: maskEmail(reg.email),
    phoneWhatsapp: maskPhone(reg.phoneWhatsapp),
    presentAddress: maskAddress(reg.presentAddress),
    permanentAddress: maskAddress(reg.permanentAddress),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes with stronger validation
  const adminLoginSchema = z.object({
    username: z.string().min(3).max(50).trim(),
    password: z.string().min(6).max(100)
  });

  app.post("/api/admin/login", rateLimit(5, 15 * 60 * 1000), async (req: AuthenticatedRequest, res) => { // 5 attempts per 15 minutes
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      
      if (!adminUsername || !adminPassword) {
        console.error('Missing admin environment variables:', {
          hasUsername: !!adminUsername,
          hasPassword: !!adminPassword
        });
        return res.status(500).json({ 
          error: 'Admin authentication not configured',
          message: 'Please configure ADMIN_USERNAME and ADMIN_PASSWORD in environment variables' 
        });
      }
      
      // Constant-time comparison to prevent timing attacks
      const usernameValid = compareCredentials(username, adminUsername);
      const passwordValid = compareCredentials(password, adminPassword);
      
      if (!usernameValid || !passwordValid) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Username or password is incorrect' 
        });
      }
      
      // Regenerate session ID for security (prevents session fixation)
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        
        // Set session
        req.session.adminUser = username;
        
        // Check if 2FA is enabled
        const twoFactorSecret = process.env.ADMIN_2FA_SECRET;
        if (twoFactorSecret) {
          // 2FA is enabled, require verification
          req.session.twoFactorVerified = false;
          return res.json({ 
            success: true,
            requiresTwoFactor: true,
            message: 'Please enter your 2FA code'
          });
        }
        
        // No 2FA, login successful
        req.session.twoFactorVerified = true;
        res.json({ 
          success: true,
          requiresTwoFactor: false,
          message: 'Login successful'
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Please provide valid username and password'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Login failed'
      });
    }
  });

  app.post("/api/admin/logout", (req: AuthenticatedRequest, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  });

  app.get("/api/admin/me", requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json({ 
      authenticated: true, 
      user: req.session.adminUser,
      twoFactorEnabled: !!process.env.ADMIN_2FA_SECRET,
      twoFactorVerified: req.session.twoFactorVerified || false
    });
  });
  
  // 2FA verification endpoint
  const twoFactorVerifySchema = z.object({
    token: z.string().length(6, "2FA code must be 6 digits")
  });
  
  app.post("/api/admin/2fa/verify", rateLimit(5, 60 * 1000), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.session?.adminUser) {
        return res.status(401).json({ error: 'Please login first' });
      }
      
      const { token } = twoFactorVerifySchema.parse(req.body);
      const twoFactorSecret = process.env.ADMIN_2FA_SECRET;
      
      if (!twoFactorSecret) {
        return res.status(400).json({ 
          error: '2FA not configured',
          message: '2FA is not enabled on this system'
        });
      }
      
      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds) tolerance
      });
      
      if (!verified) {
        console.log(`⚠️ SECURITY: Failed 2FA attempt by ${req.session.adminUser} at ${new Date().toISOString()} - IP: ${req.ip}`);
        return res.status(401).json({
          error: 'Invalid code',
          message: 'The 2FA code you entered is invalid or expired'
        });
      }
      
      // Mark session as 2FA verified
      req.session.twoFactorVerified = true;
      
      console.log(`✅ 2FA verification successful for ${req.session.adminUser} at ${new Date().toISOString()} - IP: ${req.ip}`);
      
      res.json({
        success: true,
        message: '2FA verification successful'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: '2FA code must be 6 digits'
        });
      }
      
      console.error('2FA verification error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify 2FA code'
      });
    }
  });
  
  // 2FA setup endpoint - generates QR code for initial setup
  app.post("/api/admin/2fa/setup", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Check if 2FA is already enabled
      if (process.env.ADMIN_2FA_SECRET) {
        return res.status(400).json({
          error: '2FA already enabled',
          message: '2FA is already configured for this system'
        });
      }
      
      // Generate a new secret
      const secret = speakeasy.generateSecret({
        name: `Quiz Fest Admin (${req.session.adminUser})`,
        issuer: 'Ex-CAP Quiz Fest 2025'
      });
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
      
      console.log(`🔐 2FA setup initiated by ${req.session.adminUser} at ${new Date().toISOString()}`);
      console.log(`⚠️ IMPORTANT: Save this secret key: ${secret.base32}`);
      console.log(`Add ADMIN_2FA_SECRET=${secret.base32} to your environment variables`);
      
      res.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)'
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to setup 2FA'
      });
    }
  });

  // Secure CSV Export endpoint - requires re-authentication with POST for CSRF protection
  const csvExportSchema = z.object({
    password: z.string().min(6, "Password is required for verification"),
    category: z.enum(["all", "03-05", "06-08", "09-10", "11-12"]).optional().default("all")
  });
  
  app.post("/api/admin/export/csv", requireAdmin, rateLimit(3, 60 * 1000), async (req: AuthenticatedRequest, res) => { // 3 exports per minute
    try {
      // Validate request body
      const { password, category } = csvExportSchema.parse(req.body);
      
      // Require password re-entry for security
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || !compareCredentials(password, adminPassword)) {
        // Log failed export attempt
        console.log(`⚠️ SECURITY: Failed CSV export attempt by ${req.session.adminUser} at ${new Date().toISOString()} - IP: ${req.ip} - Invalid password`);
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid password. Please re-enter your password to export data."
        });
      }
      
      const registrations = await storage.getRegistrations();
      
      // Filter by category if specified
      let dataToExport = registrations;
      if (category !== "all") {
        dataToExport = registrations.filter(r => r.classCategory === category);
      }
      
      // Log successful export for security audit
      console.log(`📥 CSV EXPORT: ${req.session.adminUser} exported ${dataToExport.length} registrations (category: ${category}) at ${new Date().toISOString()} - IP: ${req.ip}`);
      
      res.json({
        success: true,
        data: dataToExport,
        meta: {
          exportedBy: req.session.adminUser,
          exportedAt: new Date().toISOString(),
          category: category,
          recordCount: dataToExport.length
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Please provide a valid password"
        });
      }
      
      console.error("Failed to export CSV:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to export data"
      });
    }
  });

  app.get("/api/admin/registrations/search/:searchTerm", requireAdmin, rateLimit(20, 60 * 1000), async (req, res) => { // 20 searches per minute
    try {
      const { searchTerm } = req.params;
      
      // Prevent caching to avoid 304 responses that frontend treats as errors
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      if (!searchTerm) {
        return res.status(400).json({
          error: "Validation error",
          message: "Search term is required"
        });
      }

      // Input sanitization
      const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9-]/g, '');
      if (sanitizedSearchTerm.length < 2) {
        return res.status(400).json({
          error: "Validation error",
          message: "Search term must be at least 2 characters long"
        });
      }
      
      // First try searching by registration number
      let registration = await storage.getRegistrationByRegistrationNumber(sanitizedSearchTerm);
      
      // If not found by registration number, try searching by student ID
      if (!registration) {
        registration = await storage.getRegistrationByStudentId(sanitizedSearchTerm);
      }
      
      if (!registration) {
        return res.status(404).json({
          error: "Not found",
          message: "No registration found with this registration ID or student ID"
        });
      }
      
      // Log admin search for security audit
      console.log(`🔍 Admin search: ${req.session.adminUser} searched for "${sanitizedSearchTerm}" at ${new Date().toISOString()} - IP: ${req.ip}`);

      // Return REDACTED data for security - server-side masking prevents client bypass
      res.json({
        success: true,
        data: redactRegistration(registration)
      });
    } catch (error) {
      console.error("Failed to search registration:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to search registration"
      });
    }
  });

  app.get("/api/admin/contact", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      console.error("Failed to fetch contact submissions:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch contact submissions"
      });
    }
  });
  // Public statistics endpoint - only returns counts, no personal data
  app.get("/api/registration-stats", async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      
      // Only return statistical data, no personal information
      const stats = {
        total: registrations.length,
        categoryBreakdown: {
          "03-05": registrations.filter(r => r.classCategory === "03-05").length,
          "06-08": registrations.filter(r => r.classCategory === "06-08").length,
          "09-10": registrations.filter(r => r.classCategory === "09-10").length,
          "11-12": registrations.filter(r => r.classCategory === "11-12").length,
        }
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Failed to fetch registration statistics:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch registration statistics"
      });
    }
  });

  // Registration routes with rate limiting
  app.post("/api/registrations", rateLimit(3, 60 * 1000), async (req, res) => { // 3 registrations per minute per IP
    try {
      // Validate request body
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Check if student ID is already registered (unique per student)
      const existingStudentRegistration = await storage.getRegistrationByStudentId(validatedData.studentId);
      if (existingStudentRegistration) {
        return res.status(409).json({
          error: "Student ID already registered",
          message: "A student with this Student ID is already registered for the event."
        });
      }
      
      // Create registration
      const registration = await storage.createRegistration(validatedData);
      
      // Send to Google Sheets (async, don't wait for it to complete)
      const googleSheetsService = createGoogleSheetsService();
      if (googleSheetsService) {
        googleSheetsService.addRegistration(registration)
          .then(() => {
            console.log(`📊 Registration for ${registration.nameEnglish} sent to Google Sheets`);
          })
          .catch((error) => {
            console.error(`❌ Failed to send registration to Google Sheets:`, error);
            // Don't fail the main registration if Google Sheets fails
          });
      }

      // Send confirmation email (async, don't wait for it to complete)
      if (registration.email) {
        const emailService = createEmailService();
        if (emailService) {
          emailService.sendRegistrationConfirmation(registration)
            .then(() => {
              console.log(`📧 Confirmation email sent to ${registration.nameEnglish} (${registration.email})`);
            })
            .catch((error) => {
              console.error(`❌ Failed to send confirmation email to ${registration.email}:`, error);
              // Don't fail the main registration if email fails
            });
        }
      }
      
      res.status(201).json({
        success: true,
        message: "Registration created successfully",
        data: {
          registrationNumber: registration.registrationNumber,
          message: "Your registration has been confirmed. You will receive a confirmation email shortly."
        }
      });
    } catch (error) {
      console.error("Registration creation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Please check your input data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create registration"
      });
    }
  });


  // Contact form routes with rate limiting
  app.post("/api/contact", rateLimit(5, 60 * 1000), async (req, res) => { // 5 contact submissions per minute
    try {
      // Validate request body
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Create contact submission
      const submission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Contact submission created successfully",
        data: {
          message: "Your message has been received. We will get back to you soon."
        }
      });
    } catch (error) {
      console.error("Contact submission creation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Please check your input data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to submit contact form"
      });
    }
  });


  const httpServer = createServer(app);

  return httpServer;
}