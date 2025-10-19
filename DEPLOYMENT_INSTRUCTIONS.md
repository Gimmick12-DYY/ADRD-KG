# 🚀 Complete Vercel Deployment Guide - ADRD Knowledge Graph

This guide will walk you through deploying your Django + React application to Vercel from scratch.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A GitHub account (free)
- ✅ A Vercel account (free tier available at [vercel.com](https://vercel.com))
- ✅ Node.js installed (v18 or higher)
- ✅ Git installed and configured
- ✅ This repository pushed to GitHub

## 🎯 Deployment Architecture

Your application will be deployed as:
- **Frontend**: React app served as static files from Vercel's CDN
- **Backend**: Django API running as Vercel serverless functions
- **Database**: PostgreSQL (recommended) or SQLite for testing

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Ensure your repository is pushed to GitHub:

```bash
# If not already done
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Set Up Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and sign in with GitHub
3. Grant Vercel access to your repositories

### Step 3: Deploy via Vercel Dashboard (Recommended)

#### 3.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Find and select your `ADRD-KG` repository
4. Click "Import"

#### 3.2 Configure Project Settings

In the import screen, configure:

**Framework Preset**: `Other`

**Root Directory**: Leave as `./` (project root)

**Build Settings**:
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `cd frontend && npm install`

#### 3.3 Configure Environment Variables

Click "Environment Variables" and add these variables:

**Required Variables:**

| Name | Value | Description |
|------|-------|-------------|
| `SECRET_KEY` | `your-super-secret-key-at-least-50-chars-long` | Django secret key |
| `DJANGO_SETTINGS_MODULE` | `adrd_kg.settings_vercel` | Django settings module |
| `DEBUG` | `False` | Debug mode (False for production) |

**Optional (for PostgreSQL - Recommended):**

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |

**Frontend API Configuration:**

| Name | Value | Description |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `/api` | API endpoint (relative URL for Vercel) |

#### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at: `https://your-project-name.vercel.app`

### Step 4: Set Up Database (Important!)

For production, you need a persistent database. Choose one option:

#### Option A: Vercel Postgres (Recommended - Native Integration)

1. In your Vercel project dashboard
2. Go to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Click "Create"
5. The `DATABASE_URL` is automatically added to your environment variables
6. Redeploy your project

#### Option B: Supabase (Free PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String → URI
4. Copy the connection string
5. Add it to Vercel environment variables as `DATABASE_URL`
6. Redeploy

#### Option C: Railway (Free PostgreSQL)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from Railway dashboard
4. Add it to Vercel environment variables
5. Redeploy

### Step 5: Run Database Migrations

After setting up the database, you need to run migrations:

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to your project
vercel link

# Set environment variable with your DATABASE_URL
vercel env add DATABASE_URL

# Run migrations using a one-time function
vercel deploy
```

#### Method 2: Direct Database Access

If you're using Supabase or Railway, you can connect directly:

```bash
# Install PostgreSQL client
# On Windows: Download from postgresql.org
# On Mac: brew install postgresql
# On Linux: sudo apt-get install postgresql-client

# Set the DATABASE_URL environment variable
export DATABASE_URL="your-database-url-here"

# Run migrations from your local machine
cd backend
python manage.py migrate
python manage.py load_sample_data
```

### Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Check if the frontend loads
3. Test API endpoints: `https://your-project-name.vercel.app/api/health`
4. Navigate through the app to ensure all pages work

## 🔧 Alternative: Deploy Using Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy

```bash
# From your project root directory
vercel

# Follow the prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? adrd-knowledge-graph
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

## 🌐 Custom Domain Setup (Optional)

### Add Custom Domain

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Enter your domain name
4. Click "Add"

### Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.), add these records:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.19.19
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Update Environment Variables

After adding a custom domain:

1. Go to Settings → Environment Variables
2. Add `CUSTOM_DOMAIN` = `yourdomain.com`
3. Redeploy

## 🔍 Troubleshooting

### Issue 1: API Returns 404

**Solution:**
- Check that `api/index.py` exists
- Verify routes in `vercel.json`
- Check Vercel function logs in dashboard

### Issue 2: Database Connection Errors

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Ensure database is accessible from Vercel (check firewall rules)
- For PostgreSQL, use `psycopg2-binary` (already in requirements)

### Issue 3: Build Fails

**Solution:**
```bash
# Check build logs in Vercel dashboard
# Common fixes:

# Fix 1: Clear build cache
vercel --force

# Fix 2: Ensure all dependencies are in package.json
cd frontend && npm install

# Fix 3: Check Node.js version
# Add to package.json:
"engines": {
  "node": ">=18.0.0"
}
```

### Issue 4: Static Files Not Loading

**Solution:**
- Verify `STATIC_ROOT` in settings_vercel.py
- Check that `whitenoise` is installed
- Ensure routes in vercel.json are correct

### Issue 5: CORS Errors

**Solution:**
- Check `CORS_ALLOWED_ORIGINS` in settings_vercel.py
- Add your Vercel domain to allowed origins
- Verify `corsheaders` middleware is enabled

## 📊 Monitoring and Logs

### View Logs

**In Vercel Dashboard:**
1. Go to your project
2. Click "Functions" tab
3. View real-time logs

**Using CLI:**
```bash
vercel logs
```

### Analytics

Enable Vercel Analytics:
```bash
cd frontend
npm install @vercel/analytics
```

Add to your main React component:
```typescript
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit secrets to Git
- ✅ Use different `SECRET_KEY` for production
- ✅ Set `DEBUG=False` in production
- ✅ Use strong database passwords

### 2. Django Security
All security settings are pre-configured in `settings_vercel.py`:
- SSL redirect enabled
- HSTS headers enabled
- XSS protection enabled
- CSRF protection enabled

### 3. Database Security
- Use PostgreSQL instead of SQLite in production
- Enable SSL for database connections
- Regularly backup your database

## 💰 Pricing

### Vercel Free Tier Includes:
- ✅ Unlimited static sites
- ✅ 100GB bandwidth/month
- ✅ 100GB-hrs serverless function execution
- ✅ SSL certificates
- ✅ Preview deployments

### Tips to Stay Within Free Tier:
- Use external database (doesn't count against Vercel limits)
- Optimize images and static assets
- Enable caching headers
- Use database query optimization

## 🔄 Continuous Deployment

Once set up, every push to your main branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update features"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys new version
# 4. Updates production URL
```

### Preview Deployments

Every pull request gets a unique preview URL:
1. Create a new branch
2. Make changes
3. Push and create a PR
4. Vercel comments with preview URL
5. Test before merging

## ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Repository pushed to GitHub
- [ ] Vercel account created and connected
- [ ] Project imported in Vercel
- [ ] Environment variables configured:
  - [ ] `SECRET_KEY`
  - [ ] `DJANGO_SETTINGS_MODULE`
  - [ ] `DEBUG=False`
  - [ ] `DATABASE_URL` (if using PostgreSQL)
  - [ ] `VITE_API_BASE_URL`
- [ ] Database set up (PostgreSQL recommended)
- [ ] Database migrations run
- [ ] Sample data loaded
- [ ] Build successful
- [ ] Deployment successful
- [ ] Frontend loads correctly
- [ ] API endpoints work (`/api/health`, `/api/datasets`)
- [ ] All pages navigate correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

## 🎉 Success!

Your ADRD Knowledge Graph is now live on Vercel!

**Your URLs:**
- Production: `https://your-project-name.vercel.app`
- API Endpoint: `https://your-project-name.vercel.app/api/`
- API Health: `https://your-project-name.vercel.app/api/health`

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Django on Vercel Guide](https://vercel.com/guides/django)
- [Vite Documentation](https://vitejs.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Review the troubleshooting section above
4. Check [Vercel Status](https://www.vercel-status.com/)
5. Contact Vercel Support (free tier includes community support)

---

**Note**: This deployment guide assumes you're starting from scratch. If you've already partially configured Vercel, adjust the steps accordingly.


