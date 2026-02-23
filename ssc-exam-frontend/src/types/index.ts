// User types
export interface User {
  id: number
  uuid: string
  email: string
  fullName: string
  phone?: string
  role: 'STUDENT' | 'ADMIN' | 'CONTENT_CREATOR'
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  phone?: string
}

// Test types
export interface Test {
  id: number
  uuid: string
  title: string
  slug: string
  description?: string
  testType: 'MOCK_TEST' | 'SECTION_TEST' | 'TOPIC_TEST' | 'PREVIOUS_YEAR' | 'PRACTICE'
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD'
  durationMinutes: number
  totalMarks: number
  passingMarks?: number
  instructions?: string
  isPremium: boolean
  isActive: boolean
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  sections?: TestSection[]
}

export interface TestSection {
  id: number
  testId: number
  subjectId: number
  sectionName: string
  sectionOrder: number
  durationMinutes?: number
  totalMarks: number
  instructions?: string
}

export interface Question {
  id: number
  uuid: string
  subjectId: number
  topicId?: number
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL'
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD'
  marks: number
  negativeMarks: number
  solutionText?: string
  explanation?: string
  options: QuestionOption[]
}

export interface QuestionOption {
  id: number
  questionId: number
  optionText: string
  optionOrder: number
  isCorrect?: boolean
}

export interface TestAttempt {
  id: number
  uuid: string
  userId: number
  testId: number
  attemptNumber: number
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'ABANDONED'
  startedAt: string
  submittedAt?: string
  timeTakenSeconds?: number
  totalScore?: number
  correctAnswers?: number
  incorrectAnswers?: number
  unanswered?: number
  accuracyPercentage?: number
  percentile?: number
  rank?: number
}

export interface TestResponse {
  id: number
  attemptId: number
  questionId: number
  selectedOptionIds?: number[]
  numericalAnswer?: number
  isCorrect?: boolean
  marksObtained?: number
  timeTakenSeconds?: number
  isBookmarked: boolean
  isMarkedForReview: boolean
  answeredAt?: string
}

// Subject types
export interface Subject {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
