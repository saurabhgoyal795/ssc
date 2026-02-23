# SSC Exam Platform - Deployment Guide

This guide will walk you through deploying the SSC Exam Platform to production.

## 📋 Prerequisites

Before starting, you'll need:

1. **GitHub Account** - To host your code
2. **Railway Account** - For backend and database (https://railway.app)
3. **Vercel Account** - For frontend (https://vercel.com)
4. **AWS Account** - For S3 file storage (https://aws.amazon.com)
5. **Domain Name** (Optional) - For custom domain

---

## 🗂️ Deployment Architecture

```
┌─────────────────────────────────────────────┐
│          Cloudflare (Optional CDN)          │
└─────────────┬───────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼──────┐   ┌────▼──────────┐
│  Vercel    │   │   Railway     │
│  Next.js   │◄──┤  Spring Boot  │
│  Frontend  │   │   Backend     │
└────────────┘   └────┬──────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │ Railway │  │ Railway │  │ AWS S3  │
   │Postgres │  │  Redis  │  │  Files  │
   └─────────┘  └─────────┘  └─────────┘
```

---

## 🚀 Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done):
```bash
cd /Users/Lenovo/Documents/GitHub/projects/ssc-exam-platform
git init
git add .
git commit -m "Initial commit - SSC Exam Platform"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Name: `ssc-exam-platform`
   - Make it private
   - Don't initialize with README (we already have code)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/ssc-exam-platform.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Setup AWS S3 for File Storage

### Create S3 Bucket

1. **Login to AWS Console** → S3
2. **Create Bucket**:
   - Name: `ssc-exam-files-prod` (must be globally unique)
   - Region: `ap-south-1` (Mumbai)
   - Uncheck "Block all public access"
   - Enable versioning (optional)
   - Click "Create bucket"

### Configure Bucket CORS

1. Go to bucket → **Permissions** → **CORS**
2. Add this configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": [
            "https://your-frontend-domain.vercel.app",
            "http://localhost:3000"
        ],
        "ExposeHeaders": []
    }
]
```

### Create IAM User for S3 Access

1. Go to **IAM** → **Users** → **Create user**
2. Username: `ssc-exam-s3-user`
3. Attach policy: `AmazonS3FullAccess` (or create custom policy)
4. **Create user** → **Security credentials** → **Create access key**
5. Choose "Application running outside AWS"
6. **Save these credentials** (you'll need them later):
   - Access Key ID
   - Secret Access Key

---

## 🚂 Step 3: Deploy Backend to Railway

### 3.1 Create Railway Project

1. **Sign up at Railway.app** using GitHub
2. **Create New Project**
3. **Deploy from GitHub Repo**:
   - Select your repository: `ssc-exam-platform`
   - Railway will detect the monorepo

### 3.2 Add PostgreSQL Database

1. In Railway project → **New** → **Database** → **PostgreSQL**
2. Railway will create a database and provide connection details
3. Note down the connection URL (automatically available as `DATABASE_URL`)

### 3.3 Configure Backend Service

1. **Add Service** → **GitHub Repo** → Select your repo
2. **Settings**:
   - Root Directory: `ssc-exam-platform/ssc-exam-backend`
   - Build Command: (leave default - uses Dockerfile)
   - Start Command: (leave default)

### 3.4 Add Environment Variables

Go to your backend service → **Variables** and add:

```bash
# Database (Auto-set by Railway)
DATABASE_URL=postgresql://...  # Provided by Railway PostgreSQL

# Parse Railway DATABASE_URL for individual fields
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<from Railway>
DATABASE_NAME=railway

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits-long-change-this

# AWS S3 Configuration
AWS_ACCESS_KEY=<your-aws-access-key>
AWS_SECRET_KEY=<your-aws-secret-key>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ssc-exam-files-prod
AWS_CLOUDFRONT_DOMAIN=  # Leave empty for now

# CORS (Update with your Vercel domain after frontend deployment)
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Email Configuration (Optional - use Gmail SMTP or SendGrid)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@sscexam.com

# Application
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

### 3.5 Generate Domain

1. Railway will provide a public URL: `https://your-app.up.railway.app`
2. Or add custom domain in **Settings** → **Domains**

### 3.6 Deploy

1. Railway will automatically build and deploy
2. Check **Logs** for any errors
3. Wait for deployment to complete (~5-10 minutes)

---

## ▲ Step 4: Deploy Frontend to Vercel

### 4.1 Deploy to Vercel

1. **Sign up at Vercel.com** using GitHub
2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel will detect Next.js

### 4.2 Configure Project

1. **Framework Preset**: Next.js
2. **Root Directory**: `ssc-exam-frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### 4.3 Add Environment Variables

Click **Environment Variables** and add:

```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
```

### 4.4 Deploy

1. Click **Deploy**
2. Vercel will build and deploy (~3-5 minutes)
3. You'll get a URL: `https://your-app.vercel.app`

---

## 🔧 Step 5: Post-Deployment Configuration

### Update Backend CORS

1. Go back to Railway backend → **Variables**
2. Update `CORS_ORIGINS`:
```bash
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
3. Redeploy backend

### Update S3 CORS

1. Go to AWS S3 bucket → **Permissions** → **CORS**
2. Update `AllowedOrigins`:
```json
{
    "AllowedOrigins": [
        "https://your-app.vercel.app",
        "http://localhost:3000"
    ]
}
```

### Test the Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to register a new user
3. Check if login works
4. Try creating a question (admin)
5. Take a test
6. Upload a study material

---

## 📊 Step 6: Database Seeding (Optional)

### Create Admin User

1. **Option A: Via Railway PostgreSQL Console**:
```sql
-- Connect to Railway PostgreSQL
-- Run this SQL to create admin user

INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at)
VALUES (
    'admin@sscexam.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Admin User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);
```

2. **Option B: Register and update via console**:
   - Register normally through the app
   - Update role to ADMIN in database

### Add Sample Data

You can run SQL scripts to add:
- Subjects (already added in migration)
- Sample questions
- Mock tests
- Study materials metadata

---

## 🔒 Step 7: Production Hardening

### Backend Security

1. **Update JWT Secret**:
   - Use a strong 256-bit random key
   - Generate: `openssl rand -base64 32`

2. **Enable HTTPS Only**:
   - Railway provides SSL by default
   - Enforce HTTPS in production

3. **Rate Limiting**:
   - Already implemented in code
   - Monitor via Railway logs

### Frontend Security

1. **Environment Variables**:
   - Never commit `.env.local` to Git
   - Use Vercel's environment variables

2. **API Security**:
   - All requests go through HTTPS
   - JWT tokens in secure headers

### Database Security

1. **Railway PostgreSQL**:
   - Automatic backups
   - Encrypted connections
   - Private network

2. **Connection Pooling**:
   - Already configured in `application.yml`
   - Max pool size: 10

---

## 📈 Step 8: Monitoring & Logs

### Railway Monitoring

1. **Logs**: Railway dashboard → Logs tab
2. **Metrics**: CPU, Memory, Network usage
3. **Deployments**: Track all deployments

### Vercel Monitoring

1. **Analytics**: Vercel dashboard → Analytics
2. **Logs**: Real-time function logs
3. **Performance**: Core Web Vitals

---

## 💰 Estimated Monthly Costs

### Hobby/Starter Plan (< 1000 users):
- **Railway**: $5-20/month
  - Backend: $5 (Hobby)
  - PostgreSQL: $5 (Hobby)
- **Vercel**: Free tier
- **AWS S3**: $5-10/month
  - Storage: 10GB = $0.25
  - Requests: ~$2
  - Data transfer: ~$3
- **Total**: ~$15-35/month

### Growth Plan (1000-5000 users):
- **Railway**: $30-50/month
  - Backend: $20 (Pro with more resources)
  - PostgreSQL: $25 (Pro)
- **Vercel**: Free or $20/month (Pro)
- **AWS S3**: $15-25/month
- **Total**: ~$65-95/month

---

## 🎯 Custom Domain Setup (Optional)

### For Frontend (Vercel)

1. Buy domain from Namecheap/GoDaddy
2. In Vercel → **Settings** → **Domains**
3. Add your domain: `sscexam.com`
4. Add DNS records from Vercel to your domain provider
5. Wait for DNS propagation (5-30 minutes)

### For Backend (Railway)

1. In Railway → **Settings** → **Domains**
2. Add custom domain: `api.sscexam.com`
3. Add CNAME record to your DNS:
   - Name: `api`
   - Value: `your-app.up.railway.app`

---

## 🐛 Troubleshooting

### Backend Deployment Issues

**Problem**: Build fails
```bash
# Check logs in Railway
# Common issues:
# - Missing dependencies in pom.xml
# - Java version mismatch
# - Memory issues
```

**Solution**: Ensure Dockerfile uses Java 17 and maven builds successfully

**Problem**: Database connection fails
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/dbname
```

**Solution**: Use Railway's auto-generated DATABASE_URL

### Frontend Deployment Issues

**Problem**: API calls fail (CORS error)
```bash
# Check browser console
# Error: "Access-Control-Allow-Origin"
```

**Solution**:
1. Update CORS_ORIGINS in Railway backend
2. Ensure NEXT_PUBLIC_API_URL is correct

**Problem**: Environment variables not working
```bash
# Variables must start with NEXT_PUBLIC_ to be accessible in browser
```

**Solution**: Add `NEXT_PUBLIC_` prefix to client-side variables

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] AWS S3 bucket created and configured
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] CORS updated on backend
- [ ] S3 CORS updated
- [ ] Admin user created
- [ ] Test registration works
- [ ] Test login works
- [ ] Test taking a test works
- [ ] Test file upload works
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Backups enabled

---

## 🚀 Next Steps After Deployment

1. **Content Population**:
   - Add 500+ questions
   - Create 10+ mock tests
   - Upload study materials

2. **SEO Optimization**:
   - Add meta tags
   - Generate sitemap
   - Submit to Google Search Console

3. **Performance Optimization**:
   - Enable CDN (Cloudflare)
   - Optimize images
   - Monitor and optimize slow queries

4. **Marketing**:
   - Social media presence
   - Content marketing
   - User acquisition

---

## 📞 Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Review this guide
3. Check GitHub issues
4. Railway Discord: https://discord.gg/railway
5. Vercel Discord: https://vercel.com/discord

---

**Deployment Complete! 🎉**

Your SSC Exam Platform is now live and ready for users!
