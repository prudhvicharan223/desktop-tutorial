# Setup and Deployment Guide

This comprehensive guide will walk you through setting up, running, and deploying the WhatsApp Clone application.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Docker Setup](#docker-setup)
3. [Production Deployment](#production-deployment)
4. [Mobile App Build](#mobile-app-build)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Install the following on your development machine:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** v7 or higher ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn**
- **Git**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for builds): `npm install -g eas-cli`

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/whatsapp-clone.git
cd whatsapp-clone
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use any text editor
```

#### Configure .env file:

```bash
# Required settings
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your-random-secret-key-min-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key

# Optional: For OTP (leave blank to use console logging in dev)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional: For push notifications
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# CORS settings
CORS_ORIGIN=http://localhost:19006,exp://192.168.1.100:19000
```

#### Start MongoDB:

**Option 1: Local Installation**
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

**Option 2: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

#### Run Backend:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "EXPO_PUBLIC_API_URL=http://localhost:5000" > .env
echo "EXPO_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env

# For physical device testing, use your computer's IP
# echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:5000" > .env
# echo "EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:5000" >> .env
```

#### Run Frontend:

```bash
# Start Expo development server
npm start
```

This will open Expo DevTools in your browser.

#### Run on Device/Emulator:

**Android:**
- Press `a` in terminal, or
- Scan QR code with Expo Go app

**iOS:**
- Press `i` in terminal (macOS only), or
- Scan QR code with Camera app

**Web:**
- Press `w` in terminal

### Step 4: Testing the Application

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend && npm start
   ```

3. **Test Login Flow**:
   - Open the app on your device/emulator
   - Enter a phone number (e.g., `+1234567890`)
   - Check backend console for OTP (in development mode)
   - Enter the OTP to login

---

## Docker Setup

### Prerequisites

- Docker v20+
- Docker Compose v2+

### Quick Start

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Services

The Docker Compose setup includes:
- **MongoDB** on port 27017
- **Backend API** on port 5000

### Custom Configuration

Edit `docker-compose.yml` to customize:
- Port mappings
- Environment variables
- Volume mounts
- Resource limits

---

## Production Deployment

### Backend Deployment Options

#### Option 1: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add MongoDB:**
   - Go to Railway dashboard
   - Click "New" → "Database" → "MongoDB"
   - Copy connection string

4. **Set Environment Variables:**
   ```bash
   railway variables set JWT_SECRET="your-secret"
   railway variables set MONGODB_URI="mongodb://..."
   railway variables set NODE_ENV="production"
   # Add other variables
   ```

5. **Deploy:**
   ```bash
   cd backend
   railway up
   ```

#### Option 2: Render

1. **Create New Web Service:**
   - Go to [render.com](https://render.com)
   - Connect GitHub repository
   - Select `backend` directory

2. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables

3. **Add MongoDB:**
   - Use Render's MongoDB or MongoDB Atlas

#### Option 3: AWS (EC2)

1. **Launch EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t2.small or larger
   - Allow ports: 22, 80, 443, 5000

2. **Connect and Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt update
   sudo apt install -y mongodb-org

   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod

   # Install PM2
   sudo npm install -g pm2

   # Clone repository
   git clone https://github.com/your-username/whatsapp-clone.git
   cd whatsapp-clone/backend

   # Install dependencies
   npm install --production

   # Create .env file
   nano .env
   # Add production environment variables

   # Start with PM2
   pm2 start src/server.js --name whatsapp-backend
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx (Optional):**
   ```bash
   sudo apt install nginx

   # Configure nginx
   sudo nano /etc/nginx/sites-available/whatsapp

   # Add configuration:
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Enable site
   sudo ln -s /etc/nginx/sites-available/whatsapp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Database Deployment

#### MongoDB Atlas (Recommended)

1. **Create Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create Cluster:**
   - Choose free tier (M0)
   - Select region closest to your backend

3. **Setup:**
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for testing)
   - Get connection string

4. **Update Backend:**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-clone
   ```

---

## Mobile App Build

### Prerequisites

- Expo account ([signup](https://expo.dev))
- EAS CLI installed
- Android/iOS signing credentials

### Android APK Build

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login:**
   ```bash
   eas login
   ```

3. **Configure:**
   ```bash
   cd frontend
   eas build:configure
   ```

4. **Build APK (for testing):**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Build AAB (for Play Store):**
   ```bash
   eas build --platform android --profile production
   ```

6. **Download and Test:**
   - Build link will be provided
   - Download APK
   - Install on Android device

### iOS Build (macOS only)

1. **Build for Simulator:**
   ```bash
   eas build --platform ios --profile development
   ```

2. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```

### Update Frontend API URL

Before building, update the API URL:

```bash
# In frontend/.env
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
EXPO_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

---

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check MONGODB_URI in .env
- Verify network connectivity

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

#### OTP Not Sending
**Solution:**
- In development, OTP is logged to console
- Check Twilio credentials in .env
- Verify phone number format (+1234567890)

### Frontend Issues

#### Cannot Connect to Backend
**Solution:**
- Verify backend is running
- Check API URL in frontend/.env
- For physical device, use computer's IP address
- Ensure device and computer are on same network

#### Expo Build Fails
**Solution:**
```bash
# Clear cache
expo start --clear

# Reset project
rm -rf node_modules
npm install

# Update Expo
expo upgrade
```

#### Socket Connection Issues
**Solution:**
- Check WebSocket support on server
- Verify CORS_ORIGIN includes frontend URL
- Test with `wscat`: `wscat -c ws://localhost:5000`

### General Issues

#### Missing Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

#### Permission Errors
```bash
# Linux/macOS
sudo chown -R $USER:$USER .
```

#### Environment Variables Not Loading
```bash
# Ensure .env file exists
ls -la .env

# Check file contents
cat .env

# For frontend, restart Expo
```

---

## Performance Optimization

### Backend

1. **Enable Compression:**
   Already enabled in server.js

2. **Add Redis for Caching:**
   ```bash
   # Install Redis
   npm install redis

   # Use for session storage, caching
   ```

3. **Optimize Database Queries:**
   - Use projection to limit fields
   - Implement pagination
   - Add indexes for frequent queries

### Frontend

1. **Optimize Images:**
   - Use compressed images
   - Implement lazy loading
   - Cache images

2. **Reduce Bundle Size:**
   ```bash
   expo build:web --no-minify
   ```

3. **Implement Code Splitting:**
   - Use React.lazy()
   - Load screens on demand

---

## Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set proper CORS origins
- [ ] Implement rate limiting (already done)
- [ ] Validate all inputs (already done)
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Implement proper error handling
- [ ] Enable MongoDB authentication
- [ ] Use secure WebSocket (wss://)
- [ ] Implement logging and monitoring

---

## Monitoring

### Backend Logs

```bash
# Using PM2
pm2 logs whatsapp-backend

# Using Docker
docker-compose logs -f backend
```

### Database Monitoring

```bash
# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Database stats
mongo
> use whatsapp-clone
> db.stats()
```

---

## Support and Resources

- **Documentation:** [README.md](./README.md)
- **API Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **WebSocket Events:** [WEBSOCKET_EVENTS.md](./WEBSOCKET_EVENTS.md)
- **Database Schema:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## Next Steps

After setup:
1. Test all features thoroughly
2. Configure OTP and push notifications
3. Customize UI/branding
4. Add analytics
5. Implement additional features
6. Deploy to production
7. Submit to app stores

Good luck with your WhatsApp Clone deployment! 🚀
