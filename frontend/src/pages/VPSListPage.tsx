import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Plus, Server, Cpu, HardDrive, Zap, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function VPSListPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const { data: vpses, isLoading } = useQuery('vps', () => api.get('/vps').then(res => res.data))

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
          <h1 className="text-4xl font-bold text-gradient mb-2 animate-fade-in-down">VPS Instances</h1>
          <p className="text-slate-600 animate-fade-in-up">Manage and monitor your virtual private servers</p>
        </div>
        {isAdmin && (
          <Link 
            to="/vps/create" 
            className="btn btn-primary inline-flex items-center animate-fade-in-up hover-lift"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create VPS
          </Link>
        )}
      </div>

      {/* VPS Grid */}
      {vpses && vpses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vpses.map((vps: any, index: number) => (
            <Link
              key={vps.id}
              to={`/vps/${vps.id}`}
              className="card hover-lift animate-fade-in-up group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Server className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {vps.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{vps.uuid?.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  vps.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  vps.status === 'stopped' ? 'bg-slate-400' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-full ${
                  vps.status === 'running' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : vps.status === 'stopped' 
                    ? 'bg-slate-100 text-slate-800 border border-slate-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {vps.status}
                </span>
              </div>

              {/* Specifications */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-slate-600">CPU Cores</span>
                  </div>
                  <span className="text-sm font-bold text-primary-700">{vps.cpu_cores}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">RAM</span>
                  </div>
                  <span className="text-sm font-bold text-purple-700">{vps.ram_gb} GB</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-600">Storage</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{vps.storage_gb} GB</span>
                </div>
              </div>

              {/* IP Address */}
              {vps.public_ipv4 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Public IP</span>
                    <span className="text-xs font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {vps.public_ipv4}
                    </span>
                  </div>
                </div>
              )}

              {/* View Arrow */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-600">View Details</span>
                <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Server className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No VPS Instances</h3>
          <p className="text-slate-600 mb-8">Get started by creating your first VPS instance.</p>
          {isAdmin && (
            <Link to="/vps/create" className="btn btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First VPS
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
