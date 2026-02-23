import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from '@/types'

export interface StudyMaterial {
  id: number
  uuid: string
  title: string
  slug: string
  description?: string
  subjectId?: number
  subjectName?: string
  topicId?: number
  topicName?: string
  materialType: 'PDF' | 'ARTICLE' | 'NOTES' | 'CHEAT_SHEET'
  fileUrl?: string
  fileSizeBytes?: number
  thumbnailUrl?: string
  isPremium: boolean
  downloadCount: number
  viewCount: number
  createdByName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMaterialRequest {
  title: string
  slug?: string
  description?: string
  subjectId?: number
  topicId?: number
  materialType: 'PDF' | 'ARTICLE' | 'NOTES' | 'CHEAT_SHEET'
  isPremium?: boolean
}

export interface MaterialFilters {
  subjectId?: number
  topicId?: number
  materialType?: 'PDF' | 'ARTICLE' | 'NOTES' | 'CHEAT_SHEET'
  isPremium?: boolean
  search?: string
  page?: number
  size?: number
}

export interface FileUploadResponse {
  s3Key: string
  fileUrl: string
  fileSizeBytes: number
  fileName: string
}

export const materialsApi = {
  // Public endpoints
  list: async (filters: MaterialFilters = {}): Promise<PaginatedResponse<StudyMaterial>> => {
    const params = new URLSearchParams()

    if (filters.subjectId) params.append('subjectId', filters.subjectId.toString())
    if (filters.topicId) params.append('topicId', filters.topicId.toString())
    if (filters.materialType) params.append('materialType', filters.materialType)
    if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString())
    if (filters.search) params.append('search', filters.search)
    params.append('page', (filters.page || 0).toString())
    params.append('size', (filters.size || 20).toString())

    const response = await apiClient.get<ApiResponse<PaginatedResponse<StudyMaterial>>>(
      `/materials?${params.toString()}`
    )
    return response.data.data
  },

  getBySlug: async (slug: string): Promise<StudyMaterial> => {
    const response = await apiClient.get<ApiResponse<StudyMaterial>>(`/materials/${slug}`)
    return response.data.data
  },

  getDownloadUrl: async (slug: string): Promise<string> => {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(
      `/materials/${slug}/download`
    )
    return response.data.data.downloadUrl
  },

  // Admin endpoints
  create: async (data: CreateMaterialRequest): Promise<StudyMaterial> => {
    const response = await apiClient.post<ApiResponse<StudyMaterial>>('/admin/materials', data)
    return response.data.data
  },

  update: async (id: number, data: Partial<CreateMaterialRequest>): Promise<StudyMaterial> => {
    const response = await apiClient.put<ApiResponse<StudyMaterial>>(
      `/admin/materials/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/materials/${id}`)
  },

  uploadFile: async (id: number, file: File): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
      `/admin/materials/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },
}
