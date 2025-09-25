import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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