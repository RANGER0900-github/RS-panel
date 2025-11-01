import { useQuery } from 'react-query'
import api from '../api/client'
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery('user', () => api.get('/auth/me').then(res => res.data))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-600">Unable to load user information</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2 animate-fade-in-down">Profile</h1>
        <p className="text-slate-600 animate-fade-in-up">Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/30">
            <span className="text-4xl font-bold text-white">{user.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{user.full_name || user.username}</h2>
            <p className="text-slate-600 mt-1">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-5 h-5 text-primary-600" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{user.email}</p>
          </div>

          {/* Username */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Username</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{user.username}</p>
          </div>

          {/* Role */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Role</span>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
              user.role === 'admin' ? 'bg-primary-100 text-primary-800 border border-primary-200' :
              user.role === 'support' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
              user.role === 'billing' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              {user.role}
            </span>
          </div>

          {/* 2FA Status */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              {user.is_2fa_enabled ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">2FA</span>
            </div>
            <p className={`text-lg font-semibold ${
              user.is_2fa_enabled ? 'text-emerald-700' : 'text-slate-600'
            }`}>
              {user.is_2fa_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
