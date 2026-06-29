import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Food Delivery', 'Groceries', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Stationary', 'Other'],
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Expense', expenseSchema)