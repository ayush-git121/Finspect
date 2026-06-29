import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth.js'
import { useAuthStore } from '../store/authStore.js'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginUser(form)
      setUser(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: '#0D1117'}}>
      <div className="w-full max-w-md rounded-2xl p-8 border border-gray-700" style={{backgroundColor: '#161B22'}}>
        
        {/* Logo */}
        <div className="flex items-center -ml-9 mb-8">
          <img src={logo} alt="Finspect" className="h-12 w-auto" />
          <div className="flex flex-col -ml-7">
            <span className="font-bold text-xl leading-tight" style={{color: '#4ECDC4'}}>
              Fin<span style={{color: '#6C63FF'}}>spect</span>
            </span>
            <span className="text-xs tracking-widest font-semibold pb-1 border-b border-purple-400" style={{color: '#7B6FD4'}}>
              INSPECT YOUR FINANCES
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              style={{backgroundColor: '#0D1117'}}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              style={{backgroundColor: '#0D1117'}}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{color: '#4ECDC4'}}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}