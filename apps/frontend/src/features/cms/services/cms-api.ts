import axios from 'axios'

const cmsApi = axios.create({
  baseURL: '/api/v1/cms',
  headers: { 'Content-Type': 'application/json' },
})

cmsApi.interceptors.request.use((config) => {
  const stored = localStorage.getItem('cms-auth')
  if (stored) {
    try {
      const { token } = JSON.parse(stored)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch { /* ignore */ }
  }
  return config
})

cmsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cms-auth')
      window.location.href = '/cms/login'
    }
    return Promise.reject(error)
  },
)

export default cmsApi
