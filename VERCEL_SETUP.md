# Quick Vercel Frontend Deployment

## ✅ Configuration Complete!

Your Vercel configuration is now fixed. Follow these steps:

## 🚀 Deploy Frontend to Vercel

### Step 1: Redeploy
Since you already started the Vercel setup, just run:
```bash
vercel --prod
```

Or push to your GitHub repository and Vercel will auto-deploy.

### Step 2: Set Environment Variable (Important!)
After deployment, you need to configure where your frontend connects to the backend:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `adrd-knowledge-graph`
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.railway.app/api` (or wherever your backend is)
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**
6. Redeploy: Go to **Deployments** → Click on the latest deployment → **Redeploy**

## 🔧 Deploy Backend to Railway (Free)

Since Vercel is best for static frontends, deploy your Django backend to Railway:

### Quick Backend Setup:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy backend
cd backend
railway up

# Note the URL that Railway gives you (e.g., https://adrd-kg.railway.app)
```

### Set Backend Environment Variables in Railway:
```bash
railway variables set SECRET_KEY="your-super-secret-key-here"
railway variables set DEBUG="False"
railway variables set ALLOWED_HOSTS="*.railway.app"
railway variables set DJANGO_SETTINGS_MODULE="adrd_kg.settings_production"
```

### Add PostgreSQL to Railway:
```bash
railway add postgresql
# Railway automatically sets DATABASE_URL
```

## 🎯 Final Setup

1. Copy your Railway backend URL (e.g., `https://adrd-kg.railway.app`)
2. Add to Vercel environment variables as `VITE_API_BASE_URL` with value `https://adrd-kg.railway.app/api`
3. Redeploy frontend on Vercel
4. Your app should now work!

## 🌐 Your Deployed URLs

- **Frontend (Vercel)**: https://adrd-knowledge-graph.vercel.app
- **Backend (Railway)**: https://your-app.railway.app
- **API Endpoint**: https://your-app.railway.app/api/
- **Admin Panel**: https://your-app.railway.app/admin/

## 🆘 Still Getting 404?

If you're still seeing 404, it means Vercel is looking in the wrong directory. Try:

1. In Vercel dashboard → Settings → General
2. Update these settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. Then redeploy

## ✨ Alternative: One-Command Deploy

If Railway seems complex, you can use Render for the backend (also free):
- Go to https://render.com
- Connect your GitHub repo
- Create a new Web Service
- Select the `backend` directory
- Render will auto-detect Django and deploy it

Then use that Render URL in your Vercel environment variables.
