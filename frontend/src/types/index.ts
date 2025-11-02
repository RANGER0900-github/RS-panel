// API Response Types

export interface User {
  id: number
  uuid?: string
  email: string
  username: string
  full_name?: string | null
  role: 'admin' | 'user' | 'support' | 'billing' | string
  is_active?: boolean
  is_2fa_enabled: boolean
  created_at?: string
  last_login?: string | null
}

export interface VPS {
  id: number
  uuid: string
  name: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | string
  cpu_cores: number
  ram_gb: number
  storage_gb: number
  public_ipv4?: string | null
  private_ip?: string | null
  network_type: 'public_ipv4' | 'private_only' | string
  owner_id: number
  host_id?: number | null
  os_image_id?: number
  expires_at?: string | null
  expiration_action?: string
  auto_backups?: boolean
  stats_cache?: Record<string, unknown> | null
  created_at: string
  updated_at?: string
}

export interface Image {
  id: number
  name: string
  description?: string | null
  os_family: string
  os_version?: string | null
  file_size_gb: number
  file_format: string
  is_public?: boolean
  is_active: boolean
  created_at?: string
}

export interface Host {
  id: number
  uuid?: string
  name: string
  fqdn?: string | null
  ip_address?: string
  status: 'online' | 'offline' | 'unknown' | string
  total_cpu_cores: number
  used_cpu_cores?: number
  total_ram_gb: number
  used_ram_gb?: number
  total_storage_gb: number
  used_storage_gb?: number
  last_seen?: string | null
  stats_cache?: Record<string, unknown> | null
}

export interface AdminDashboardStats {
  users?: {
    total: number
    active: number
  }
  vpses?: {
    total: number
    running: number
  }
  hosts?: {
    total: number
    online: number
  }
}

// Alias for DashboardStats (used in AdminDashboardPage)
export type DashboardStats = AdminDashboardStats

export interface HostStats {
  resources?: {
    cpu?: {
      usage_percent?: number
      used: number
      total: number
    }
    ram?: {
      usage_percent?: number
      used_gb?: number
      total_gb: number
    }
    storage?: {
      usage_percent?: number
      used_gb?: number
      total_gb: number
    }
  }
}

export interface VPSCreateData {
  name: string
  cpu_cores: number
  ram_gb: number
  storage_gb: number
  os_image_id: number
  network_type: 'public_ipv4' | 'private_only'
  owner_id: number
  start_on_create?: boolean
  auto_backups?: boolean
  cloud_init_data?: string
}

export interface AxiosErrorResponse {
  response?: {
    status?: number
    data?: {
      detail?: string
    }
  }
}
