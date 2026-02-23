# 🚀 Quick Deployment Guide - SSC Exam Platform

This is a streamlined version of the deployment process. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## ⚡ 5-Step Deployment

### Step 1: Push to GitHub (2 minutes)

```bash
# Initialize and push
cd /Users/Lenovo/Documents/GitHub/projects/ssc-exam-platform
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ssc-exam-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Setup AWS S3 (5 minutes)

1. **AWS Console** → **S3** → **Create bucket**
   - Name: `ssc-exam-files-prod`
   - Region: `ap-south-1`
   - Uncheck "Block all public access"

2. **Bucket** → **Permissions** → **CORS**:
```json
[{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
}]
```

3. **IAM** → **Users** → **Create user** → Get credentials
   - Save Access Key ID and Secret Key

### Step 3: Deploy Backend to Railway (10 minutes)

1. **Go to [Railway.app](https://railway.app)** → Sign up with GitHub

2. **New Project** → **Deploy from GitHub**
   - Select your repository

3. **Add PostgreSQL**:
   - Click **New** → **Database** → **PostgreSQL**

4. **Configure Backend Service**:
   - Root Directory: `ssc-exam-backend`
   - Uses Dockerfile automatically

5. **Add Environment Variables** (click Variables tab):
```bash
JWT_SECRET=your-256-bit-secret-key-change-this
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ssc-exam-files-prod
CORS_ORIGINS=http://localhost:3000
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

6. **Generate Domain** → Copy the Railway URL
   - Will be like: `https://ssc-exam-backend-production.up.railway.app`

### Step 4: Deploy Frontend to Vercel (5 minutes)

1. **Go to [Vercel.com](https://vercel.com)** → Sign up with GitHub

2. **Import Project** → Select your GitHub repo

3. **Configure**:
   - Framework: Next.js
   - Root Directory: `ssc-exam-frontend`
   - Build Command: `npm run build`

4. **Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
```

5. **Deploy** → Wait 3-5 minutes → Copy Vercel URL
   - Will be like: `https://ssc-exam-platform.vercel.app`

### Step 5: Final Configuration (3 minutes)

1. **Update Railway CORS**:
   - Go to Railway backend → Variables
   - Update `CORS_ORIGINS`:
   ```bash
   CORS_ORIGINS=https://ssc-exam-platform.vercel.app,http://localhost:3000
   ```

2. **Update S3 CORS**:
   - AWS S3 bucket → Permissions → CORS
   - Replace `*` with your Vercel URL

3. **Create Admin User**:
   - Railway → PostgreSQL → Connect
   - Run:
   ```sql
   INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at)
   VALUES (
       'admin@example.com',
       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
       'Admin',
       'ADMIN',
       true,
       NOW(),
       NOW()
   );
   ```
   Password is: `password` (change after first login)

## ✅ Testing

Visit your Vercel URL and test:
- [ ] User registration
- [ ] User login
- [ ] Create a question (admin)
- [ ] Create a test (admin)
- [ ] Take a test
- [ ] Upload study material
- [ ] Download study material

## 🎉 Done!

Your platform is live at: `https://your-app.vercel.app`

Backend API at: `https://your-backend.up.railway.app`

---

## 💰 Costs

**Free Tier (Hobby)**:
- Railway: $5/month (backend + database)
- Vercel: Free
- AWS S3: $3-5/month
- **Total: ~$10/month**

**With Custom Domain**:
- Add $12/year for domain
- **Total: ~$11/month**

---

## 🔧 Common Issues

**Backend not starting?**
- Check Railway logs
- Verify DATABASE_URL is set
- Ensure Dockerfile builds successfully

**Frontend can't connect to backend?**
- Check NEXT_PUBLIC_API_URL
- Verify CORS_ORIGINS includes your Vercel URL
- Check backend is running on Railway

**File upload fails?**
- Verify AWS credentials in Railway
- Check S3 bucket CORS configuration
- Ensure bucket name matches

---

## 📚 Next Steps

1. **Add Content**: Create questions and tests
2. **Custom Domain**: Add your own domain
3. **Monitoring**: Setup alerts in Railway/Vercel
4. **SEO**: Add meta tags and sitemap
5. **Marketing**: Launch and get users!

For detailed configuration, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
