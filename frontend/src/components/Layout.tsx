import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, Server, Home, Zap } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-xl font-bold text-gradient hover:scale-105 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                  MS VPS Panel
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                <Link 
                  to="/dashboard" 
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/dashboard') 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-primary-600'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/vps" 
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/vps') || location.pathname.startsWith('/vps')
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-primary-600'
                  }`}
                >
                  <Server className="w-4 h-4 mr-2" />
                  VPS
                </Link>
                {isAdmin && (
                  <>
                    <Link 
                      to="/admin/dashboard" 
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50' 
                          : 'text-slate-700 hover:bg-slate-100 hover:text-primary-600'
                      }`}
                    >
                      Admin
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-600 font-medium">{user?.username || 'User'}</span>
                  <span className="text-xs text-slate-500">{user?.role || 'user'}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
