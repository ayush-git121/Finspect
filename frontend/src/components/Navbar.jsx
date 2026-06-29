import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/')
  }

  const isActive = (path) =>
    location.pathname === path

  const linkClass = (path) =>
    `text-sm font-medium ${isActive(path) ? 'text-[#4ECDC4]' : 'text-gray-400 hover:text-white'}`

  return (
    <nav className="border-b border-gray-800 px-4 md:px-8 py-4" style={{backgroundColor: '#161B22'}}>
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-1">
          <img src={logo} alt="Finspect" className="h-10 md:h-12 w-auto" />
          <div className="flex flex-col -ml-6">
            <span className="font-bold text-lg md:text-xl leading-tight" style={{color: '#4ECDC4'}}>
              Fin<span style={{color: '#6C63FF'}}>spect</span>
            </span>
            <span className="text-xs tracking-widest font-semibold pb-1 border-b border-purple-400" style={{color: '#7B6FD4'}}>
              INSPECT YOUR FINANCES
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/report" className={linkClass('/report')}>Report</Link>
          <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-gray-400">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400"
            style={{backgroundColor: '#0D1117'}}
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white text-2xl focus:outline-none"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-1 border-t border-gray-800 pt-4">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/dashboard') ? 'text-[#4ECDC4] bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/report"
            onClick={() => setMenuOpen(false)}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/report') ? 'text-[#4ECDC4] bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            📋 Report
          </Link>
          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/settings') ? 'text-[#4ECDC4] bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            ⚙️ Settings
          </Link>
          <div className="flex items-center justify-between px-3 py-2.5 mt-1 border-t border-gray-800">
            <span className="text-sm text-gray-400">Hi, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg text-gray-300 border border-gray-600"
              style={{backgroundColor: '#0D1117'}}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}