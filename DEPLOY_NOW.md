# 🚀 Deploy Your ADRD-KG to Vercel NOW

## Your Status: ✅ Ready to Deploy!

Everything is configured. You're logged in as **gimmick12-dyy** and ready to go!

## 🎯 Quick Deploy (Choose One Method)

### Method 1: Automated Script (Recommended)

Just run this in your terminal:

```cmd
deploy-to-vercel.bat
```

The script will guide you through everything!

### Method 2: Manual Deployment (3 Commands)

```cmd
# Step 1: Link your project (one-time setup)
vercel

# When prompted:
# ? Set up and deploy? → Y
# ? Which scope? → gimmick12-dyy
# ? Link to existing project? → N
# ? What's your project's name? → adrd-knowledge-graph
# ? In which directory is your code located? → ./ (press Enter)

# Step 2: This will deploy a preview. Now deploy to production:
vercel --prod
```

### Method 3: Vercel Dashboard (No Terminal)

1. **Commit and push your code:**
   ```cmd
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import in Vercel:**
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your ADRD-KG repo
   - Click Import

3. **Configure settings:**
   - Framework Preset: **Other**
   - Root Directory: Leave blank (`./`)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

4. **Add Environment Variables** (click "Add" for each):
   ```
   SECRET_KEY = (click "Generate" or use: django-insecure-change-this-to-something-random-and-very-long-at-least-50-characters)
   DJANGO_SETTINGS_MODULE = adrd_kg.settings_vercel
   DEBUG = False
   VITE_API_BASE_URL = /api
   ```

5. **Click Deploy!**

## ⚙️ Environment Variables (Important!)

After deployment, you MUST set these environment variables:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

| Name | Value | Environment |
|------|-------|-------------|
| `SECRET_KEY` | (generate 50+ char random string) | Production |
| `DJANGO_SETTINGS_MODULE` | `adrd_kg.settings_vercel` | Production |
| `DEBUG` | `False` | Production |
| `VITE_API_BASE_URL` | `/api` | Production |

**To generate SECRET_KEY:**
- Visit: https://djecrety.ir/
- Or run: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### Optional but HIGHLY Recommended:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production |

**Without DATABASE_URL:** Your app uses SQLite in `/tmp` (data lost on each deploy!)

**With DATABASE_URL:** Your app uses PostgreSQL (persistent data!)

## 🗄️ Database Setup (Do This After First Deploy)

### Option A: Vercel Postgres (Easiest & Recommended)

1. After deployment, go to your Vercel Dashboard
2. Select your project: **adrd-knowledge-graph**
3. Click **Storage** tab
4. Click **Create Database**
5. Choose **Postgres**
6. Click **Create**
7. Done! `DATABASE_URL` is automatically added
8. Go to **Deployments** → Click latest → **Redeploy**

### Option B: Supabase (Free PostgreSQL)

1. Go to: https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for database to initialize (2-3 minutes)
5. Go to: Settings → Database
6. Find "Connection String" → Select "URI"
7. Copy the connection string
8. Go to Vercel: Dashboard → Your Project → Settings → Environment Variables
9. Add new variable:
   - Name: `DATABASE_URL`
   - Value: (paste the connection string)
   - Environment: Production
10. Save and redeploy

### Option C: Railway (Free PostgreSQL)

1. Go to: https://railway.app
2. Click "New Project"
3. Click "Provision PostgreSQL"
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` value
7. Go to Vercel: Dashboard → Your Project → Settings → Environment Variables
8. Add the `DATABASE_URL` variable
9. Save and redeploy

## 🔄 After Setting Up Database: Run Migrations

You need to initialize your database tables. Here's how:

### Method 1: Using Database Client (Recommended)

1. **Install a PostgreSQL client:**
   - Windows: Download [pgAdmin](https://www.pgadmin.org/)
   - Or use [DBeaver](https://dbeaver.io/)

2. **Connect to your database:**
   - Use the `DATABASE_URL` credentials
   - Host, port, database name, username, password

3. **Run from your local terminal:**
   ```cmd
   cd backend
   
   # Set your database URL (replace with your actual URL)
   $env:DATABASE_URL="postgresql://user:pass@host:5432/db"
   
   # Run migrations
   python manage.py migrate
   
   # Create admin user
   python manage.py createsuperuser
   
   # Load sample data
   python manage.py load_sample_data
   ```

### Method 2: Using Vercel Build Hook (Advanced)

Add this to your `vercel.json` under builds (I can help with this if needed).

## ✅ Deployment Checklist

- [ ] Run deployment command (vercel or dashboard)
- [ ] Deployment succeeds (wait 2-5 minutes)
- [ ] Note your live URL (e.g., https://adrd-knowledge-graph.vercel.app)
- [ ] Set environment variables in Vercel dashboard
- [ ] Redeploy after adding env vars
- [ ] Set up PostgreSQL database (Vercel/Supabase/Railway)
- [ ] Add DATABASE_URL to Vercel
- [ ] Redeploy again
- [ ] Run database migrations
- [ ] Load sample data

## 🧪 Test Your Deployment

After everything is deployed:

### 1. Visit your site:
```
https://your-project.vercel.app
```

### 2. Test API health:
```
https://your-project.vercel.app/api/health
```
Should show: `{"status":"healthy",...}`

### 3. Test datasets endpoint:
```
https://your-project.vercel.app/api/datasets
```
Should return JSON with datasets

### 4. Navigate pages:
- Home
- Datasets
- Publications
- Analytics
- Contribute

All should work without errors!

## 🆘 Troubleshooting

### Build Fails:
```cmd
# Clear cache and redeploy
vercel --force
```

### API Returns 500:
- Check environment variables are set
- Check Vercel function logs (Dashboard → Functions)
- Make sure `SECRET_KEY` is set

### Database Errors:
- Verify `DATABASE_URL` format is correct
- Make sure migrations are run
- Check database accepts connections from anywhere (0.0.0.0/0)

### Frontend Shows Blank:
- Check browser console for errors
- Verify `VITE_API_BASE_URL=/api` is set
- Clear browser cache

## 📞 Need More Help?

- **Quick Start Guide:** See `QUICK_START.md`
- **Full Guide:** See `DEPLOYMENT_INSTRUCTIONS.md`
- **Summary:** See `DEPLOYMENT_SUMMARY.md`

## 🎉 Ready? Let's Deploy!

**Current Status:**
- ✅ Vercel CLI installed
- ✅ Logged in as gimmick12-dyy
- ✅ All files configured
- ✅ You're in the correct directory

**Just run:**
```cmd
deploy-to-vercel.bat
```

**Or:**
```cmd
vercel
```

**Then follow the prompts!**

Good luck! 🚀


