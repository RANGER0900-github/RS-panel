import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors and refresh tokens
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error) || !error.config) {
      toast.error('Network error. Please try again.')
      return Promise.reject(error)
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = useAuthStore.getState().refreshToken
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: new_refresh_token } = response.data
          const user = useAuthStore.getState().user
          
          if (user && originalRequest.headers) {
            useAuthStore.getState().setAuth(access_token, new_refresh_token, user)
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`
            }
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, logout
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    // Map backend error toasts consistently
    const backend = error.response?.data as any
    const detail = backend?.error?.detail || backend?.detail
    if (detail) {
      const message = typeof detail === 'string' ? detail : 'Request failed'
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api

