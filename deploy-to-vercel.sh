#!/bin/bash

# ============================================================================
# ADRD Knowledge Graph - Vercel Deployment Script
# ============================================================================
# This script helps you deploy your application to Vercel
# Run: bash deploy-to-vercel.sh
# ============================================================================

set -e  # Exit on error

echo "=========================================="
echo "🚀 ADRD-KG Vercel Deployment"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Installing Vercel CLI globally..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
    echo ""
fi

# Check if user is logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "📝 Please login to Vercel..."
    vercel login
fi

echo ""
echo "✅ Authenticated with Vercel"
echo ""

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "🔗 Linking project to Vercel..."
    echo ""
    echo "Please answer the following questions:"
    echo "- Set up and deploy? → Y"
    echo "- Which scope? → Select your account"
    echo "- Link to existing project? → N (unless you already created one)"
    echo "- What's your project's name? → adrd-knowledge-graph (or your preference)"
    echo "- In which directory is your code located? → ./ (just press Enter)"
    echo ""
    vercel link
    echo ""
    echo "✅ Project linked!"
else
    echo "✅ Project already linked to Vercel"
fi

echo ""
echo "=========================================="
echo "⚙️  Environment Variables Setup"
echo "=========================================="
echo ""
echo "Before deploying, let's set up your environment variables."
echo ""
echo "📝 Required environment variables:"
echo "  1. SECRET_KEY - Django secret key"
echo "  2. DJANGO_SETTINGS_MODULE - Django settings module"
echo "  3. DEBUG - Debug mode (should be False for production)"
echo "  4. DATABASE_URL - PostgreSQL connection string (recommended)"
echo "  5. VITE_API_BASE_URL - Frontend API endpoint"
echo ""

read -p "Do you want to set environment variables now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting environment variables..."
    echo ""
    
    # SECRET_KEY
    read -p "Enter SECRET_KEY (or press Enter to generate one): " SECRET_KEY
    if [ -z "$SECRET_KEY" ]; then
        SECRET_KEY=$(openssl rand -base64 48 | tr -d '\n')
        echo "Generated SECRET_KEY: $SECRET_KEY"
    fi
    vercel env add SECRET_KEY production <<< "$SECRET_KEY"
    
    # DJANGO_SETTINGS_MODULE
    vercel env add DJANGO_SETTINGS_MODULE production <<< "adrd_kg.settings_vercel"
    
    # DEBUG
    vercel env add DEBUG production <<< "False"
    
    # DATABASE_URL
    echo ""
    echo "For production, PostgreSQL is recommended."
    echo "Options:"
    echo "  1. Vercel Postgres (go to Vercel dashboard → Storage)"
    echo "  2. Supabase (https://supabase.com)"
    echo "  3. Railway (https://railway.app)"
    echo "  4. Skip for now (use SQLite - not recommended for production)"
    echo ""
    read -p "Enter DATABASE_URL (or press Enter to skip): " DATABASE_URL
    if [ ! -z "$DATABASE_URL" ]; then
        vercel env add DATABASE_URL production <<< "$DATABASE_URL"
        echo "✅ DATABASE_URL set"
    else
        echo "⚠️  Skipping DATABASE_URL (will use SQLite in /tmp)"
    fi
    
    # VITE_API_BASE_URL
    vercel env add VITE_API_BASE_URL production <<< "/api"
    
    echo ""
    echo "✅ Environment variables configured!"
else
    echo ""
    echo "⚠️  Skipping environment variable setup."
    echo "   You can set them later in the Vercel dashboard:"
    echo "   https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
fi

echo ""
echo "=========================================="
echo "🚀 Deploying to Vercel"
echo "=========================================="
echo ""
echo "Deploying to production..."
echo ""

vercel --prod

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now live on Vercel!"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Visit your Vercel dashboard to see your deployment:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Check your live site URL (shown above)"
echo ""
echo "3. If you set up a database, run migrations:"
echo "   - Connect to your database using a PostgreSQL client"
echo "   - Or use Vercel CLI to run migrations"
echo ""
echo "4. Test your API endpoints:"
echo "   - Health: https://your-project.vercel.app/api/health"
echo "   - Datasets: https://your-project.vercel.app/api/datasets"
echo ""
echo "5. Monitor your deployment:"
echo "   vercel logs"
echo ""
echo "📚 For more information, see:"
echo "   - DEPLOYMENT_INSTRUCTIONS.md (comprehensive guide)"
echo "   - VERCEL_DEPLOYMENT.md (detailed documentation)"
echo ""
echo "=========================================="
echo "✨ Happy deploying!"
echo "=========================================="


