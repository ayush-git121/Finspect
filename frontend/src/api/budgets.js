import api from './axios.js'

export const getBudgets = () => api.get('/budgets')
export const upsertBudget = (data) => api.post('/budgets', data)
export const deleteBudget = (id) => api.delete(`/budgets/${id}`)