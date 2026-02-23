import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from '@/types'

export interface QuestionOption {
  id?: number
  optionText: string
  optionOrder: number
  isCorrect: boolean
}

export interface Question {
  id: number
  uuid: string
  subjectId: number
  subjectName: string
  topicId?: number
  topicName?: string
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL'
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD'
  marks: number
  negativeMarks: number
  solutionText?: string
  explanation?: string
  options: QuestionOption[]
  createdAt: string
}

export interface CreateQuestionRequest {
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

export interface QuestionFilters {
  subjectId?: number
  topicId?: number
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD'
  questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL'
  search?: string
  page?: number
  size?: number
}

export const questionsApi = {
  create: async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await apiClient.post<ApiResponse<Question>>('/admin/questions', data)
    return response.data.data
  },

  update: async (id: number, data: Partial<CreateQuestionRequest>): Promise<Question> => {
    const response = await apiClient.put<ApiResponse<Question>>(`/admin/questions/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/questions/${id}`)
  },

  getById: async (id: number): Promise<Question> => {
    const response = await apiClient.get<ApiResponse<Question>>(`/admin/questions/${id}`)
    return response.data.data
  },

  list: async (filters: QuestionFilters = {}): Promise<PaginatedResponse<Question>> => {
    const params = new URLSearchParams()

    if (filters.subjectId) params.append('subjectId', filters.subjectId.toString())
    if (filters.topicId) params.append('topicId', filters.topicId.toString())
    if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel)
    if (filters.questionType) params.append('questionType', filters.questionType)
    if (filters.search) params.append('search', filters.search)
    params.append('page', (filters.page || 0).toString())
    params.append('size', (filters.size || 20).toString())

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Question>>>(
      `/admin/questions?${params.toString()}`
    )
    return response.data.data
  },
}
