import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Server, Activity, AlertCircle, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import type { VPS, User } from '../types'

export default function DashboardPage() {
  const { data: vpses, isLoading } = useQuery<VPS[]>('vps', () => api.get('/vps').then((res) => res.data))
  const { data: user } = useQuery<User>('user', () => api.get('/auth/me').then((res) => res.data))

  const running = vpses?.filter((v) => v.status === 'running').length || 0
  const stopped = vpses?.filter((v) => v.status === 'stopped').length || 0
  const total = vpses?.length || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2 animate-fade-in-down">Dashboard</h1>
          <p className="text-slate-600 animate-fade-in-up">
            Welcome back, <span className="font-semibold text-primary-600">{user?.username || 'User'}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total VPS</p>
              <p className="text-3xl font-bold text-slate-900">{total}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
              <Server className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-primary-500 mr-1" />
            <span className="text-slate-600">All instances</span>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Running</p>
              <p className="text-3xl font-bold text-emerald-600">{running}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-float" style={{ animationDelay: '0.2s' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Zap className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-slate-600">Active now</span>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Stopped</p>
              <p className="text-3xl font-bold text-slate-600">{stopped}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30 animate-float" style={{ animationDelay: '0.4s' }}>
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 text-slate-500 mr-1" />
            <span className="text-slate-600">Inactive</span>
          </div>
        </div>
      </div>

      {/* Recent VPS Instances */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent VPS Instances</h2>
          <Link 
            to="/vps" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm group"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {vpses && vpses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Specifications</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {vpses.slice(0, 5).map((vps, index: number) => (
                  <tr 
                    key={vps.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                          <Server className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{vps.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vps.status === 'running' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : vps.status === 'stopped' 
                          ? 'bg-slate-100 text-slate-800 border border-slate-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {vps.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                          {vps.cpu_cores}C
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          {vps.ram_gb}GB
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                          {vps.storage_gb}GB
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(vps.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No VPS instances yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first VPS instance.</p>
            <Link to="/vps/create" className="btn btn-primary inline-flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Create VPS
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
