# Complete Setup Guide

Step-by-step instructions to get the SSC Exam Preparation Platform running locally.

## Prerequisites Installation

### 1. Install Java 17

**macOS (using Homebrew):**
```bash
brew install openjdk@17
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**Verify:**
```bash
java -version
# Should show: openjdk version "17.x.x"
```

### 2. Install PostgreSQL 15+

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Verify:**
```bash
psql --version
# Should show: psql (PostgreSQL) 15.x
```

### 3. Install Node.js 18+

**macOS:**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify:**
```bash
node --version  # Should show: v18.x.x or higher
npm --version   # Should show: 9.x.x or higher
```

### 4. Install Maven

**macOS:**
```bash
brew install maven
```

**Ubuntu/Debian:**
```bash
sudo apt install maven
```

**Verify:**
```bash
mvn -version
# Should show: Apache Maven 3.8.x or higher
```

### 5. ~~Install Redis~~ (Not needed - using in-memory cache)

**Note:** Redis is currently disabled. The application uses Spring's simple in-memory cache.

If you want to enable Redis later:
- Install Redis: `brew install redis` (macOS) or `sudo apt install redis-server` (Ubuntu)
- Uncomment Redis config in `pom.xml` and `application.yml`
- Rebuild the application

## Database Setup

### 1. Create PostgreSQL Database

**Start PostgreSQL CLI:**
```bash
# macOS
psql postgres

# Ubuntu/Debian (as postgres user)
sudo -u postgres psql
```

**Create Database and User:**
```sql
-- Create database
CREATE DATABASE sscexam;

-- Create user (optional - if not using default postgres user)
CREATE USER sscexamuser WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sscexam TO sscexamuser;

-- Connect to the database
\c sscexam

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO sscexamuser;

-- Exit
\q
```

### 2. Verify Database Connection

```bash
psql -h localhost -U postgres -d sscexam -c "SELECT 1;"
# Should return: 1
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd ssc-exam-platform/ssc-exam-backend
```

### 2. Configure Environment Variables

**Copy example file:**
```bash
cp .env.example .env
```

**Edit .env file:**
```bash
# Use your favorite editor
nano .env
# or
vim .env
# or
code .env  # VS Code
```

**Minimum required configuration:**
```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/sscexam
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT Secret (IMPORTANT: Generate a secure secret!)
JWT_SECRET=your-very-long-secret-key-at-least-256-bits-change-this-now

# CORS (for local development)
CORS_ORIGINS=http://localhost:3000

# Redis (Optional - currently disabled)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
```

**Generate a secure JWT secret:**
```bash
# macOS/Linux
openssl rand -base64 32
# Use the output as your JWT_SECRET
```

### 3. Build the Backend

```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the code
- Run tests
- Create the JAR file

**If you see errors:**
- Ensure Java 17 is active: `java -version`
- Clear Maven cache: `rm -rf ~/.m2/repository`
- Retry: `mvn clean install -U`

### 4. Run Database Migrations

Flyway will automatically run migrations when you start the application.

### 5. Start the Backend

```bash
mvn spring-boot:run
```

**You should see:**
```
Started SscExamApplication in X.XXX seconds
```

**Verify backend is running:**
```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

**Check Swagger UI:**
Open in browser: http://localhost:8080/swagger-ui.html

### 6. Troubleshooting Backend

**Database Connection Error:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection
psql -h localhost -U postgres -d sscexam
```

**Port 8080 already in use:**
```bash
# Find process using port 8080
lsof -ti:8080

# Kill the process
kill -9 $(lsof -ti:8080)

# Or change port in .env
PORT=8081
```

**JWT Token Error:**
- Ensure JWT_SECRET is at least 32 characters
- Use the openssl command to generate a secure key

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ssc-exam-platform/ssc-exam-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages. Takes 1-3 minutes.

**If you see errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Retry
npm install
```

### 3. Configure Environment Variables

**Copy example file:**
```bash
cp .env.example .env.local
```

**Edit .env.local:**
```bash
nano .env.local  # or your preferred editor
```

**Configuration:**
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

### 4. Start the Frontend

```bash
npm run dev
```

**You should see:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

**Open in browser:**
http://localhost:3000

### 5. Troubleshooting Frontend

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
PORT=3001 npm run dev
```

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check TypeScript
npm run type-check

# If issues persist, restart dev server
```

## Testing the Application

### 1. Create a Test User

**Open:** http://localhost:3000

**Click:** "Get Started" or "Register"

**Fill form:**
- Full Name: Test User
- Email: test@example.com
- Password: test123
- Phone: (optional)

**Click:** "Register"

**You should:**
- Be redirected to Dashboard
- See "Welcome, Test User" in header

### 2. Test Login/Logout

**Logout:**
- Click "Logout" button
- Should redirect to home page

**Login:**
- Click "Login"
- Enter email: test@example.com
- Enter password: test123
- Should redirect to Dashboard

### 3. Verify Backend

**Check database:**
```bash
psql -h localhost -U postgres -d sscexam

# Query users
SELECT id, email, full_name, role FROM users;

# Should show your test user
```

**Check API:**
```bash
# Get subjects (public endpoint)
curl http://localhost:8080/api/v1/subjects

# Should return 4 default subjects
```

## Verify Everything is Working

### Backend Checklist
- [ ] Backend starts without errors
- [ ] Database migrations completed
- [ ] Swagger UI accessible
- [ ] Health endpoint returns UP
- [ ] User registration works
- [ ] User login works

### Frontend Checklist
- [ ] Frontend starts without errors
- [ ] Home page loads
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard shows user info
- [ ] Logout works

## Next Steps

### 1. Explore the Application
- Browse the home page
- Test authentication flow
- Explore the dashboard

### 2. Add Sample Data (Optional)

You can manually add test questions via database:

```sql
-- Add a sample question
INSERT INTO questions (
  subject_id, question_text, question_type,
  difficulty_level, marks, negative_marks, is_active
) VALUES (
  1, 'What comes next: 2, 4, 6, 8, __?', 'SINGLE_CHOICE',
  'EASY', 1.0, 0.25, true
);

-- Add options for the question
INSERT INTO question_options (question_id, option_text, option_order, is_correct)
VALUES
  (1, '10', 1, true),
  (1, '9', 2, false),
  (1, '12', 3, false),
  (1, '8', 4, false);
```

### 3. Continue Development

Follow the implementation plan to build Phase 2:
- Admin panel for question management
- Test creation interface
- Test taking functionality

## Common Issues and Solutions

### Issue: "Connection refused" when frontend calls backend

**Solution:**
```bash
# Ensure backend is running
curl http://localhost:8080/actuator/health

# Check CORS settings in backend
# Verify CORS_ORIGINS includes http://localhost:3000
```

### Issue: JWT token invalid

**Solution:**
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Then login again
```

### Issue: Database migration fails

**Solution:**
```bash
# Drop and recreate database
psql postgres
DROP DATABASE sscexam;
CREATE DATABASE sscexam;
\q

# Restart backend
```

### Issue: npm install fails

**Solution:**
```bash
# Update npm
npm install -g npm@latest

# Use Node 18 or 20 (not 21+)
node -v

# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Development Tools (Recommended)

### IDE/Editor
- **VS Code** with extensions:
  - Java Extension Pack
  - Spring Boot Extension Pack
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Database GUI
- **DBeaver** (free, cross-platform)
- **Postico** (macOS)
- **pgAdmin** (official PostgreSQL GUI)

### API Testing
- **Postman** or **Insomnia**
- **cURL** (command line)

### Browser Extensions
- **React Developer Tools**
- **Redux DevTools** (works with Zustand)

## Getting Help

If you encounter issues not covered here:

1. **Check logs:**
   - Backend: Check terminal where `mvn spring-boot:run` is running
   - Frontend: Check browser console (F12)

2. **Search for error messages**
   - Stack Overflow
   - GitHub Issues

3. **Verify versions:**
   ```bash
   java -version
   node -version
   psql --version
   mvn -version
   ```

## Success! 🎉

If everything is working:
- ✅ Backend running on port 8080
- ✅ Frontend running on port 3000
- ✅ Database connected and migrated
- ✅ User registration and login working

**You're ready to start building Phase 2!**

---

**Next:** Read the implementation plan and start building test management features.
