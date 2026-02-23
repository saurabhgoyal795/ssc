import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, Test } from '@/types'

export interface TestSection {
  subjectId: number
  sectionName: string
  sectionOrder: number
  durationMinutes?: number
  totalMarks: number
  instructions?: string
}

export interface CreateTestRequest {
  title: string
  slug: string
  description?: string
  testType: 'MOCK_TEST' | 'SECTION_TEST' | 'TOPIC_TEST' | 'PREVIOUS_YEAR' | 'PRACTICE'
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD'
  durationMinutes: number
  totalMarks: number
  passingMarks?: number
  instructions?: string
  isPremium?: boolean
  sections?: TestSection[]
  questionIds: number[]
}

export interface TestFilters {
  testType?: string
  difficultyLevel?: string
  isPremium?: boolean
  search?: string
  page?: number
  size?: number
}

export const testsApi = {
  // Admin endpoints
  create: async (data: CreateTestRequest): Promise<Test> => {
    const response = await apiClient.post<ApiResponse<Test>>('/admin/tests', data)
    return response.data.data
  },

  update: async (id: number, data: CreateTestRequest): Promise<Test> => {
    const response = await apiClient.put<ApiResponse<Test>>(`/admin/tests/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/tests/${id}`)
  },

  publish: async (id: number): Promise<Test> => {
    const response = await apiClient.post<ApiResponse<Test>>(`/admin/tests/${id}/publish`)
    return response.data.data
  },

  unpublish: async (id: number): Promise<Test> => {
    const response = await apiClient.post<ApiResponse<Test>>(`/admin/tests/${id}/unpublish`)
    return response.data.data
  },

  getById: async (id: number): Promise<Test> => {
    const response = await apiClient.get<ApiResponse<Test>>(`/admin/tests/${id}`)
    return response.data.data
  },

  listAdmin: async (filters: TestFilters = {}): Promise<PaginatedResponse<Test>> => {
    const params = new URLSearchParams()
    params.append('page', (filters.page || 0).toString())
    params.append('size', (filters.size || 20).toString())

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Test>>>(
      `/admin/tests?${params.toString()}`
    )
    return response.data.data
  },

  listDrafts: async (page = 0, size = 20): Promise<PaginatedResponse<Test>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Test>>>(
      `/admin/tests/drafts?page=${page}&size=${size}`
    )
    return response.data.data
  },

  // Public endpoints
  list: async (filters: TestFilters = {}): Promise<PaginatedResponse<Test>> => {
    const params = new URLSearchParams()

    if (filters.testType) params.append('testType', filters.testType)
    if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel)
    if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString())
    if (filters.search) params.append('search', filters.search)
    params.append('page', (filters.page || 0).toString())
    params.append('size', (filters.size || 20).toString())

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Test>>>(
      `/tests?${params.toString()}`
    )
    return response.data.data
  },

  getBySlug: async (slug: string): Promise<Test> => {
    const response = await apiClient.get<ApiResponse<Test>>(`/tests/${slug}`)
    return response.data.data
  },
}
