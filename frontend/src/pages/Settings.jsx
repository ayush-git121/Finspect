import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import { getBudgets, upsertBudget, deleteBudget } from '../api/budgets.js'
import { getMe } from '../api/auth.js'
import { useAuthStore } from '../store/authStore.js'
import { fmt } from '../utils/formatCurrency.js'
import toast from 'react-hot-toast'

const CARD = { backgroundColor: '#161B22', border: '1px solid #30363D' }

const CATEGORIES = ['Food Delivery', 'Groceries', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Stationary', 'Other']

const CAT_COLORS = {
  'Food Delivery': '#6C63FF',
  'Groceries': '#4ECDC4',
  'Transport': '#378ADD',
  'Entertainment': '#D4537E',
  'Shopping': '#D85A30',
  'Health': '#BA7517',
  'Utilities': '#888780',
  'Stationary': '#F59E0B',
  'Other': '#B4B2A9'
}

export default function Settings() {
  const { user, setUser, logout } = useAuthStore()
  const [budgets, setBudgets] = useState([])
  const [budgetForm, setBudgetForm] = useState({ category: 'Food Delivery', limitAmount: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets()
      setBudgets(res.data)
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBudgets() }, [])

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    if (!budgetForm.limitAmount) return toast.error('Enter a limit amount')
    setSaving(true)
    try {
      await upsertBudget({
        category: budgetForm.category,
        limitAmount: Number(budgetForm.limitAmount)
      })
      toast.success('Budget saved!')
      setBudgetForm({ category: 'Food Delivery', limitAmount: '' })
      fetchBudgets()
    } catch (err) {
      toast.error('Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBudget = async (id) => {
    try {
      await deleteBudget(id)
      toast.success('Budget removed!')
      fetchBudgets()
    } catch (err) {
      toast.error('Failed to delete budget')
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#0D1117'}}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm mb-8">Manage your budgets and profile</p>

        {/* Profile Card */}
        <div className="rounded-xl p-6 mb-6" style={CARD}>
          <p className="text-sm font-semibold text-gray-300 mb-4">👤 Profile</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{backgroundColor: '#6C63FF'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-xs text-gray-600 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Budget Limits */}
        <div className="rounded-xl p-6 mb-6" style={CARD}>
          <p className="text-sm font-semibold text-gray-300 mb-4">💰 Budget Limits</p>
          <p className="text-xs text-gray-500 mb-4">Set monthly spending limits per category. You'll see warnings on dashboard when exceeded.</p>

          {/* Add Budget Form */}
          <form onSubmit={handleSaveBudget} className="flex flex-col sm:flex-row gap-3 mb-6">
            <select
              value={budgetForm.category}
              onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{backgroundColor: '#0D1117'}}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="number"
              placeholder="Monthly limit ₹"
              value={budgetForm.limitAmount}
              onChange={e => setBudgetForm({...budgetForm, limitAmount: e.target.value})}
              className="w-full sm:w-40 rounded-lg px-3 py-2 text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{backgroundColor: '#0D1117'}}
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </form>

          {/* Budget List */}
          {loading ? (
            <p className="text-gray-500 text-sm">Loading budgets...</p>
          ) : budgets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {budgets.map((b) => (
                <div key={b._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-800" style={{backgroundColor: '#0D1117'}}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: CAT_COLORS[b.category] || '#888'}}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{b.category}</p>
                    <p className="text-xs text-gray-500">Monthly limit: {fmt(b.limitAmount)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(b._id)}
                    className="text-gray-600 hover:text-red-400 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No budget limits set yet.</p>
          )}
        </div>

        {/* App Info */}
        <div className="rounded-xl p-6 mb-6" style={CARD}>
          <p className="text-sm font-semibold text-gray-300 mb-4">ℹ️ App Info</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'App', value: 'Finspect v1.0' },
              { label: 'AI Engine', value: 'Groq — LLaMA 3' },
              { label: 'Stack', value: 'React + Node.js + MongoDB' },
              { label: 'Auth', value: 'JWT — httpOnly secure' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className="text-sm text-white font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl p-6 border border-red-900" style={{backgroundColor: '#1a0a0a'}}>
          <p className="text-sm font-semibold text-red-400 mb-2">⚠️ Danger Zone</p>
          <p className="text-xs text-gray-500 mb-4">This will log you out of your account immediately.</p>
          <button
            onClick={() => {
              logout()
              window.location.href = '/'
            }}
            className="bg-red-800 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Logout from Finspect
          </button>
        </div>

      </div>
    </div>
  )
}