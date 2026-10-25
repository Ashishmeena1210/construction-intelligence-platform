import axios from 'axios'

const api = axios.create({
  baseURL: '',   // empty = use Vite proxy (relative URLs go through /api proxy to backend)
  timeout: 60000,
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.detail || err.message || 'An error occurred'
    return Promise.reject(new Error(msg))
  }
)

export const safetyAPI = {
  analyze: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/safety/analyze', form)
  },
  history: () => api.get('/api/safety/history'),
}

export const crackAPI = {
  analyze: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/crack/analyze', form)
  },
  history: () => api.get('/api/crack/history'),
}

export const valuationAPI = {
  estimate: (data) => api.post('/api/valuation/estimate', data),
  history: () => api.get('/api/valuation/history'),
}

export const planningAPI = {
  generate: (data) => api.post('/api/planning/generate', data),
  getProjects: () => api.get('/api/planning/projects'),
}

export const weatherAPI = {
  advisory: (data) => api.post('/api/weather/advisory', data),
  current: (location) => api.get(`/api/weather/current?location=${encodeURIComponent(location)}`),
}

export const assistantAPI = {
  chat: (data) => api.post('/api/assistant/chat', data),
  analyzeSite: (file, question) => {
    const form = new FormData()
    form.append('file', file)
    form.append('question', question)
    return api.post('/api/assistant/analyze-site', form)
  },
}

export const knowledgeAPI = {
  query: (data) => api.post('/api/knowledge/query', data),
  categories: () => api.get('/api/knowledge/categories'),
  history: () => api.get('/api/knowledge/history'),
}

export default api
