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

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await db
      .insert(registrations)
      .values(registration)
      .returning();
    return newRegistration;
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
}

export const storage = new DatabaseStorage();
