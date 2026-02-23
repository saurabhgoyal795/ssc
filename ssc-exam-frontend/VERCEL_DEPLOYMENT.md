# Deploy Frontend to Vercel

## Quick Deployment Steps

### Step 1: Push Your Code to GitHub (if not already done)

```bash
cd /Users/Lenovo/Documents/GitHub/projects/ssc-exam-platform

# Add all files
git add .

# Commit changes
git commit -m "Prepare frontend for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Website (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**: `ssc-exam-platform`
5. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `ssc-exam-frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL = http://13.126.43.158/api/v1
   NEXT_PUBLIC_ENABLE_PAYMENTS = false
   ```

7. **Click "Deploy"**

Wait 2-3 minutes for deployment to complete!

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd ssc-exam-frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 3: Get Your Vercel URL

After deployment, you'll get a URL like:
- `https://your-app-name.vercel.app`

### Step 4: Update Backend CORS Settings

Your backend needs to allow requests from your Vercel domain.

**Connect to EC2**:
```bash
ssh -i /Users/Lenovo/Downloads/ssc.pem ubuntu@13.126.43.158
```

**Edit the .env file**:
```bash
nano /opt/ssc-exam-backend/ssc-exam-backend/.env
```

**Update CORS_ORIGINS** to include your Vercel URL:
```bash
CORS_ORIGINS=http://localhost:3000,https://your-app-name.vercel.app
```

**Restart the backend**:
```bash
sudo systemctl restart ssc-exam-backend
```

### Step 5: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Login page loads
- ✅ Registration works
- ✅ Login works
- ✅ API calls work

## Updating Your Deployment

### Automatic Deployments
Every time you push to GitHub, Vercel will automatically redeploy!

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy!
```

### Manual Deployment
```bash
cd ssc-exam-frontend
vercel --prod
```

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update your DNS records as instructed
5. Update `CORS_ORIGINS` in backend to include your custom domain

## Troubleshooting

### API calls not working
- Check backend CORS settings include your Vercel URL
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` environment variable in Vercel

### Build fails
- Check Node.js version compatibility
- Check package.json for missing dependencies
- View build logs in Vercel dashboard

### Environment variables not working
- Environment variables must start with `NEXT_PUBLIC_`
- Redeploy after adding new environment variables
- Check they're set in Vercel dashboard under Project Settings → Environment Variables

## Important Notes

- ✅ Free SSL/HTTPS included
- ✅ CDN for fast loading worldwide
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for pull requests
- ✅ Built-in analytics

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
