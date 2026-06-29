import Budget from '../models/Budget.js'
import { z } from 'zod'

const budgetSchema = z.object({
  category: z.string().min(1),
  limitAmount: z.number().positive()
})

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.userId })
    res.json(budgets)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const upsertBudget = async (req, res) => {
  try {
    const data = budgetSchema.parse({
      ...req.body,
      limitAmount: Number(req.body.limitAmount)
    })
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.userId, category: data.category },
      { ...data, userId: req.user.userId },
      { upsert: true, new: true }
    )
    res.json(budget)
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ message: err.errors[0].message })
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.userId })
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}