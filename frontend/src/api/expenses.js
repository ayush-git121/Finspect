import api from './axios.js'

export const getExpenses = (params) => api.get('/expenses', { params })
export const createExpense = (data) => api.post('/expenses', data)
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`)
export const getSummary = (params) => api.get('/expenses/summary', { params })
export const getAIReport = (params) => api.get('/expenses/ai-report', { params })