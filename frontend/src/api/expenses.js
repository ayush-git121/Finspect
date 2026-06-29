import api from './axios.js'

export const getExpenses = (params) => api.get('/api/expenses', { params })
export const createExpense = (data) => api.post('/api/expenses', data)
export const updateExpense = (id, data) => api.put(`/api/expenses/${id}`, data)
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`)
export const getSummary = (params) => api.get('/api/expenses/summary', { params })
export const getAIReport = (params) => api.get('/api/expenses/ai-report', { params })