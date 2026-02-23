import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = this.getRefreshToken()
            if (refreshToken) {
              const response = await this.post<{ accessToken: string; refreshToken: string }>(
                '/auth/refresh-token',
                { refreshToken },
                { skipAuthRefresh: true }
              )

              const { accessToken, refreshToken: newRefreshToken } = response.data
              this.setTokens(accessToken, newRefreshToken)

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
              }
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens()
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login'
            }
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  public setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setTokens(accessToken, refreshToken)
  }

  public removeAuthTokens(): void {
    this.clearTokens()
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { skipAuthRefresh?: boolean }
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }
}

export const apiClient = new ApiClient()
