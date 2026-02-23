import { apiClient } from './client'
import type { ApiResponse, Subject } from '@/types'

// Re-export Subject type for convenience
export type { Subject }

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    const response = await apiClient.get<ApiResponse<Subject[]>>('/subjects')
    return response.data.data
  },
}
