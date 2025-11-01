import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import api from '../api/client'
import toast from 'react-hot-toast'
import { ArrowLeft, Server, Cpu, HardDrive, Zap, Network, Users, FileText, Save } from 'lucide-react'
import type { AxiosResponse } from 'axios'

export default function VPSCreatePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    cpu_cores: 1,
    ram_gb: 1,
    storage_gb: 10,
    os_image_id: '',
    network_type: 'public_ipv4',
    owner_id: '',
    start_on_create: false,
    auto_backups: false,
    cloud_init_data: '',
  })

  const { data: images, isLoading: imagesLoading } = useQuery('images', () => api.get('/images').then((res: AxiosResponse) => res.data))
  const { data: users, isLoading: usersLoading } = useQuery('users', () => api.get('/users').then((res: AxiosResponse) => res.data))

  const createMutation = useMutation((data: any) => api.post('/vps', data), {
    onSuccess: () => {
      toast.success('VPS created successfully!', { icon: '✅' })
      navigate('/vps')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create VPS')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      os_image_id: parseInt(formData.os_image_id as any),
      owner_id: parseInt(formData.owner_id as any),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/vps')}
          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gradient animate-fade-in-down">Create VPS</h1>
          <p className="text-slate-600 mt-1 animate-fade-in-up">Configure and deploy a new virtual private server</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Server className="w-6 h-6 mr-2 text-primary-600" />
            Basic Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">VPS Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Enter a unique name for your VPS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Cpu className="w-6 h-6 mr-2 text-primary-600" />
            Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-primary-600" />
                CPU Cores
              </label>
              <input
                type="number"
                min="1"
                required
                className="input text-center text-lg font-bold"
                value={formData.cpu_cores}
                onChange={(e) => setFormData({ ...formData, cpu_cores: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-purple-600" />
                RAM (GB)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                required
                className="input text-center text-lg font-bold"
                value={formData.ram_gb}
                onChange={(e) => setFormData({ ...formData, ram_gb: parseFloat(e.target.value) || 1 })}
              />
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-emerald-600" />
                Storage (GB)
              </label>
              <input
                type="number"
                min="1"
                required
                className="input text-center text-lg font-bold"
                value={formData.storage_gb}
                onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
        </div>

        {/* OS Image & Networking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              OS Image
            </h2>
            <select
              required
              className="input"
              value={formData.os_image_id}
              onChange={(e) => setFormData({ ...formData, os_image_id: e.target.value })}
              disabled={imagesLoading}
            >
              <option value="">Select OS Image</option>
              {images?.map((img: any) => (
                <option key={img.id} value={img.id}>
                  {img.name} ({img.os_family})
                </option>
              ))}
            </select>
            {imagesLoading && <p className="text-sm text-slate-500 mt-2">Loading images...</p>}
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <Network className="w-5 h-5 mr-2 text-primary-600" />
              Network Type
            </h2>
            <select
              className="input"
              value={formData.network_type}
              onChange={(e) => setFormData({ ...formData, network_type: e.target.value })}
            >
              <option value="public_ipv4">Public IPv4</option>
              <option value="private_only">Private Only</option>
            </select>
          </div>
        </div>

        {/* User Assignment */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            Assign to User
          </h2>
          <select
            required
            className="input"
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            disabled={usersLoading}
          >
            <option value="">Select User</option>
            {users?.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.username})
              </option>
            ))}
          </select>
          {usersLoading && <p className="text-sm text-slate-500 mt-2">Loading users...</p>}
        </div>

        {/* Options */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Options</h2>
          <div className="space-y-4">
            <label className="flex items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg transition-all duration-300">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                checked={formData.start_on_create}
                onChange={(e) => setFormData({ ...formData, start_on_create: e.target.checked })}
              />
              <span className="ml-3 text-sm font-medium text-slate-700">Start on create</span>
            </label>
            <label className="flex items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg transition-all duration-300">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-2"
                checked={formData.auto_backups}
                onChange={(e) => setFormData({ ...formData, auto_backups: e.target.checked })}
              />
              <span className="ml-3 text-sm font-medium text-slate-700">Enable auto-backups</span>
            </label>
          </div>
        </div>

        {/* Cloud-init */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Cloud-init / User Data (Optional)
          </h2>
          <textarea
            rows={8}
            className="input font-mono text-sm"
            value={formData.cloud_init_data}
            onChange={(e) => setFormData({ ...formData, cloud_init_data: e.target.value })}
            placeholder="#cloud-config&#10;users:&#10;  - name: admin&#10;    ssh_authorized_keys:&#10;      - ssh-rsa AAAA..."
          />
          <p className="text-xs text-slate-500 mt-2">Enter cloud-init configuration in YAML format</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <button
            type="button"
            onClick={() => navigate('/vps')}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isLoading || !formData.name || !formData.os_image_id || !formData.owner_id}
            className="btn btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create VPS
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
