# Overview

This is a landing page for "Ex-Cap Quiz Fest 2025: The Next Chapter" - an educational quiz competition event for university students. The application is built as a full-stack web application with a React frontend and Express.js backend, designed to handle event registrations and contact submissions for the quiz competition.

The project features a modern, responsive design with a purple-pink gradient theme, following Material Design principles and using shadcn/ui components for a polished user interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with a custom design system featuring purple/pink gradients
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with Vite integration for full-stack development

## Database Design
- **Schema**: Three main entities - users, registrations, and contact submissions
- **Registration Model**: Captures participant details including name, email, university, phone, team information
- **Contact Model**: Handles general inquiries with name, email, subject, and message
- **User Model**: Basic authentication structure (username/password)

## API Structure
- **RESTful Design**: Express routes following REST conventions
- **Registration Endpoints**: POST /api/registrations for new registrations, GET for listing
- **Contact Endpoints**: POST /api/contact for contact form submissions
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Validation**: Request body validation using Zod schemas before database operations

## Design System
- **Color Palette**: Primary purple (#933d94) to accent pink (#b52386) gradient theme
- **Typography**: Modern sans-serif fonts (Inter family) with clear hierarchy
- **Components**: Consistent card-based layouts with rounded corners and subtle shadows
- **Responsive**: Mobile-first design with responsive breakpoints
- **Animations**: Hover effects and smooth transitions throughout the interface

# External Dependencies

## Database
- **PostgreSQL Database**: Works with any PostgreSQL database (Supabase, Neon, or self-hosted)
- **Connection**: Direct PostgreSQL connection using pg library with SSL
- **Pool Configuration**: Production-ready connection pooling with automatic retry and error handling
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Session Storage**: Uses connect-pg-simple for PostgreSQL-backed sessions in production (MemoryStore in development)
- **Status**: Connected and operational with synchronized schema

## VPS Deployment
- **Environment**: Supports deployment to any VPS server (Ubuntu, Debian, etc.)
- **Proxy Support**: Configured to work behind Nginx, Apache, or cloud load balancers
- **Session Management**: Production uses PostgreSQL for session persistence (no MemoryStore issues)
- **Security**: Proper SSL handling, HTTPS redirects, HSTS headers, and proxy trust configuration
- **Documentation**: Comprehensive deployment guide in DEPLOYMENT.md
- **Environment Variables**: Uses .env in development, system environment variables in production

## UI Framework
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component library combining Radix UI with Tailwind styling

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **ESLint/Prettier**: Code formatting and linting for consistency

## Form Handling
- **React Hook Form**: Performance-optimized form state management
- **Zod**: Schema validation for both client and server-side validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Additional Libraries
- **TanStack Query**: Server state management with caching and background updates
- **date-fns**: Date manipulation and formatting utilities
- **Lucide React**: Modern icon library for consistent iconography
- **class-variance-authority**: Type-safe component variant management