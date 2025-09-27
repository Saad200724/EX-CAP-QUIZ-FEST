import { 
  users, 
  registrations,
  contactSubmissions,
  type User, 
  type InsertUser,
  type Registration,
  type InsertRegistration,
  type ContactSubmission,
  type InsertContactSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Registration methods
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getRegistrationByStudentId(studentId: string): Promise<Registration | undefined>;
  getRegistrationByRegistrationNumber(registrationNumber: string): Promise<Registration | undefined>;

  // Contact submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createRegistration(data: InsertRegistration): Promise<Registration> {
    // Generate a unique 6-digit registration number
    const registrationNumber = await this.generateUniqueRegistrationNumber();

    try {
      const [registration] = await db
        .insert(registrations)
        .values({
          ...data,
          registrationNumber,
        })
        .returning();

      return registration;
    } catch (error) {
      // If registration_number column doesn't exist, create without it
      console.warn('Registration number column might not exist, creating registration without it');
      const [registration] = await db
        .insert(registrations)
        .values(data)
        .returning();

      // Add registrationNumber after creation for consistency
      return {
        ...registration,
        registrationNumber,
      };
    }
  }

  private async generateUniqueRegistrationNumber(): Promise<string> {
    // Use a sequential approach with base36 encoding for mixed text/digit format
    // This supports 36^5 = 60,466,176 unique combinations (more than enough for 10k+)
    
    let registrationNumber: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      // Generate a sequential number based on current timestamp and attempts
      // This creates a pseudo-sequential pattern that's more predictable
      const baseNumber = Date.now() + attempts;
      
      // Convert to base36 and take last 5 characters, pad with zeros if needed
      const base36Code = baseNumber.toString(36).toUpperCase().padStart(5, '0').slice(-5);
      
      // Format: QF-XXXXX (QF prefix + hyphen + 5-character alphanumeric code)
      registrationNumber = `QF-${base36Code}`;

      // Check if this number already exists
      const existingRegistration = await this.getRegistrationByRegistrationNumber(registrationNumber);
      
      if (!existingRegistration) {
        isUnique = true;
      }
      
      attempts++;
    }

    if (!isUnique) {
      // Fallback: use current timestamp in base36 format
      const fallbackCode = Date.now().toString(36).toUpperCase().slice(-5);
      registrationNumber = `QF-${fallbackCode}`;
    }

    return registrationNumber!;
  }

  async getRegistrations(): Promise<Registration[]> {
    return db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.email, email));
    return registration || undefined;
  }

  async getRegistrationByStudentId(studentId: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.studentId, studentId));
    return registration || undefined;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async getRegistrationByRegistrationNumber(registrationNumber: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, registrationNumber));
    return registration || undefined;
  }
}

export const storage = new DatabaseStorage();