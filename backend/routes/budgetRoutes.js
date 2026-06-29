import express from 'express'
import { getBudgets, upsertBudget, deleteBudget } from '../controllers/budgetController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getBudgets)
router.post('/', upsertBudget)
router.delete('/:id', deleteBudget)

export default router