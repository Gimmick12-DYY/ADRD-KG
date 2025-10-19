# 🚀 Vercel Deployment Guide for ADRD Knowledge Graph

Deploy your Django + React ADRD Knowledge Graph application to Vercel with this comprehensive guide.

## 📋 Overview

Vercel deployment includes:
- **Frontend**: React app served by Vercel's CDN
- **Backend**: Django API running as serverless functions
- **Database**: External PostgreSQL (recommended) or SQLite for testing

## 🎯 Quick Start

### 1. Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- PostgreSQL database (optional but recommended)

### 2. One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ADRD-KG)

### 3. Manual Setup

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From your project root
vercel

# Follow the prompts:
# ? Set up and deploy "~/ADRD-KG"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? adrd-knowledge-graph
# ? In which directory is your code located? ./
```

## ⚙️ Configuration

### Environment Variables

Set these in your Vercel dashboard (Settings → Environment Variables):

#### Required Variables
```bash
SECRET_KEY=your-very-secure-secret-key-minimum-50-characters
DJANGO_SETTINGS_MODULE=adrd_kg.settings_vercel
DEBUG=False
```

#### Database Configuration (Recommended)
```bash
# PostgreSQL (recommended for production)
DATABASE_URL=postgresql://username:password@host:5432/database

# Example with Railway PostgreSQL:
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway

# Example with Supabase:
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

#### Optional Variables
```bash
# Custom domain
CUSTOM_DOMAIN=yourdomain.com

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Database Setup Options

#### Option 1: Railway PostgreSQL (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from Railway dashboard
4. Add to Vercel environment variables

#### Option 2: Supabase PostgreSQL
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy URI and add to Vercel

#### Option 3: PlanetScale MySQL
1. Go to [PlanetScale](https://planetscale.com)
2. Create database
3. Get connection string
4. Update Django settings for MySQL

## 📁 Project Structure for Vercel

Your project should have this structure:
```
ADRD-KG/
├── vercel.json                 # Vercel configuration
├── backend/
│   ├── vercel_app.py          # Vercel WSGI handler
│   ├── manage.py
│   ├── adrd_kg/
│   │   ├── settings_vercel.py # Vercel-specific settings
│   │   └── ...
│   └── api/
└── frontend/
    ├── package.json
    ├── src/
    └── dist/ (generated)
```

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add domain in Vercel dashboard**:
   - Go to your project → Settings → Domains
   - Add your custom domain

2. **Update DNS records**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.19
   ```

3. **Update environment variables**:
   ```bash
   CUSTOM_DOMAIN=yourdomain.com
   ```

### SSL Certificate
Vercel automatically provides SSL certificates for all domains.

### Performance Optimization

#### Frontend Optimization
```json
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Backend Optimization
- Use database connection pooling
- Enable Django caching
- Optimize database queries

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

1. **Connect GitHub repository**:
   - Go to Vercel dashboard
   - Import Git Repository
   - Select your ADRD-KG repository

2. **Configure build settings**:
   - Framework Preset: Other
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

3. **Set environment variables** (as listed above)

4. **Deploy**: Every push to main branch auto-deploys

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --branch feature-branch
```

## 🔍 Monitoring and Debugging

### View Logs
```bash
# View function logs
vercel logs

# View specific deployment logs
vercel logs [deployment-url]
```

### Debug Common Issues

#### 1. Django Import Errors
```python
# In vercel_app.py, ensure correct path setup
import sys
from pathlib import Path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
```

#### 2. Static Files Not Loading
```python
# In settings_vercel.py
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Collect static files in build
python manage.py collectstatic --noinput
```

#### 3. Database Connection Issues
- Verify DATABASE_URL format
- Check database server accessibility
- Ensure connection limits aren't exceeded

### Performance Monitoring

#### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your React app
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

## 💰 Pricing Considerations

### Vercel Free Tier Limits
- **Bandwidth**: 100GB/month
- **Function Executions**: 100GB-hrs/month
- **Function Duration**: 10 seconds max
- **Build Minutes**: 6,000 minutes/month

### Optimization Tips
- Use external database to avoid function timeout
- Implement caching to reduce function calls
- Optimize images and static assets
- Use CDN for large files

## 🔒 Security Best Practices

### Environment Variables
- Never commit secrets to Git
- Use Vercel's encrypted environment variables
- Rotate secrets regularly

### Django Security
```python
# In settings_vercel.py
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

## 🛠️ Maintenance

### Updates
```bash
# Update dependencies
cd frontend && npm update
cd backend && pip install -r requirements.txt --upgrade

# Redeploy
vercel --prod
```

### Database Migrations
```bash
# Run migrations (one-time setup)
vercel exec -- python manage.py migrate

# Or set up in vercel.json build process
```

### Backup Strategy
- Use your database provider's backup features
- Export data regularly via Django admin
- Keep code in version control

## 📊 Example Deployment

### Sample vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/vercel_app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/vercel_app.py" },
    { "src": "/(.*)", "dest": "frontend/dist/index.html" }
  ]
}
```

### Sample Environment Variables
```bash
SECRET_KEY=django-insecure-change-this-in-production-abcdef123456
DJANGO_SETTINGS_MODULE=adrd_kg.settings_vercel
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/db
CUSTOM_DOMAIN=adrd-kg.com
```

## ✅ Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Database setup and connected
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Build and deployment successful
- [ ] API endpoints working
- [ ] Frontend loading correctly
- [ ] Database migrations applied
- [ ] Sample data loaded
- [ ] Admin interface accessible

## 🎉 Success!

Your ADRD Knowledge Graph is now live on Vercel! 

**Access your application**:
- **Production URL**: https://your-project.vercel.app
- **Custom Domain**: https://yourdomain.com (if configured)
- **API**: https://your-project.vercel.app/api/
- **Admin**: https://your-project.vercel.app/admin/

For support, check Vercel's documentation or the troubleshooting section above.
