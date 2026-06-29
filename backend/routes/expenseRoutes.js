import express from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getAIReport
} from '../controllers/expenseController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/summary', getSummary)
router.get('/ai-report', getAIReport)
router.get('/', getExpenses)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router