import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Play, Square, RotateCw, ArrowLeft, Cpu, HardDrive, Zap, Network, Monitor } from 'lucide-react'
import type { AxiosResponse } from 'axios'
import type { VPS, AxiosErrorResponse } from '../types'

export default function VPSDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data: vps, isLoading } = useQuery<VPS>(['vps', id], () =>
    api.get(`/vps/${id}`).then((res: AxiosResponse<VPS>) => res.data)
  )

  const startMutation = useMutation(() => api.post(`/vps/${id}/start`), {
    onSuccess: () => {
      toast.success('VPS started successfully', { icon: '✅' })
      queryClient.invalidateQueries(['vps', id])
      queryClient.invalidateQueries('vps')
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosErrorResponse
      toast.error(axiosError.response?.data?.detail || 'Failed to start VPS')
    },
  })

  const stopMutation = useMutation(() => api.post(`/vps/${id}/stop`), {
    onSuccess: () => {
      toast.success('VPS stopped successfully', { icon: '✅' })
      queryClient.invalidateQueries(['vps', id])
      queryClient.invalidateQueries('vps')
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosErrorResponse
      toast.error(axiosError.response?.data?.detail || 'Failed to stop VPS')
    },
  })

  const rebootMutation = useMutation(() => api.post(`/vps/${id}/reboot`), {
    onSuccess: () => {
      toast.success('VPS reboot initiated', { icon: '✅' })
      queryClient.invalidateQueries(['vps', id])
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosErrorResponse
      toast.error(axiosError.response?.data?.detail || 'Failed to reboot VPS')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!vps) {
    return (
      <div className="card text-center py-16">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">VPS Not Found</h3>
        <p className="text-slate-600 mb-6">The VPS you're looking for doesn't exist.</p>
        <Link to="/vps" className="btn btn-primary inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to VPS List
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/vps" 
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gradient animate-fade-in-down">{vps.name}</h1>
            <p className="text-sm text-slate-500 font-mono mt-1">UUID: {vps.uuid}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => startMutation.mutate()}
            disabled={vps.status === 'running' || startMutation.isLoading}
            className={`btn ${vps.status === 'running' || startMutation.isLoading ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-success'} inline-flex items-center`}
          >
            <Play className="w-4 h-4 mr-2" />
            {startMutation.isLoading ? 'Starting...' : 'Start'}
          </button>
          <button
            onClick={() => stopMutation.mutate()}
            disabled={vps.status === 'stopped' || stopMutation.isLoading}
            className={`btn ${vps.status === 'stopped' || stopMutation.isLoading ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-danger'} inline-flex items-center`}
          >
            <Square className="w-4 h-4 mr-2" />
            {stopMutation.isLoading ? 'Stopping...' : 'Stop'}
          </button>
          <button
            onClick={() => rebootMutation.mutate()}
            disabled={vps.status !== 'running' || rebootMutation.isLoading}
            className={`btn ${vps.status !== 'running' || rebootMutation.isLoading ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'} inline-flex items-center`}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {rebootMutation.isLoading ? 'Rebooting...' : 'Reboot'}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`card-gradient animate-fade-in-up ${
        vps.status === 'running' ? 'from-emerald-500 via-emerald-600 to-emerald-700' :
        vps.status === 'stopped' ? 'from-slate-500 via-slate-600 to-slate-700' :
        'from-yellow-500 via-yellow-600 to-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ${
              vps.status === 'running' ? 'animate-pulse' : ''
            }`}>
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Status</p>
              <p className="text-white text-2xl font-bold capitalize">{vps.status}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium">Instance ID</p>
            <p className="text-white text-lg font-mono font-semibold">{vps.id}</p>
          </div>
        </div>
      </div>

      {/* Specifications and Networking */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Specifications Card */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Cpu className="w-6 h-6 mr-2 text-primary-600" />
            Specifications
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">CPU Cores</span>
                </div>
                <span className="text-xl font-bold text-primary-700">{vps.cpu_cores}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">RAM</span>
                </div>
                <span className="text-xl font-bold text-purple-700">{vps.ram_gb} GB</span>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Storage</span>
                </div>
                <span className="text-xl font-bold text-emerald-700">{vps.storage_gb} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Networking Card */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Network className="w-6 h-6 mr-2 text-primary-600" />
            Networking
          </h2>
          <div className="space-y-4">
            {vps.public_ipv4 ? (
              <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100 hover:shadow-lg transition-all duration-300">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Public IPv4</span>
                </div>
                <p className="text-lg font-mono font-bold text-primary-700">{vps.public_ipv4}</p>
              </div>
            ) : null}
            
            {vps.private_ip ? (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Private IP</span>
                </div>
                <p className="text-lg font-mono font-bold text-slate-700">{vps.private_ip}</p>
              </div>
            ) : null}
            
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Network Type</span>
              </div>
              <p className="text-lg font-semibold text-indigo-700 capitalize">{vps.network_type?.replace(/_/g, ' ') || vps.network_type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Console Access for Private-Only VPS */}
      {vps.network_type === 'private_only' && (
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Console Access</h2>
          <p className="text-slate-600 mb-6">
            This VPS is configured as private-only. Use tmate to securely access the console.
          </p>
          <Link 
            to={`/vps/${id}/console`} 
            className="btn btn-primary inline-flex items-center"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Generate tmate Session
          </Link>
        </div>
      )}
    </div>
  )
}
