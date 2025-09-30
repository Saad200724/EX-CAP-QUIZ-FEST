# VPS Deployment Guide

This guide provides step-by-step instructions for deploying the Ex-CAP Quiz Fest 2025 application to a VPS server.

## Prerequisites

- VPS server with Ubuntu 20.04+ or similar Linux distribution
- Node.js 20+ installed
- PostgreSQL 12+ database (local or remote)
- Nginx (recommended) or Apache for reverse proxy
- Domain name pointed to your VPS IP (optional but recommended)

## Step 1: Server Setup

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL (if not using external database)
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

### Setup PostgreSQL Database
```bash
sudo -u postgres psql
```

In PostgreSQL console:
```sql
CREATE DATABASE excap_quiz;
CREATE USER excap_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE excap_quiz TO excap_user;
\q
```

## Step 2: Clone and Setup Application

```bash
# Clone your repository
cd /var/www
git clone <your-repo-url> excap-quiz
cd excap-quiz

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Step 3: Configure Environment Variables

Edit `.env` file with your production values:

```bash
nano .env
```

**Required Configuration:**
```env
# Database - Use your PostgreSQL connection string
DATABASE_URL=postgresql://excap_user:your_secure_password@localhost:5432/excap_quiz?sslmode=require

# Admin Credentials - Change these!
ADMIN_USERNAME=admin@excap
ADMIN_PASSWORD=<strong-password>
ADMIN_SESSION_SECRET=<random-32-char-string>

# Email (Optional - leave empty if not using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Production Settings
NODE_ENV=production
PORT=5000
FORCE_HTTPS=true
```

**Important Security Notes:**
- Generate a strong random session secret: `openssl rand -base64 32`
- Use a strong admin password
- For Gmail SMTP, create an App Password (don't use your regular password)
- Keep DATABASE_URL secure and never commit it to git

## Step 4: Initialize Database

```bash
# Push database schema
npm run db:push
```

## Step 5: Build Application

```bash
# Build frontend and backend
npm run build
```

This creates the `dist` folder with:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

## Step 6: Setup Process Manager (PM2)

Install PM2 to keep your app running:

```bash
sudo npm install -g pm2

# Start the application
pm2 start npm --name "excap-quiz" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

**Useful PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs excap-quiz    # View logs
pm2 restart excap-quiz # Restart app
pm2 stop excap-quiz    # Stop app
pm2 delete excap-quiz  # Remove from PM2
```

## Step 7: Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/excap-quiz
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/excap-quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure SSL and set up auto-renewal.

## Step 9: Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Production Checklist

Before going live, verify:

- [ ] Database connection works
- [ ] Session storage is using PostgreSQL (not MemoryStore)
- [ ] All environment variables are set correctly
- [ ] Admin credentials are strong and secure
- [ ] SSL certificate is installed and working
- [ ] Firewall rules are configured
- [ ] PM2 is running and configured to start on boot
- [ ] Email service is configured (if needed)
- [ ] Logs are being monitored: `pm2 logs excap-quiz`

## Updating the Application

When you need to deploy updates:

```bash
cd /var/www/excap-quiz

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Push any database schema changes
npm run db:push

# Rebuild the application
npm run build

# Restart with PM2
pm2 restart excap-quiz
```

## Troubleshooting

### Application won't start
Check logs: `pm2 logs excap-quiz`

### Database connection fails
- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql $DATABASE_URL`

### Sessions not persisting
- Verify NODE_ENV=production is set
- Check the `session` table exists in your database
- Logs should show "Using PostgreSQL session store for production"

### 502 Bad Gateway
- Check if app is running: `pm2 status`
- Verify port 5000 is correct in Nginx config
- Check firewall isn't blocking port 5000 locally

## Environment-Specific Notes

### Supabase Database
If using Supabase instead of local PostgreSQL:
```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Behind a Load Balancer or Reverse Proxy
The application is configured to trust proxy headers (`X-Forwarded-*`) for proper request handling.

**Important Proxy Configuration:**
- The app uses `app.set('trust proxy', true)` to trust all proxy hops
- Make sure your reverse proxy (Nginx, Apache, etc.) sets these headers:
  - `X-Forwarded-For` - Client IP address
  - `X-Forwarded-Proto` - Original protocol (http/https)
  - `X-Forwarded-Host` - Original host header

**HTTPS Redirect:**
- The app automatically redirects HTTP to HTTPS in production when it detects `X-Forwarded-Proto: http`
- If your load balancer handles SSL termination and you want to disable this redirect, set:
```env
FORCE_HTTPS=false
```

**Common Scenarios:**
- **Nginx/Apache with SSL**: Leave FORCE_HTTPS enabled (default)
- **Cloudflare/AWS ALB with SSL**: Set `FORCE_HTTPS=false` (they handle redirects)
- **No SSL/Testing**: Set `FORCE_HTTPS=false`

## Support

For issues or questions:
1. Check application logs: `pm2 logs excap-quiz`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify database connectivity
4. Ensure all environment variables are set correctly
