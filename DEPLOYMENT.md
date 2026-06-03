# Deployment Guide - Vercel

This guide provides step-by-step instructions to deploy the Aasamedchem application to Vercel.

## Prerequisites

1. Vercel account (free tier available)
2. GitHub account with repository
3. MongoDB Atlas database (free tier available)
4. Git installed locally

## Step 1: Prepare MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for a free account
- Create a new organization

### 1.2 Create Cluster
- Click "Create Deployment"
- Select "Build a Cluster"
- Choose "Free tier"
- Select cloud provider (AWS recommended)
- Wait for cluster creation (5-10 minutes)

### 1.3 Get Connection String
- Click "Connect"
- Choose "Connect your application"
- Copy connection string (URI)
- Replace `<password>` with your database user password
- Replace `<dbname>` with your database name

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aasamedchem?retryWrites=true&w=majority
```

## Step 2: Push to GitHub

### 2.1 Create Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### 2.2 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/aasamedchem.git
git push -u origin main
```

## Step 3: Deploy Backend to Vercel

### 3.1 Login to Vercel
- Go to https://vercel.com
- Click "Sign Up"
- Choose "Continue with GitHub"
- Authorize Vercel

### 3.2 Create New Project
- Click "New Project"
- Import from GitHub
- Select your `aasamedchem` repository

### 3.3 Configure Project
- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: Leave empty (Node.js doesn't need building for this setup)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 3.4 Environment Variables
Add the following in "Environment Variables":

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your frontend Vercel URL (add later) |

### 3.5 Deploy
- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Copy your backend URL: `https://your-backend-name.vercel.app`

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Frontend Project
- Click "New Project" on Vercel dashboard
- Import from GitHub
- Same repository

### 4.2 Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4.3 Environment Variables
Add the following:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL (e.g., `https://your-backend-name.vercel.app/api`) |
| `VITE_APP_NAME` | `Aasamedchem` |

### 4.4 Deploy
- Click "Deploy"
- Wait for deployment
- Copy your frontend URL: `https://your-frontend-name.vercel.app`

## Step 5: Update CORS

### 5.1 Go Back to Backend Project
- On Vercel Dashboard, select your backend project
- Go to "Settings" → "Environment Variables"
- Edit `CORS_ORIGIN`
- Change value to your frontend URL (e.g., `https://your-frontend-name.vercel.app`)
- Click "Save"

### 5.2 Redeploy Backend
- Go to "Deployments"
- Click on the latest deployment
- Click the three dots menu
- Select "Redeploy"

## Step 6: Create Admin User (First Time)

### 6.1 Register Admin User
```bash
curl -X POST https://your-backend-name.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@aasamedchem.com",
    "password": "Admin@123456",
    "role": "admin"
  }'
```

### 6.2 Test Login
```bash
curl -X POST https://your-backend-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aasamedchem.com",
    "password": "Admin@123456"
  }'
```

## Step 7: Verify Deployment

### 7.1 Test API
```bash
# Test backend
curl https://your-backend-name.vercel.app/

# Should return: "Inventory API Running"
```

### 7.2 Test Frontend
- Open https://your-frontend-name.vercel.app
- Should see login page
- Try logging in with admin credentials

## Troubleshooting

### Backend not connecting to MongoDB
**Solution**: Verify MongoDB connection string in environment variables

### CORS errors
**Solution**: Ensure `CORS_ORIGIN` matches your frontend URL exactly

### Frontend shows blank page
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### API calls returning 401
**Solution**: Make sure JWT_SECRET is the same in environment variables

### Deployment fails
**Solution**: 
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Check that dependencies are in package.json

## Live URLs Example

After successful deployment, you'll have:

- **Backend**: `https://aasamedchem-backend.vercel.app`
- **Frontend**: `https://aasamedchem-frontend.vercel.app`

## Setting Up Custom Domain (Optional)

### 1. Buy Domain
- Go to Domain Registrar (GoDaddy, Namecheap, etc.)
- Buy your domain

### 2. Add to Vercel
- Go to project settings
- Click "Domains"
- Add your custom domain
- Update nameservers at registrar

### 3. SSL Certificate
- Vercel automatically provides free SSL

## Monitoring

### View Logs
- On Vercel dashboard, go to "Functions"
- Click on function to see logs
- Useful for debugging issues

### View Metrics
- Go to "Analytics"
- Monitor API usage and performance

## Maintenance

### Updating Code
```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel automatically redeplooys on git push!

### Updating Environment Variables
- Go to project settings
- Click "Environment Variables"
- Update and redeploy if needed

## Summary

Your Aasamedchem application is now live!

- **Frontend URL**: Share with users
- **Backend URL**: Used by frontend
- **Admin Dashboard**: Accessible with admin login
- **Database**: MongoDB Atlas handles all data storage

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com
- React Docs: https://react.dev
