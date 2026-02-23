import { apiClient } from './client'
import type { ApiResponse } from '@/types'

export interface SubmitAnswerRequest {
  questionId: number
  selectedOptionIds?: number[]
  numericalAnswer?: number
  isBookmarked?: boolean
  isMarkedForReview?: boolean
  timeTakenSeconds?: number
}

export interface TestAttemptResponse {
  id: number
  uuid: string
  testId: number
  testTitle: string
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
  durationMinutes: number
  totalQuestions: number
  questions: QuestionAttemptResponse[]
}

export interface QuestionAttemptResponse {
  id: number
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL'
  marks: number
  negativeMarks: number
  options: OptionAttemptResponse[]
  selectedOptionIds?: number[]
  numericalAnswer?: number
  isCorrect?: boolean
  marksObtained?: number
  isBookmarked: boolean
  isMarkedForReview: boolean
  questionOrder: number
  solutionText?: string
  explanation?: string
}

export interface OptionAttemptResponse {
  id: number
  optionText: string
  optionOrder: number
  isCorrect?: boolean
}

export interface TestResultResponse {
  attemptUuid: string
  testTitle: string
  submittedAt: string
  timeTakenSeconds: number
  totalScore: number
  maxScore: number
  correctAnswers: number
  incorrectAnswers: number
  unanswered: number
  accuracyPercentage: number
  percentile: number
  rank: number
  totalAttempts: number
  performanceSummary: string
}

export const testAttemptsApi = {
  startTest: async (testId: number): Promise<TestAttemptResponse> => {
    const response = await apiClient.post<ApiResponse<TestAttemptResponse>>(
      `/tests/${testId}/start`
    )
    return response.data.data
  },

  getAttemptDetails: async (attemptUuid: string): Promise<TestAttemptResponse> => {
    const response = await apiClient.get<ApiResponse<TestAttemptResponse>>(
      `/tests/attempts/${attemptUuid}`
    )
    return response.data.data
  },

  submitAnswer: async (
    attemptUuid: string,
    request: SubmitAnswerRequest
  ): Promise<void> => {
    await apiClient.post(`/tests/attempts/${attemptUuid}/answers`, request)
  },

  submitTest: async (attemptUuid: string): Promise<TestAttemptResponse> => {
    const response = await apiClient.post<ApiResponse<TestAttemptResponse>>(
      `/tests/attempts/${attemptUuid}/submit`
    )
    return response.data.data
  },

  getTestResult: async (attemptUuid: string): Promise<TestResultResponse> => {
    const response = await apiClient.get<ApiResponse<TestResultResponse>>(
      `/tests/attempts/${attemptUuid}/result`
    )
    return response.data.data
  },
}
