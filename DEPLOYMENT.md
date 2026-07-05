# Deployment Guide

This guide covers deploying the Employee Feedback Agent to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Anthropic API key obtained
- [ ] Environment variables prepared
- [ ] Frontend build tested locally
- [ ] Backend running in production mode locally

---

## 🚀 Backend Deployment

### Option 1: Railway (Recommended - Easiest)

1. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy via GitHub**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

3. **Set Environment Variables**:
   Go to your project → Variables → Add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ANTHROPIC_API_KEY=your_anthropic_key
   CLIENT_ORIGIN=https://your-frontend-url.vercel.app
   ```

4. **Configure Start Command**:
   - Settings → Start Command: `node backend/server.js`

5. **Deploy**:
   - Railway auto-deploys on git push
   - Get your API URL from Settings

---

### Option 2: Render

1. **Create Web Service**:
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect your GitHub repository

2. **Configure Build**:
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Environment**: Node

3. **Add Environment Variables**:
   Same as Railway above

4. **Deploy**:
   Click "Create Web Service"

---

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create employee-feedback-backend
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set JWT_REFRESH_SECRET=your_refresh_secret
   heroku config:set ANTHROPIC_API_KEY=your_anthropic_key
   heroku config:set CLIENT_ORIGIN=https://your-frontend.vercel.app
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Open App**:
   ```bash
   heroku open
   ```

---

### Option 4: DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Create App → GitHub → Select repository
3. Configure:
   - **Type**: Web Service
   - **Run Command**: `node backend/server.js`
   - **HTTP Port**: 5000
4. Add environment variables
5. Deploy

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (easier):
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Environment Variables**:
   Add in Vercel dashboard:
   ```
   VITE_API_SERVER=https://your-backend-url.railway.app
   VITE_API_BASE_URL=/api
   ```

4. **Deploy**:
   Vercel auto-deploys on git push to main

---

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. New site from Git → Select repository
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Environment Variables**:
   Site settings → Environment → Add:
   ```
   VITE_API_SERVER=https://your-backend-url.railway.app
   VITE_API_BASE_URL=/api
   ```

5. Deploy

---

### Option 3: AWS S3 + CloudFront

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**:
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket
   - Enable HTTPS

4. **Update DNS**:
   Point your domain to CloudFront distribution

---

## 🗄️ MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free M0 cluster
   - Choose closest region

2. **Create Database User**:
   - Database Access → Add New User
   - Username & Password authentication
   - Give "Atlas Admin" role

3. **Network Access**:
   - Network Access → Add IP Address
   - For testing: `0.0.0.0/0` (allow from anywhere)
   - For production: Add your hosting provider's IPs

4. **Get Connection String**:
   - Databases → Connect → Drivers
   - Copy connection string
   - Replace `<username>`, `<password>`, and database name

---

## 🔑 Environment Variables Reference

### Backend (.env or hosting platform)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `5000` |
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | JWT signing secret | Random 64-char string |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret | Random 64-char string |
| `JWT_EXPIRES_IN` | ✅ | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh token expiry | `7d` |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key | `sk-ant-...` |
| `CLIENT_ORIGIN` | ✅ | Frontend URL for CORS | `https://app.vercel.app` |
| `SMTP_HOST` | ❌ | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | Email server port | `587` |
| `SMTP_USER` | ❌ | Email username | `your@email.com` |
| `SMTP_PASS` | ❌ | Email password | `your_password` |
| `SMTP_FROM` | ❌ | From email address | `noreply@company.com` |

### Frontend (.env or hosting platform)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_SERVER` | ✅ | Backend API URL | `https://api.railway.app` |
| `VITE_API_BASE_URL` | ✅ | API base path | `/api` |

---

## 🔒 Security Best Practices

1. **Secrets Generation**:
   ```bash
   # Generate secure JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **MongoDB**:
   - Use strong database passwords
   - Restrict network access to your hosting IPs
   - Enable MongoDB's built-in encryption

3. **Environment Variables**:
   - Never commit `.env` files
   - Use hosting platform's secret management
   - Rotate secrets regularly

4. **HTTPS**:
   - Always use HTTPS in production
   - Most hosting platforms provide free SSL

5. **CORS**:
   - Set `CLIENT_ORIGIN` to your exact frontend URL
   - Don't use `*` wildcard in production

---

## 🧪 Testing Production Build Locally

### Backend
```bash
NODE_ENV=production node backend/server.js
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 📊 Monitoring & Logs

### Railway
- View logs in dashboard → Deployments → Logs
- Metrics available in Observability tab

### Render
- Logs tab in service dashboard
- Auto-scaling available

### Heroku
```bash
heroku logs --tail
heroku ps
```

---

## 🐛 Common Deployment Issues

### Issue: MongoDB Connection Fails

**Solution**:
- Check `MONGODB_URI` format
- Verify network access in MongoDB Atlas
- Ensure user has correct permissions

### Issue: CORS Errors

**Solution**:
- Set `CLIENT_ORIGIN` to exact frontend URL (with https://)
- Don't include trailing slash
- Check CORS middleware in `backend/server.js`

### Issue: Build Fails

**Solution**:
- Run `npm install` locally
- Check Node.js version matches (>= 18)
- Verify all dependencies in `package.json`

### Issue: Environment Variables Not Loading

**Solution**:
- Restart the deployment after adding variables
- Check variable names (no typos)
- For Vite variables, prefix with `VITE_`

---

## 🔄 CI/CD Setup

Both Railway and Vercel automatically deploy on git push to main.

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

---

## 📞 Support

If you encounter issues:
1. Check hosting platform logs
2. Verify all environment variables
3. Test locally with production settings
4. Open an issue on GitHub

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all features:
   - User registration
   - Login/logout
   - Feedback submission
   - Dashboard analytics
   - AI sentiment analysis

2. ✅ Update repository:
   - Add deployment URLs to README
   - Tag the release

3. ✅ Monitor:
   - Check error logs
   - Monitor API response times
   - Watch database usage

---

**Congratulations! Your Employee Feedback Agent is now live! 🚀**
