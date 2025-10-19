# 🚀 GitHub Pages Deployment Guide for ADRD Knowledge Graph

Deploy your React frontend to GitHub Pages with an external backend service.

## 📋 Overview

This deployment strategy uses:
- **Frontend**: React app hosted on GitHub Pages (free)
- **Backend**: Django API hosted on Railway/Heroku/Render (free tier available)
- **Database**: PostgreSQL on the backend platform

## 🎯 Quick Start

### 1. Setup GitHub Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

### 2. Deploy Backend First

Choose one of these platforms for your Django backend:

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Note the deployment URL (e.g., https://your-app.railway.app)
```

#### Option B: Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
git push heroku main

# Note the deployment URL (e.g., https://your-app.herokuapp.com)
```

#### Option C: Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Use the provided URL

### 3. Configure Frontend for External Backend

1. **Set API URL in GitHub repository**:
   - Go to Settings → Secrets and variables → Actions
   - Add repository variable:
     - Name: `API_BASE_URL`
     - Value: `https://your-backend-url.railway.app/api`

2. **The GitHub Action will automatically deploy** when you push to main

## ⚙️ Configuration

### GitHub Repository Settings

#### Required Repository Variables
Go to Settings → Secrets and variables → Actions → Variables:

```bash
API_BASE_URL=https://your-backend-url.railway.app/api
```

#### Optional Repository Secrets
Go to Settings → Secrets and variables → Actions → Secrets:

```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX  # If using analytics
```

### Backend Platform Setup

#### Railway Configuration
1. **Create Railway project**:
   ```bash
   railway init
   ```

2. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

3. **Set environment variables**:
   ```bash
   railway variables set SECRET_KEY=your-secret-key
   railway variables set DEBUG=False
   railway variables set ALLOWED_HOSTS=your-app.railway.app
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

#### Heroku Configuration
1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set DJANGO_SETTINGS_MODULE=adrd_kg.settings_production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 📁 Project Structure

```
ADRD-KG/
├── .github/
│   └── workflows/
│       └── deploy-github-pages.yml  # GitHub Pages deployment
├── backend/                         # Deploy to Railway/Heroku
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/                        # Deploy to GitHub Pages
│   ├── package.json
│   ├── src/
│   └── ...
└── README.md
```

## 🔧 Advanced Configuration

### Custom Domain for GitHub Pages

1. **Add CNAME file**:
   ```bash
   echo "yourdomain.com" > frontend/public/CNAME
   ```

2. **Update DNS records**:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

3. **Update repository settings**:
   - Go to Settings → Pages
   - Custom domain: yourdomain.com
   - Enforce HTTPS: ✓

### CORS Configuration

Update your backend settings to allow GitHub Pages:

```python
# In your Django settings
CORS_ALLOWED_ORIGINS = [
    "https://yourusername.github.io",
    "https://yourdomain.com",  # If using custom domain
    "http://localhost:3000",   # For development
]
```

### Environment-Specific API URLs

The frontend automatically detects the environment:

```typescript
// In frontend/src/services/api.ts
const getApiBaseUrl = () => {
  // Development
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  // Production with external backend
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback
  return '/api';
};
```

## 🚀 Deployment Process

### Automatic Deployment

The GitHub Action (`.github/workflows/deploy-github-pages.yml`) automatically:

1. **Triggers on**:
   - Push to main branch
   - Manual workflow dispatch

2. **Build process**:
   - Installs Node.js dependencies
   - Builds React app with correct API URL
   - Deploys to GitHub Pages

3. **Environment variables**:
   - Uses `API_BASE_URL` repository variable
   - Configures Vite build process

### Manual Deployment

```bash
# Build frontend locally
cd frontend
npm run build

# The build output goes to frontend/dist/
# GitHub Actions will handle the deployment
```

## 🔍 Monitoring and Debugging

### Check Deployment Status

1. **GitHub Actions**:
   - Go to Actions tab in your repository
   - Check workflow runs and logs

2. **GitHub Pages**:
   - Go to Settings → Pages
   - Check deployment status

### Debug Common Issues

#### 1. API Connection Issues
```bash
# Check CORS settings on backend
# Verify API_BASE_URL in repository variables
# Check browser network tab for failed requests
```

#### 2. Build Failures
```bash
# Check GitHub Actions logs
# Verify package.json scripts
# Ensure all dependencies are listed
```

#### 3. Routing Issues (404 on refresh)
```bash
# GitHub Pages doesn't support SPA routing by default
# The workflow includes a 404.html workaround
```

### View Logs

```bash
# GitHub Actions logs
# Go to repository → Actions → Select workflow run

# Backend logs (Railway example)
railway logs

# Backend logs (Heroku example)
heroku logs --tail
```

## 💰 Cost Analysis

### GitHub Pages (Free)
- **Storage**: 1GB
- **Bandwidth**: 100GB/month
- **Build minutes**: 2,000 minutes/month (free tier)

### Backend Options

#### Railway (Free Tier)
- **Usage**: $5 credit/month
- **Memory**: 512MB
- **vCPU**: Shared
- **Storage**: 1GB

#### Heroku (Free Tier Discontinued)
- **Eco Dynos**: $5/month (sleeps after 30 min)
- **PostgreSQL**: Free up to 10k rows

#### Render (Free Tier)
- **Web Service**: Free (sleeps after 15 min)
- **PostgreSQL**: Free up to 1GB

## 🔒 Security Considerations

### HTTPS
- GitHub Pages provides HTTPS automatically
- Ensure backend also uses HTTPS
- Update CORS settings accordingly

### API Security
```python
# In Django settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
CORS_ALLOW_CREDENTIALS = False  # For public API
```

### Environment Variables
- Never commit API URLs or secrets to Git
- Use GitHub repository variables/secrets
- Rotate secrets regularly

## 🛠️ Maintenance

### Updates

1. **Frontend updates**:
   ```bash
   # Update dependencies
   cd frontend
   npm update
   
   # Push changes (auto-deploys)
   git add .
   git commit -m "Update dependencies"
   git push origin main
   ```

2. **Backend updates**:
   ```bash
   # Update and redeploy backend
   railway up  # or heroku deploy
   ```

### Monitoring

1. **GitHub Pages uptime**: Usually 99.9%+
2. **Backend monitoring**: Use platform-specific tools
3. **API health checks**: Implement `/health` endpoint

## 📊 Example Configuration

### Repository Variables
```bash
API_BASE_URL=https://adrd-kg-backend.railway.app/api
```

### Backend Environment (Railway)
```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=adrd-kg-backend.railway.app
CORS_ALLOWED_ORIGINS=https://yourusername.github.io,https://yourdomain.com
DATABASE_URL=postgresql://...  # Auto-provided by Railway
```

### Frontend Build Command
```bash
# In package.json
"scripts": {
  "build": "tsc -b && vite build"
}
```

## ✅ Deployment Checklist

### Backend Setup
- [ ] Backend deployed to Railway/Heroku/Render
- [ ] PostgreSQL database connected
- [ ] Environment variables configured
- [ ] CORS settings updated for GitHub Pages
- [ ] API endpoints accessible
- [ ] Sample data loaded

### Frontend Setup
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Repository variables configured
- [ ] GitHub Actions workflow working
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled

### Testing
- [ ] Frontend loads correctly
- [ ] API calls work from frontend
- [ ] All pages/routes accessible
- [ ] Data displays properly
- [ ] No CORS errors in browser console

## 🎉 Success!

Your ADRD Knowledge Graph is now live!

**Access your application**:
- **Frontend**: https://yourusername.github.io/ADRD-KG
- **Custom Domain**: https://yourdomain.com (if configured)
- **Backend API**: https://your-backend.railway.app/api/
- **Admin Interface**: https://your-backend.railway.app/admin/

## 🔄 Alternative: Hybrid Approach

You can also use this hybrid approach:
1. **GitHub Pages**: For frontend hosting
2. **Vercel**: For backend API (serverless functions)
3. **External Database**: Railway PostgreSQL

This gives you the best of both worlds: free frontend hosting and serverless backend scaling.
