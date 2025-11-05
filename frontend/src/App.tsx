import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VPSListPage from './pages/VPSListPage'
import VPSDetailPage from './pages/VPSDetailPage'
import VPSCreatePage from './pages/VPSCreatePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminHostsPage from './pages/admin/AdminHostsPage'
import AdminImagesPage from './pages/admin/AdminImagesPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="vps" element={<VPSListPage />} />
        <Route path="vps/create" element={<VPSCreatePage />} />
        <Route path="vps/:id" element={<VPSDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        <Route
          path="admin"
          element={
            <AdminRoute>
              <Outlet />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="hosts" element={<AdminHostsPage />} />
          <Route path="images" element={<AdminImagesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App

