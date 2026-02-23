# SSC Exam Platform - API Documentation

## 🎯 Complete API Reference

All APIs are accessible at: `http://localhost:8080/api/v1`

**Interactive Docs:** http://localhost:8080/swagger-ui.html

---

## 🔐 Authentication

All requests (except public endpoints) require JWT token in header:
```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | No |

---

## 📚 Subjects API

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subjects` | Get all active subjects | No |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "General Intelligence & Reasoning",
      "slug": "reasoning",
      "description": "Logical and analytical reasoning",
      "icon": "🧠",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

## ❓ Questions API (Admin)

**Base Path:** `/admin/questions`
**Required Role:** ADMIN

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/questions` | Create question |
| PUT | `/admin/questions/{id}` | Update question |
| DELETE | `/admin/questions/{id}` | Delete question |
| GET | `/admin/questions/{id}` | Get question by ID |
| GET | `/admin/questions/uuid/{uuid}` | Get question by UUID |
| GET | `/admin/questions` | List all questions |

### Query Parameters (GET)

| Parameter | Type | Description |
|-----------|------|-------------|
| `subjectId` | Long | Filter by subject |
| `topicId` | Long | Filter by topic |
| `difficultyLevel` | Enum | EASY, MEDIUM, HARD |
| `questionType` | Enum | SINGLE_CHOICE, MULTIPLE_CHOICE, NUMERICAL |
| `search` | String | Search in question text |
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 20) |

### Create Question Request

```json
POST /api/v1/admin/questions
{
  "subjectId": 1,
  "topicId": 5,
  "questionText": "What is the capital of India?",
  "questionType": "SINGLE_CHOICE",
  "difficultyLevel": "EASY",
  "marks": 1.0,
  "negativeMarks": 0.25,
  "solutionText": "Delhi has been the capital since 1911",
  "explanation": "New Delhi is the capital of India",
  "options": [
    {
      "optionText": "Mumbai",
      "optionOrder": 1,
      "isCorrect": false
    },
    {
      "optionText": "Delhi",
      "optionOrder": 2,
      "isCorrect": true
    },
    {
      "optionText": "Kolkata",
      "optionOrder": 3,
      "isCorrect": false
    },
    {
      "optionText": "Chennai",
      "optionOrder": 4,
      "isCorrect": false
    }
  ]
}
```

### Update Question Request

```json
PUT /api/v1/admin/questions/{id}
{
  "questionText": "Updated question text",
  "difficultyLevel": "MEDIUM",
  "explanation": "Updated explanation"
}
```

### Question Response

```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "subjectId": 1,
    "subjectName": "General Intelligence & Reasoning",
    "topicId": 5,
    "topicName": "Logical Reasoning",
    "questionText": "What is the capital of India?",
    "questionType": "SINGLE_CHOICE",
    "difficultyLevel": "EASY",
    "marks": 1.0,
    "negativeMarks": 0.25,
    "solutionText": "Delhi has been the capital since 1911",
    "explanation": "New Delhi is the capital of India",
    "options": [
      {
        "id": 1,
        "optionText": "Mumbai",
        "optionOrder": 1,
        "isCorrect": false
      },
      {
        "id": 2,
        "optionText": "Delhi",
        "optionOrder": 2,
        "isCorrect": true
      }
    ],
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

### List Questions

```bash
# All questions
GET /api/v1/admin/questions?page=0&size=20

# Filter by subject
GET /api/v1/admin/questions?subjectId=1&page=0&size=20

# Filter by difficulty
GET /api/v1/admin/questions?difficultyLevel=EASY&page=0&size=20

# Search
GET /api/v1/admin/questions?search=capital&page=0&size=20

# Combined filters
GET /api/v1/admin/questions?subjectId=1&difficultyLevel=EASY&questionType=SINGLE_CHOICE&page=0&size=20
```

---

## 📝 Tests API (Admin)

**Base Path:** `/admin/tests`
**Required Role:** ADMIN

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/tests` | Create test |
| PUT | `/admin/tests/{id}` | Update test |
| DELETE | `/admin/tests/{id}` | Delete test |
| GET | `/admin/tests/{id}` | Get test by ID |
| GET | `/admin/tests` | List all tests (admin view) |
| GET | `/admin/tests/drafts` | List draft tests |
| POST | `/admin/tests/{id}/publish` | Publish test |
| POST | `/admin/tests/{id}/unpublish` | Unpublish test |

### Create Test Request

```json
POST /api/v1/admin/tests
{
  "title": "SSC CGL Tier 1 Mock Test 1",
  "slug": "ssc-cgl-tier-1-mock-test-1",
  "description": "Full-length mock test for SSC CGL Tier 1",
  "testType": "MOCK_TEST",
  "difficultyLevel": "MEDIUM",
  "durationMinutes": 60,
  "totalMarks": 100,
  "passingMarks": 40,
  "instructions": "1. All questions are compulsory\n2. No negative marking",
  "isPremium": false,
  "sections": [
    {
      "subjectId": 1,
      "sectionName": "Reasoning",
      "sectionOrder": 1,
      "durationMinutes": 15,
      "totalMarks": 25,
      "instructions": "Solve all reasoning questions"
    },
    {
      "subjectId": 3,
      "sectionName": "Quantitative Aptitude",
      "sectionOrder": 2,
      "durationMinutes": 20,
      "totalMarks": 25
    }
  ],
  "questionIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

### Test Response

```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440001",
    "title": "SSC CGL Tier 1 Mock Test 1",
    "slug": "ssc-cgl-tier-1-mock-test-1",
    "description": "Full-length mock test for SSC CGL Tier 1",
    "testType": "MOCK_TEST",
    "difficultyLevel": "MEDIUM",
    "durationMinutes": 60,
    "totalMarks": 100,
    "passingMarks": 40,
    "instructions": "1. All questions are compulsory",
    "isPremium": false,
    "isPublished": false,
    "publishedAt": null,
    "totalQuestions": 10,
    "sections": [
      {
        "id": 1,
        "subjectId": 1,
        "subjectName": "General Intelligence & Reasoning",
        "sectionName": "Reasoning",
        "sectionOrder": 1,
        "durationMinutes": 15,
        "totalMarks": 25
      }
    ],
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

### Publish Test

```bash
POST /api/v1/admin/tests/{id}/publish
```

Response:
```json
{
  "success": true,
  "message": "Test published successfully",
  "data": {
    "id": 1,
    "isPublished": true,
    "publishedAt": "2024-01-15T11:00:00"
  }
}
```

---

## 📝 Tests API (Public)

**Base Path:** `/tests`
**Auth:** Not required for listing/viewing

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tests` | List all published tests |
| GET | `/tests/{slug}` | Get test by slug |
| GET | `/tests/{slug}/details` | Get test with questions |

### Query Parameters (GET /tests)

| Parameter | Type | Description |
|-----------|------|-------------|
| `testType` | Enum | MOCK_TEST, SECTION_TEST, TOPIC_TEST, PREVIOUS_YEAR, PRACTICE |
| `difficultyLevel` | Enum | EASY, MEDIUM, HARD |
| `isPremium` | Boolean | Filter premium tests |
| `search` | String | Search in test title |
| `page` | Integer | Page number (default: 0) |
| `size` | Integer | Page size (default: 20) |

### Examples

```bash
# All published tests
GET /api/v1/tests?page=0&size=20

# Filter by test type
GET /api/v1/tests?testType=MOCK_TEST&page=0&size=20

# Filter by difficulty
GET /api/v1/tests?difficultyLevel=EASY&page=0&size=20

# Search tests
GET /api/v1/tests?search=SSC%20CGL&page=0&size=20

# Get test details
GET /api/v1/tests/ssc-cgl-tier-1-mock-test-1

# Get test with questions (for preview)
GET /api/v1/tests/ssc-cgl-tier-1-mock-test-1/details
```

### Test Detail Response

```json
{
  "success": true,
  "data": {
    "test": {
      "id": 1,
      "title": "SSC CGL Tier 1 Mock Test 1",
      "slug": "ssc-cgl-tier-1-mock-test-1",
      "totalQuestions": 10,
      "durationMinutes": 60,
      "totalMarks": 100
    },
    "questions": [
      {
        "id": 1,
        "questionText": "What is 2 + 2?",
        "questionType": "SINGLE_CHOICE",
        "marks": 1.0,
        "negativeMarks": 0.25,
        "options": [
          {
            "id": 1,
            "optionText": "3",
            "optionOrder": 1,
            "isCorrect": null
          },
          {
            "id": 2,
            "optionText": "4",
            "optionOrder": 2,
            "isCorrect": null
          }
        ]
      }
    ]
  }
}
```

**Note:** `isCorrect` is `null` for students (hidden), shown only after test submission or to admins.

---

## 📊 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "content": [ ],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false
  }
}
```

---

## 🔒 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Create Question (Admin)
```bash
curl -X POST http://localhost:8080/api/v1/admin/questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": 1,
    "questionText": "Test question?",
    "questionType": "SINGLE_CHOICE",
    "difficultyLevel": "EASY",
    "marks": 1.0,
    "negativeMarks": 0.25,
    "options": [
      {"optionText": "Option 1", "optionOrder": 1, "isCorrect": true},
      {"optionText": "Option 2", "optionOrder": 2, "isCorrect": false}
    ]
  }'
```

### List Tests (Public)
```bash
curl -X GET http://localhost:8080/api/v1/tests?page=0&size=20
```

---

## 📖 Additional Notes

### Question Type Rules
- **SINGLE_CHOICE:** Exactly 1 correct option required
- **MULTIPLE_CHOICE:** 1 or more correct options allowed
- **NUMERICAL:** No options, answer is a number

### Slug Format
- Lowercase letters, numbers, and hyphens only
- Example: `ssc-cgl-mock-test-1`

### Pagination
- Default page size: 20
- Max page size: 100
- Pages are 0-indexed

### Soft Delete
- Questions and tests are soft deleted (is_active = false)
- Data is preserved for historical test attempts
- Not returned in list queries

---

**For interactive testing, use Swagger UI:** http://localhost:8080/swagger-ui.html
