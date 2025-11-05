import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, Shield } from 'lucide-react'
import type { AxiosErrorResponse } from '../types'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', {
        email,
        password,
        totp_code: totpCode || undefined,
      })

      const { access_token, refresh_token } = response.data

      // Get user info
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      setAuth(access_token, refresh_token, userResponse.data)
      toast.success('Welcome back!', { icon: '🎉' })
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosErrorResponse
      toast.error(axiosError.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center animate-fade-in-down">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/50 animate-float">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gradient">
            MS VPS Panel
          </h2>
          <p className="mt-3 text-slate-600 text-lg">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 card" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2 text-primary-600" />
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2 text-primary-600" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* 2FA */}
            <div>
              <label htmlFor="totp" className="block text-sm font-semibold text-slate-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2 text-primary-600" />
                2FA Code (if enabled)
              </label>
              <input
                id="totp"
                name="totp"
                type="text"
                maxLength={6}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 animate-fade-in-up">
          Secure VPS Management Platform
        </p>
      </div>
    </div>
  )
}
