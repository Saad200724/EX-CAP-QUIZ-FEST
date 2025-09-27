import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Extend Express Request type for admin session
declare module 'express-session' {
  interface SessionData {
    adminUser?: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: Express.Session & Partial<Express.SessionData> & { adminUser?: string };
}

// Admin middleware
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.adminUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Constant-time string comparison for credentials
function compareCredentials(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  const adminLoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
  });

  app.post("/api/admin/login", async (req: AuthenticatedRequest, res) => {
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
      
      // Set session
      req.session.adminUser = username;
      
      res.json({ 
        success: true,
        message: 'Login successful'
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
    res.json({ authenticated: true, user: req.session.adminUser });
  });

  // Protected admin data routes
  app.get("/api/admin/registrations", requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch registrations"
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
  // Registration routes
  app.post("/api/registrations", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Check if email is already registered
      const existingRegistration = await storage.getRegistrationByEmail(validatedData.email);
      if (existingRegistration) {
        return res.status(409).json({
          error: "Email already registered",
          message: "This email address is already registered for the event."
        });
      }
      
      // Create registration
      const registration = await storage.createRegistration(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Registration created successfully",
        data: registration
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

  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch registrations"
      });
    }
  });

  // Contact form routes
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Create contact submission
      const submission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Contact submission created successfully",
        data: submission
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

  app.get("/api/contact", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}