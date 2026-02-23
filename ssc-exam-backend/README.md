# SSC Exam Backend

Backend for SSC and Government Exam Preparation Platform built with Spring Boot 3.x.

## Tech Stack

- **Java 17+**
- **Spring Boot 3.2.1**
- **PostgreSQL 15+**
- **JWT** (for authentication)
- **Flyway** (for database migrations)
- **Maven** (build tool)
- **In-Memory Caching** (Redis can be added later)

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 15+

## Setup Instructions

### 1. Clone the repository

```bash
cd ssc-exam-platform/ssc-exam-backend
```

### 2. Setup PostgreSQL Database

```sql
CREATE DATABASE sscexam;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_USERNAME`: Database username
- `DATABASE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT (min 256 bits)

Optional configuration:
- AWS S3, Razorpay credentials (not required for basic setup)
- Redis (currently using in-memory cache, can be added later)

### 4. Run Database Migrations

Migrations will run automatically on application startup via Flyway.

### 5. Build the Application

```bash
mvn clean install
```

### 6. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

Once the application is running, access the Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

API docs (JSON): `http://localhost:8080/api-docs`

## Available Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Tests
- `GET /api/v1/tests` - List all tests
- `GET /api/v1/tests/{slug}` - Get test details
- `POST /api/v1/tests/{id}/start` - Start test attempt
- `POST /api/v1/tests/attempts/{attemptId}/submit-answer` - Submit answer
- `POST /api/v1/tests/attempts/{attemptId}/submit` - Submit complete test
- `GET /api/v1/tests/attempts/{attemptId}/result` - View results

### Study Materials
- `GET /api/v1/materials` - List study materials
- `GET /api/v1/materials/{slug}` - Get material details

### Videos
- `GET /api/v1/videos/courses` - List video courses
- `GET /api/v1/videos/courses/{slug}` - Get course details

## Development

### Running Tests

```bash
mvn test
```

### Building for Production

```bash
mvn clean package -DskipTests
```

The JAR file will be in `target/ssc-exam-backend-1.0.0.jar`

### Database Migrations

Migrations are located in `src/main/resources/db/migration/`.

To create a new migration:
1. Create a new file: `V{version}__description.sql`
2. Example: `V2__add_user_preferences.sql`

## Project Structure

```
src/main/java/com/sscexam/
├── config/          # Spring configuration
├── controller/      # REST controllers
├── exception/       # Exception handling
├── model/
│   ├── dto/        # Data Transfer Objects
│   ├── entity/     # JPA entities
│   └── enums/      # Enumerations
├── repository/      # JPA repositories
├── security/        # Security & JWT
├── service/         # Business logic
└── util/           # Utilities
```

## Important Notes

- All courses and content are **FREE** during the initial phase
- Premium features (payments) are in the codebase but not enforced
- Default user role is `STUDENT`
- Admin users must be created manually in the database

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `sscexam` exists

### JWT Token Issues
- Ensure `JWT_SECRET` is at least 256 bits (32 characters)
- Token expiry: Access token = 24h, Refresh token = 7 days

### Port Already in Use
Change the port in `application.yml` or set `PORT` environment variable.

## License

Proprietary - All rights reserved
