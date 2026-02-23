# SSC & Government Exam Preparation Platform

A comprehensive, world-class exam preparation platform for SSC (CGL, CHSL, MTS) and other government exams with mock tests, study materials, video lectures, and advanced analytics.

## 🎯 Project Overview

This platform provides students with:
- **Mock Tests**: Full-length and sectional tests with realistic exam environments
- **Study Materials**: Comprehensive PDFs, notes, and previous year papers
- **Video Lectures**: Expert-taught video courses
- **Analytics**: Detailed performance tracking and insights
- **Leaderboards**: Compare progress with peers
- **Free Access**: All content is currently FREE (payment system ready for future activation)

## 🏗️ Architecture

### Tech Stack

**Backend**
- Java 17 + Spring Boot 3.2
- PostgreSQL 15+ (database)
- In-Memory Caching (Redis optional)
- JWT (authentication)
- Flyway (migrations)
- Maven (build tool)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- SWR (data fetching)
- Axios (API client)

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

### Backend Setup

1. **Create Database**
```bash
createdb sscexam
```

2. **Configure Environment**
```bash
cd ssc-exam-backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. **Run Backend**
```bash
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
```bash
cd ssc-exam-frontend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# API URL is already configured for local development
```

3. **Run Frontend**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **API Docs**: http://localhost:8080/swagger-ui.html

## 📁 Project Structure

```
ssc-exam-platform/
├── ssc-exam-backend/       # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/sscexam/
│   │       ├── config/     # Security, CORS, Redis
│   │       ├── controller/ # REST endpoints
│   │       ├── service/    # Business logic
│   │       ├── repository/ # JPA repositories
│   │       ├── model/      # Entities, DTOs, Enums
│   │       ├── security/   # JWT, Auth filters
│   │       └── exception/  # Error handling
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # Flyway SQL scripts
│
├── ssc-exam-frontend/      # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # UI components
│   │   ├── lib/          # API client, utilities
│   │   ├── store/        # Zustand state
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
│
└── README.md
```

## ✅ Phase 1 Implementation Status

### Backend (Completed)
- ✅ Database schema (25+ tables)
- ✅ User authentication (JWT)
- ✅ Security configuration
- ✅ Exception handling
- ✅ Core entities and repositories
- ✅ Auth APIs (register, login, refresh, logout)
- ✅ CORS configuration
- ✅ API documentation (Swagger)

### Frontend (Completed)
- ✅ Next.js 14 setup with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS + shadcn/ui
- ✅ Authentication pages (login, register)
- ✅ Dashboard page
- ✅ API client with auto-refresh
- ✅ Zustand state management
- ✅ Protected routes
- ✅ Responsive design

## 📋 Next Steps (Phase 2-9)

### Phase 2: Question Bank & Test Management
- Admin panel for creating questions and tests
- Bulk question upload (CSV)
- Test listing and details pages

### Phase 3: Test Taking & Evaluation
- Test attempt interface
- Timer and auto-submit
- Question navigator
- Results and solutions

### Phase 4: Study Materials
- PDF materials library
- Download functionality
- Search and filters

### Phase 5: Video Lectures
- Video courses
- Progress tracking
- YouTube/Vimeo integration

### Phase 6: Analytics
- Performance dashboard
- Subject-wise analysis
- Weak areas identification
- Progress charts

### Phase 7: Premium Features (Optional)
- Razorpay payment integration
- Subscription management
- Access control

### Phase 8: Polish & Testing
- Performance optimization
- SEO optimization
- Security audit
- Mobile responsiveness

## 🔑 Key Features

### Anti-Cheating Measures
- Server-side timer validation
- Auto-submit on time expiry
- Tab switch detection
- Question randomization
- Rate limiting on submissions

### Performance Optimizations
- Redis caching (10-60 min TTL)
- Database indexing
- Pre-aggregated analytics
- Next.js ISR (Incremental Static Regeneration)
- Lazy loading

### Security
- JWT authentication
- Password hashing (BCrypt)
- CORS configuration
- SQL injection prevention
- XSS protection

## 📊 Database Schema

The database includes 25+ tables organized into modules:
- **User & Auth**: users, refresh_tokens, user_preferences
- **Subscriptions**: subscription_plans, user_subscriptions, payment_transactions
- **Content**: subjects, topics, questions, question_options
- **Tests**: tests, test_sections, test_questions, user_test_attempts, user_test_responses
- **Materials**: study_materials
- **Videos**: video_courses, videos, video_watch_history
- **Analytics**: user_subject_analytics, user_topic_analytics, daily_activity_log, leaderboard_cache
- **Misc**: bookmarks, notifications

## 🎓 Default Content

The platform comes with:
- 4 default subjects (Reasoning, General Awareness, Quantitative Aptitude, English)
- 4 subscription plans (currently FREE, can be activated later)
- Sample database structure ready for content

## 🔧 Development

### Backend Development

```bash
cd ssc-exam-backend

# Run tests
mvn test

# Build
mvn clean package

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development

```bash
cd ssc-exam-frontend

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Tests (To be implemented)
- `GET /api/v1/tests` - List tests
- `GET /api/v1/tests/{slug}` - Test details
- `POST /api/v1/tests/{id}/start` - Start attempt
- `POST /api/v1/tests/attempts/{id}/submit` - Submit test

## 🌐 Deployment

### Backend
- **Recommended**: AWS Elastic Beanstalk or Railway
- **Database**: AWS RDS or Supabase
- **Cache**: Redis Cloud or AWS ElastiCache

### Frontend
- **Recommended**: Vercel (zero-config)
- **Alternative**: Netlify, AWS Amplify

### Estimated Costs (MVP)
- Frontend (Vercel): $0-20/month
- Backend (Railway): $5-20/month
- Database (Supabase): $25-50/month
- Redis: $0-15/month
- S3 Storage: $5-15/month
- **Total**: ~$50-100/month

## 🤝 Contributing

This is a solo developer project. For major changes:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create a pull request

## 📄 License

Proprietary - All rights reserved

## 🎯 Success Metrics

### Month 1-2 (Beta)
- 50-100 registered users
- 20+ active users
- 500+ test attempts

### Month 3-6 (Growth)
- 500-1000 registered users
- 100+ daily active users
- 5000+ test attempts

## 📞 Support

For issues and questions:
- Backend issues: Check logs in `logs/` directory
- Frontend issues: Check browser console
- Database issues: Verify connection in `application.yml`

## 🙏 Acknowledgments

Built with modern technologies and best practices for scalability and maintainability.

---

**Happy Learning! 🚀**
