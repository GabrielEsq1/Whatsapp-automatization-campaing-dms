# B2BChat - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.production` with all required variables:
- ✅ Database URL (PostgreSQL recommended for production)
- ✅ NextAuth secret and URL
- ✅ Stripe keys and price IDs
- ✅ OAuth credentials for all social platforms
- ✅ Ad network API credentials
- ✅ WhatsApp Business API credentials
- ✅ File upload service (Cloudinary or S3)
- ✅ Email service (SendGrid, Resend, etc.)

### 2. Database Migration
```bash
# Switch from SQLite to PostgreSQL
# Update DATABASE_URL in .env.production
DATABASE_URL="postgresql://user:password@host:5432/b2bchat"

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### 3. Build Application
```bash
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended for Web)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login and Deploy
```bash
vercel login
vercel --prod
```

#### Step 3: Configure Environment Variables
Go to Vercel Dashboard → Project Settings → Environment Variables
Add all variables from `.env.example`

#### Step 4: Configure Database
- Use Vercel Postgres or external PostgreSQL (Supabase, Railway, etc.)
- Update `DATABASE_URL` in Vercel environment variables

#### Step 5: Custom Domain
- Add custom domain in Vercel dashboard
- Update `NEXTAUTH_URL` to your domain

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: b2bchat
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: b2bchat
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
docker-compose up -d
```

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/b2bchat.git
cd b2bchat

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start with PM2
pm2 start npm --name "b2bchat" -- start
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 4: SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Mobile App Deployment

### iOS (App Store)

#### Step 1: Configure EAS
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
```

#### Step 2: Build for iOS
```bash
eas build --platform ios --profile production
```

#### Step 3: Submit to App Store
```bash
eas submit --platform ios
```

### Android (Google Play)

#### Step 1: Build for Android
```bash
eas build --platform android --profile production
```

#### Step 2: Submit to Google Play
```bash
eas submit --platform android
```

## Post-Deployment

### 1. Database Seeding (Optional)
```bash
npx tsx scripts/create-test-users.ts
npx tsx scripts/create-sample-stores.ts
```

### 2. Monitoring
- Set up Sentry for error tracking
- Configure Google Analytics
- Set up uptime monitoring (UptimeRobot, Pingdom)

### 3. Backups
```bash
# PostgreSQL backup
pg_dump -U username -d b2bchat > backup.sql

# Automated backups with cron
0 2 * * * pg_dump -U username -d b2bchat > /backups/b2bchat-$(date +\%Y\%m\%d).sql
```

### 4. Performance Optimization
- Enable Redis for caching
- Configure CDN for static assets
- Optimize images with Next.js Image component
- Enable gzip compression

### 5. Security
- Enable HTTPS everywhere
- Configure CORS properly
- Set up rate limiting
- Regular security updates
- Use environment variables for all secrets

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple app instances with PM2 cluster mode
- Separate database server

### Vertical Scaling
- Upgrade server resources
- Optimize database queries
- Use database connection pooling

## Troubleshooting

### Common Issues

**Issue**: Database connection errors
**Solution**: Check DATABASE_URL and firewall rules

**Issue**: NextAuth errors
**Solution**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL

**Issue**: Build failures
**Solution**: Clear `.next` folder and rebuild

**Issue**: Socket.IO not working
**Solution**: Ensure WebSocket support in reverse proxy

## Support
For deployment help, contact: soporte@b2bchat.com
