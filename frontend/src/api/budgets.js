import api from './axios.js'

export const getBudgets = () => api.get('/api/budgets')
export const upsertBudget = (data) => api.post('/api/budgets', data)
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`)