@echo off
REM ============================================================================
REM ADRD Knowledge Graph - Vercel Deployment Script (Windows)
REM ============================================================================
REM This script helps you deploy your application to Vercel
REM Run: deploy-to-vercel.bat
REM ============================================================================

echo ==========================================
echo 🚀 ADRD-KG Vercel Deployment
echo ==========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI is not installed.
    echo.
    echo Installing Vercel CLI globally...
    call npm install -g vercel
    echo ✅ Vercel CLI installed successfully!
    echo.
)

REM Check if user is logged in
echo Checking Vercel authentication...
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📝 Please login to Vercel...
    call vercel login
)

echo.
echo ✅ Authenticated with Vercel
echo.

REM Check if project is linked
if not exist ".vercel\" (
    echo 🔗 Linking project to Vercel...
    echo.
    echo Please answer the following questions:
    echo - Set up and deploy? → Y
    echo - Which scope? → Select your account
    echo - Link to existing project? → N (unless you already created one^)
    echo - What's your project's name? → adrd-knowledge-graph (or your preference^)
    echo - In which directory is your code located? → ./ (just press Enter^)
    echo.
    call vercel link
    echo.
    echo ✅ Project linked!
) else (
    echo ✅ Project already linked to Vercel
)

echo.
echo ==========================================
echo ⚙️  Environment Variables Setup
echo ==========================================
echo.
echo Before deploying, you need to set up environment variables.
echo.
echo 📝 Required environment variables:
echo   1. SECRET_KEY - Django secret key
echo   2. DJANGO_SETTINGS_MODULE - Django settings module
echo   3. DEBUG - Debug mode (should be False for production^)
echo   4. DATABASE_URL - PostgreSQL connection string (recommended^)
echo   5. VITE_API_BASE_URL - Frontend API endpoint
echo.
echo.
echo ⚠️  IMPORTANT: Set these in your Vercel Dashboard:
echo   1. Go to: https://vercel.com/dashboard
echo   2. Select your project: adrd-knowledge-graph
echo   3. Go to: Settings → Environment Variables
echo   4. Add the following variables:
echo.
echo   SECRET_KEY = (generate a random 50+ character string^)
echo   DJANGO_SETTINGS_MODULE = adrd_kg.settings_vercel
echo   DEBUG = False
echo   DATABASE_URL = (your PostgreSQL connection string^)
echo   VITE_API_BASE_URL = /api
echo.
echo   Tip: Use https://djecrety.ir/ to generate a SECRET_KEY
echo.
set /p continue="Press Enter after setting up environment variables in Vercel Dashboard..."

echo.
echo ==========================================
echo 🚀 Deploying to Vercel
echo ==========================================
echo.
echo Deploying to production...
echo.

call vercel --prod

echo.
echo ==========================================
echo 🎉 Deployment Complete!
echo ==========================================
echo.
echo Your application is now live on Vercel!
echo.
echo 📊 Next Steps:
echo.
echo 1. Visit your Vercel dashboard to see your deployment:
echo    https://vercel.com/dashboard
echo.
echo 2. Check your live site URL (shown above^)
echo.
echo 3. If you set up a database, run migrations:
echo    - Connect to your database using a PostgreSQL client
echo    - Or use pgAdmin to run migrations
echo.
echo 4. Test your API endpoints:
echo    - Health: https://your-project.vercel.app/api/health
echo    - Datasets: https://your-project.vercel.app/api/datasets
echo.
echo 5. Monitor your deployment:
echo    vercel logs
echo.
echo 📚 For more information, see:
echo    - DEPLOYMENT_INSTRUCTIONS.md (comprehensive guide^)
echo    - VERCEL_DEPLOYMENT.md (detailed documentation^)
echo.
echo ==========================================
echo ✨ Happy deploying!
echo ==========================================
echo.
pause


