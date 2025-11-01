import { useQuery } from 'react-query'
import api from '../api/client'
import { Server, Activity, Cpu, HardDrive, Zap, Network } from 'lucide-react'

export default function AdminHostsPage() {
  const { data: hosts, isLoading } = useQuery('hosts', () =>
    api.get('/hosts').then(res => res.data)
  )

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
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2 animate-fade-in-down">Hosts</h1>
        <p className="text-slate-600 animate-fade-in-up">Manage and monitor your server hosts</p>
      </div>

      {/* Hosts Grid */}
      {hosts && hosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hosts.map((host: any, index: number) => (
            <div 
              key={host.id} 
              className="card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Host Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    host.status === 'online' 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse' 
                      : host.status === 'offline'
                      ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                      : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  }`}>
                    <Server className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{host.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{host.fqdn || host.ip_address}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  host.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                  host.status === 'offline' ? 'bg-slate-400' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-full ${
                  host.status === 'online' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : host.status === 'offline'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {host.status}
                </span>
              </div>

              {/* Resource Usage */}
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-primary-600" />
                      <span className="text-xs font-medium text-slate-700">CPU</span>
                    </div>
                    <span className="text-sm font-bold text-primary-700">
                      {host.used_cpu_cores} / {host.total_cpu_cores}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                      style={{ width: `${(host.used_cpu_cores / host.total_cpu_cores) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-slate-700">RAM</span>
                    </div>
                    <span className="text-sm font-bold text-purple-700">
                      {host.used_ram_gb.toFixed(1)} / {host.total_ram_gb} GB
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(host.used_ram_gb / host.total_ram_gb) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-slate-700">Storage</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      {host.used_storage_gb.toFixed(1)} / {host.total_storage_gb} GB
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: `${(host.used_storage_gb / host.total_storage_gb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Server className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Hosts Found</h3>
          <p className="text-slate-600">Add your first host to get started</p>
        </div>
      )}
    </div>
  )
}
