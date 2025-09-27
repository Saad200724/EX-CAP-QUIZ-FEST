
# Ex-Cap Quiz Fest 2025: The Next Chapter

A modern, full-stack web application for managing quiz competition registrations and event information. Built for the Ex-Cap Alumni Association of Savar Cantonment Public School & College.

![Quiz Fest Banner](attached_assets/Ex-Cap%20Quiz%20Fest.jpg)

## 🌟 Features

### Public Features
- **Event Landing Page**: Modern, responsive design with purple-pink gradient theme
- **Registration System**: Multi-category student registration (Classes 03-05, 06-08, 09-10, 11-12)
- **Live Countdown Timer**: Real-time countdown to registration deadline (September 27, 2025, 10:00 PM GMT+6)
- **Live Registration Count**: After deadline, displays real-time registration statistics by category
- **Contact Form**: Direct communication channel for inquiries
- **Responsive Design**: Mobile-first approach with seamless desktop experience

### Admin Features
- **Secure Admin Dashboard**: Protected admin panel with session-based authentication
- **Registration Management**: View, search, and manage all registrations
- **Real-time Search**: Search registrations by registration number
- **Export Functionality**: Download registration data as Excel files
- **Live Statistics**: Real-time registration counts and analytics

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** (Supabase) for data storage
- **Express Session** for authentication
- **Nodemailer** for email notifications

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Drizzle Kit** for database migrations
- **Hot Module Replacement** for fast development

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── db.ts              # Database schema and configuration
│   ├── routes.ts          # API route definitions
│   ├── emailService.ts    # Email notification service
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript schemas
└── attached_assets/        # Project assets and images
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database (Supabase recommended)

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="your_postgresql_connection_string"

# Admin Authentication
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_admin_password"
ADMIN_SESSION_SECRET="your_session_secret"

# Email Service (Optional)
SMTP_HOST="your_smtp_host"
SMTP_PORT="587"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
FROM_EMAIL="your_from_email"

# Server
PORT="5000"
```

### Installation & Development

```bash
# Install dependencies
npm install

# Setup database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🎯 Key Features Explained

### Registration System
- **Multi-category Support**: Separate categories for different class groups
- **Unique Registration Numbers**: Auto-generated format: `QF{timestamp}{randomString}`
- **Form Validation**: Comprehensive client and server-side validation
- **Email Confirmations**: Automatic confirmation emails (when configured)

### Admin Dashboard
- **Secure Authentication**: Username/password with session management
- **Real-time Data**: Live updates of registration statistics
- **Search Functionality**: Quick search by registration number
- **Export Capabilities**: Excel export for data analysis

### Countdown Timer
- **Real-time Updates**: Live countdown to registration deadline
- **Automatic Transition**: Switches to live registration count after deadline
- **Category Breakdown**: Shows registrations by class category
- **Live Updates**: Refreshes every 10 seconds for current data

## 🔐 Security Features

- **Protected Admin Routes**: Session-based authentication
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Session Management**: Secure session handling with httpOnly cookies
- **CORS Protection**: Configured for production security

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Pink gradient (`#933d94` → `#b52386`)
- **Background**: Clean whites and subtle grays
- **Accents**: Complementary colors for status indicators

### Typography
- **Font Family**: Inter (sans-serif)
- **Hierarchy**: Clear type scale with proper contrast ratios
- **Responsive**: Adaptive font sizes across breakpoints

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient fills with hover effects
- **Forms**: Clean inputs with validation states
- **Navigation**: Sticky header with smooth transitions

## 📊 Database Schema

### Registrations Table
```sql
- id (UUID, Primary Key)
- registrationNumber (Text, Unique)
- nameEnglish (Text)
- nameBangla (Text)
- fatherName (Text)
- motherName (Text)
- studentId (Text)
- class (Text)
- section (Text)
- bloodGroup (Text)
- phoneWhatsapp (Text)
- email (Text)
- presentAddress (Text)
- permanentAddress (Text)
- classCategory (Text)
- createdAt (Timestamp)
```

### Contact Submissions Table
```sql
- id (UUID, Primary Key)
- name (Text)
- email (Text)
- subject (Text)
- message (Text)
- createdAt (Timestamp)
```

## 🔄 API Endpoints

### Public Endpoints
- `POST /api/registrations` - Create new registration
- `POST /api/contact` - Submit contact form
- `GET /api/registrations` - Get live registration count

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/me` - Check auth status
- `GET /api/admin/registrations` - Get all registrations
- `GET /api/admin/registrations/search/:number` - Search by registration number
- `GET /api/admin/registrations/export` - Export as Excel

## 🚀 Deployment

### Replit Deployment
The application is configured for easy deployment on Replit:

1. Connect your database (Supabase recommended)
2. Set environment variables in Replit Secrets
3. Click the "Run" button to start the application
4. Use Replit's deployment feature to publish to the web

### Environment Configuration
- **Development**: Uses Vite dev server with hot reload
- **Production**: Serves static build with Express
- **Database**: Automatically connects to configured PostgreSQL instance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is developed for the Ex-Cap Alumni Association educational quiz competition.

## 📞 Contact

For technical support or inquiries about the quiz competition, please use the contact form on the website or reach out to the development team.

---

**Ex-Cap Quiz Fest 2025** - Where knowledge meets competition! 🏆
