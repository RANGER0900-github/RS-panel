import { useQuery } from 'react-query'
import api from '../../api/client'
import { Users, Server, Activity, TrendingUp, Cpu, HardDrive, Zap } from 'lucide-react'
import type { DashboardStats, HostStats } from '../../types'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>('admin-dashboard', () =>
    api.get('/admin/dashboard').then((res) => res.data)
  )
  const { data: hostStats, isLoading: hostStatsLoading } = useQuery<HostStats>('host-stats', () =>
    api.get('/hosts/stats').then((res) => res.data)
  )

  if (statsLoading || hostStatsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2 animate-fade-in-down">Admin Dashboard</h1>
        <p className="text-slate-600 animate-fade-in-up">System overview and resource statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.users?.total || 0}</p>
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                {stats?.users?.active || 0} active
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total VPS</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.vpses?.total || 0}</p>
              <p className="text-sm text-primary-600 mt-2 font-medium">
                {stats?.vpses?.running || 0} running
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-float" style={{ animationDelay: '0.2s' }}>
              <Server className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Hosts</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.hosts?.total || 0}</p>
              <p className="text-sm text-emerald-600 mt-2 font-medium">
                {stats?.hosts?.online || 0} online
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float" style={{ animationDelay: '0.4s' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      {hostStats && (
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
            Resource Usage
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-slate-700">CPU</span>
                </div>
                <span className="text-xl font-bold text-primary-700">
                  {hostStats.resources?.cpu?.usage_percent?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${hostStats.resources?.cpu?.usage_percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>{hostStats.resources?.cpu?.used || 0} / {hostStats.resources?.cpu?.total || 0} cores</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">RAM</span>
                </div>
                <span className="text-xl font-bold text-purple-700">
                  {hostStats.resources?.ram?.usage_percent?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${hostStats.resources?.ram?.usage_percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>{hostStats.resources?.ram?.used_gb?.toFixed(1) || 0} / {hostStats.resources?.ram?.total_gb || 0} GB</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Storage</span>
                </div>
                <span className="text-xl font-bold text-emerald-700">
                  {hostStats.resources?.storage?.usage_percent?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${hostStats.resources?.storage?.usage_percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>{hostStats.resources?.storage?.used_gb?.toFixed(1) || 0} / {hostStats.resources?.storage?.total_gb || 0} GB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
