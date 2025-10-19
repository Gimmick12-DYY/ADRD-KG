# 🚀 Quick Start - Deploy to Vercel in 5 Minutes

The fastest way to deploy your ADRD Knowledge Graph to Vercel.

## Option 1: Automated Script (Recommended for Windows)

**For Windows:**
```bash
deploy-to-vercel.bat
```

**For Mac/Linux:**
```bash
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

The script will:
- Install Vercel CLI
- Login to Vercel
- Link your project
- Guide you through environment variable setup
- Deploy to production

## Option 2: Manual Deployment (5 Steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **[Select your account]**
- Link to existing project? **N**
- What's your project's name? **adrd-knowledge-graph**
- In which directory is your code located? **./** (press Enter)

### Step 4: Set Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these variables:

| Variable | Value |
|----------|-------|
| `SECRET_KEY` | Generate a 50+ character random string |
| `DJANGO_SETTINGS_MODULE` | `adrd_kg.settings_vercel` |
| `DEBUG` | `False` |
| `VITE_API_BASE_URL` | `/api` |
| `DATABASE_URL` | Your PostgreSQL connection (optional) |

**Tip:** Generate SECRET_KEY at [djecrety.ir](https://djecrety.ir/)

### Step 5: Deploy to Production
```bash
vercel --prod
```

## Option 3: Vercel Dashboard (No CLI)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Step 2: Import in Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your ADRD-KG repository
4. Configure:
   - Framework Preset: **Other**
   - Root Directory: **./**
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

### Step 3: Add Environment Variables
In the import screen, add:
- `SECRET_KEY` = (generate random string)
- `DJANGO_SETTINGS_MODULE` = `adrd_kg.settings_vercel`
- `DEBUG` = `False`
- `VITE_API_BASE_URL` = `/api`

### Step 4: Deploy
Click "Deploy" and wait 2-5 minutes.

## ✅ Verify Deployment

After deployment:

1. **Visit your site**: `https://your-project.vercel.app`
2. **Test API**: `https://your-project.vercel.app/api/health`
3. **Check datasets**: `https://your-project.vercel.app/api/datasets`

## 🔧 Common Issues

### Issue: API returns 500 error
**Solution**: Check environment variables are set correctly

### Issue: Database errors
**Solution**: Add `DATABASE_URL` with PostgreSQL connection string

### Issue: Build fails
**Solution**: Run `vercel --force` to clear cache

## 📚 Need More Help?

- **Comprehensive Guide**: See `DEPLOYMENT_INSTRUCTIONS.md`
- **Detailed Documentation**: See `VERCEL_DEPLOYMENT.md`
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## 🎯 Database Setup (Important!)

For production, set up PostgreSQL:

### Quick Option: Vercel Postgres
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Postgres
3. Automatically adds `DATABASE_URL` to your env vars
4. Redeploy

### Alternative: Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Get connection string from Settings → Database
4. Add to Vercel as `DATABASE_URL`
5. Redeploy

## 🎉 That's It!

Your ADRD Knowledge Graph is now live on Vercel!

Questions? Check `DEPLOYMENT_INSTRUCTIONS.md` for detailed troubleshooting.


