# NeoBoard Deployment Guide

This guide covers deploying NeoBoard to various hosting platforms for both development and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Setup](#database-setup)
6. [Domain and SSL](#domain-and-ssl)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying NeoBoard, ensure you have:

- Node.js 18+ installed locally
- MongoDB Atlas account (or self-hosted MongoDB)
- Git repository access
- Domain name (for production)
- Hosting platform accounts (Vercel, Netlify, Railway, etc.)

## Environment Configuration

### Development Environment

Create a `.env` file in your project root:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard-dev
MONGO_USER=your-username
MONGO_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend API URL
VITE_API_URL=http://localhost:3001/api
```

### Production Environment

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod
MONGO_USER=your-username
MONGO_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Frontend API URL
VITE_API_URL=https://api.your-domain.com/api
```

## Frontend Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```

4. **Custom Domain**
   - Add your domain in Vercel dashboard
   - Configure DNS records as instructed

### Netlify Deployment

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Git**
   - Connect your repository in Netlify dashboard
   - Set build command and publish directory
   - Add environment variables

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```

### Manual Deployment

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Upload to Static Hosting**
   Upload the `dist` folder to your static hosting provider (AWS S3, DigitalOcean Spaces, etc.)

3. **Configure Web Server**
   For Apache, create `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

   For Nginx:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Backend Deployment

### Railway Deployment

1. **Connect Repository**
   - Go to Railway dashboard
   - Create new project from GitHub repo
   - Select the repository

2. **Environment Variables**
   Add in Railway dashboard:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   PORT=3001
   ```

3. **Build Configuration**
   Railway auto-detects Node.js. Ensure your `package.json` has:
   ```json
   {
     "scripts": {
       "start": "node server/index.js",
       "build": "tsc server/index.ts --outDir dist"
     }
   }
   ```

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Configure Environment Variables**
   ```bash
   heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod"
   heroku config:set JWT_SECRET="your-production-jwt-secret"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Procfile**
   Create `Procfile` in root:
   ```
   web: node server/index.js
   ```

### DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean dashboard
   - Create new app from GitHub

2. **Configure Build**
   ```yaml
   name: neoboard-api
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/neoboard
       branch: main
     run_command: node server/index.js
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: MONGO_URI
       value: mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod
     - key: JWT_SECRET
       value: your-production-jwt-secret
     - key: NODE_ENV
       value: production
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --only=production
   
   # Copy source code
   COPY . .
   
   # Build TypeScript
   RUN npm run build
   
   # Expose port
   EXPOSE 3001
   
   # Start server
   CMD ["node", "dist/server/index.js"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     api:
       build: .
       ports:
         - "3001:3001"
       environment:
         - MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod
         - JWT_SECRET=your-production-jwt-secret
         - NODE_ENV=production
         - FRONTEND_URL=https://your-frontend-domain.com
       restart: unless-stopped
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Database Setup

### MongoDB Atlas

1. **Create Cluster**
   - Sign up for MongoDB Atlas
   - Create a new cluster
   - Choose your preferred region

2. **Configure Network Access**
   - Add IP addresses that need access
   - For cloud deployments, add `0.0.0.0/0` (all IPs)

3. **Create Database User**
   - Create a database user with read/write permissions
   - Use a strong password

4. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/neoboard-prod?retryWrites=true&w=majority
   ```

### Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # CentOS/RHEL
   sudo yum install mongodb
   
   # macOS
   brew install mongodb
   ```

2. **Configure MongoDB**
   Edit `/etc/mongod.conf`:
   ```yaml
   net:
     port: 27017
     bindIp: 0.0.0.0
   
   security:
     authorization: enabled
   ```

3. **Create Database and User**
   ```javascript
   use neoboard
   db.createUser({
     user: "neoboard",
     pwd: "secure-password",
     roles: [{ role: "readWrite", db: "neoboard" }]
   })
   ```

## Domain and SSL

### Custom Domain Setup

1. **DNS Configuration**
   Add these DNS records:
   ```
   Type: A
   Name: @
   Value: [Your server IP]
   
   Type: CNAME
   Name: www
   Value: your-domain.com
   
   Type: CNAME
   Name: api
   Value: your-api-domain.com
   ```

2. **SSL Certificate**
   Most hosting platforms provide automatic SSL. For manual setup:
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Cloudflare Setup

1. **Add Site to Cloudflare**
   - Add your domain to Cloudflare
   - Update nameservers

2. **Configure DNS**
   - Add A records for your servers
   - Enable proxy for web traffic

3. **SSL/TLS Settings**
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
   Your API includes `/api/health` endpoint for monitoring

2. **Uptime Monitoring**
   Use services like:
   - UptimeRobot
   - Pingdom
   - StatusCake

3. **Application Performance**
   - New Relic
   - DataDog
   - Sentry for error tracking

### Logging

1. **Server Logs**
   ```javascript
   // Add to server/index.js
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Log Aggregation**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - Papertrail

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Ensure CORS is configured correctly
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

2. **Database Connection Issues**
   ```javascript
   // Check MongoDB connection string
   console.log('MongoDB URI:', process.env.MONGO_URI);
   ```

3. **Environment Variables Not Loading**
   ```javascript
   // Ensure dotenv is loaded first
   import dotenv from 'dotenv';
   dotenv.config();
   ```

4. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

1. **Frontend Optimization**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['lucide-react']
           }
         }
       }
     }
   });
   ```

2. **Backend Optimization**
   ```javascript
   // Add compression middleware
   import compression from 'compression';
   app.use(compression());
   
   // Enable gzip
   app.use(express.static('public', {
     setHeaders: (res, path) => {
       if (path.endsWith('.js') || path.endsWith('.css')) {
         res.setHeader('Content-Encoding', 'gzip');
       }
     }
   }));
   ```

3. **Database Optimization**
   ```javascript
   // Add database indexes
   db.threads.createIndex({ boardId: 1, createdAt: -1 });
   db.posts.createIndex({ threadId: 1, createdAt: 1 });
   db.users.createIndex({ email: 1 }, { unique: true });
   ```

### Security Checklist

- [ ] Environment variables are secure and not exposed
- [ ] JWT secret is strong and unique
- [ ] Database has authentication enabled
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] File upload restrictions are in place
- [ ] Security headers are set (Helmet.js)
- [ ] Dependencies are up to date

## Backup and Recovery

### Database Backup

```bash
# MongoDB Atlas - Use built-in backup
# Self-hosted MongoDB
mongodump --uri="mongodb://username:password@localhost:27017/neoboard" --out=/backup/$(date +%Y%m%d)
```

### Application Backup

```bash
# Backup uploaded files
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Backup configuration
cp .env .env.backup.$(date +%Y%m%d)
```

### Recovery Plan

1. **Database Recovery**
   ```bash
   mongorestore --uri="mongodb://username:password@localhost:27017/neoboard" /backup/20240101
   ```

2. **Application Recovery**
   - Redeploy from Git repository
   - Restore environment variables
   - Restore uploaded files

## Support

For deployment support:

- Documentation: [Deployment Guide](./DEPLOYMENT.md)
- Issues: [GitHub Issues](../../issues)
- Community: [Discord Server](https://discord.gg/neoboard)
- Email: support@neoboard.com