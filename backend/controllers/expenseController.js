import Expense from "../models/Expense.js"
import { detectAnomalies } from '../utils/anomalyDetection.js'
import { generateAIReport } from '../utils/generateReport.js'
import {z} from 'zod'

const expenseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.enum(['Food Delivery', 'Groceries', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities','Stationary', 'Other']),
    amount: z.number().positive('Amount must be positive'),
    date: z.string().optional()
})

export const getExpenses = async (req, res) => {
  try {
    const { month, year } = req.query
    let filter = { userId: req.user.userId }
    if (month && year) {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 1)
      filter.date = { $gte: start, $lt: end }
    }
    const expenses = await Expense.find(filter).sort({ date: -1 })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createExpense = async (req, res) => {
  try {
    const data = expenseSchema.parse({
      ...req.body,
      amount: Number(req.body.amount)
    })
    const expense = await Expense.create({ ...data, userId: req.user.userId })
    res.status(201).json(expense)
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ message: err.errors[0].message })
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    if (expense.userId.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' })
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    if (expense.userId.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' })
    await Expense.findByIdAndDelete(req.params.id)
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query
    const m = month || new Date().getMonth() + 1
    const y = year || new Date().getFullYear()
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: start, $lt: end }
    })

    const total = expenses.reduce((a, e) => a + e.amount, 0)

    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    const dailyTotals = expenses.reduce((acc, e) => {
      const day = new Date(e.date).getDate()
      acc[day] = (acc[day] || 0) + e.amount
      return acc
    }, {})

    const anomalies = detectAnomalies(expenses, categoryTotals, dailyTotals, total)

    res.json({
      total,
      categoryTotals,
      dailyTotals,
      anomalies,
      totalTransactions: expenses.length
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getAIReport = async (req, res) => {
  try {
    const { month, year } = req.query
    const m = month || new Date().getMonth() + 1
    const y = year || new Date().getFullYear()
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: start, $lt: end }
    })

    const total = expenses.reduce((a, e) => a + e.amount, 0)

    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    const dailyTotals = expenses.reduce((acc, e) => {
      const day = new Date(e.date).getDate()
      acc[day] = (acc[day] || 0) + e.amount
      return acc
    }, {})

    const insights = await generateAIReport({
      categoryTotals,
      dailyTotals,
      total,
      totalTransactions: expenses.length
    })

    res.json({ insights })
  } catch (err) {
    res.status(500).json({ message: 'AI report failed' })
  }
}