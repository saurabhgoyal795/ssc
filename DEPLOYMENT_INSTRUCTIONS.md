# Deployment Instructions

## Quick Deployment Steps

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `ssc-exam-platform`
3. Keep it Private or Public (your choice)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### 2. Push Code to GitHub
Run these commands in your terminal:
```bash
cd /Users/Lenovo/Documents/GitHub/projects/ssc-exam-platform
git remote add origin https://github.com/YOUR_USERNAME/ssc-exam-platform.git
git branch -M main
git push -u origin main
```

### 3. Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `ssc-exam-platform` repository
6. Railway will auto-detect the Dockerfile and deploy

7. **Add Environment Variables** in Railway dashboard:
   - Go to your project → Variables
   - Add these variables:

```
DATABASE_URL=<Railway will provide PostgreSQL URL automatically>
JWT_SECRET=<generate a secure random string, min 32 characters>
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

AWS_ACCESS_KEY_ID=<your AWS access key>
AWS_SECRET_ACCESS_KEY=<your AWS secret key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=ssc-exam-files

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

8. **Add PostgreSQL Database:**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL

9. **Get your backend URL:**
   - After deployment, Railway provides a URL like: `https://your-app.railway.app`
   - Copy this URL for frontend configuration

### 4. Deploy Frontend to Vercel

1. Go to https://vercel.com/
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import `ssc-exam-platform` repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `ssc-exam-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   ```

7. Click "Deploy"

### 5. Post-Deployment Steps

1. **Update CORS in Railway:**
   - Go to Railway → Variables
   - Update `CORS_ALLOWED_ORIGINS` with your Vercel frontend URL

2. **Test the Application:**
   - Visit your Vercel URL
   - Register a new user
   - Login and test the features

3. **Create Admin User:**
   Connect to Railway PostgreSQL and run:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## Estimated Costs

- **Railway:** $5/month (Hobby plan includes $5 credit)
- **Vercel:** Free for hobby projects
- **AWS S3:** ~$1-5/month (pay as you go)
- **Total:** ~$6-10/month

## Support

- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Report issues in your repository

