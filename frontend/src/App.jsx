import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import LandlordDashboard from './pages/LandlordDashboard'
import RoomManagement from './pages/RoomManagement'
import ContractManagement from './pages/ContractManagement'
import InvoiceManagement from './pages/InvoiceManagement'
import TenantDashboard from './pages/TenantDashboard'
import SearchRooms from './pages/SearchRooms'
import TenantInvoices from './pages/TenantInvoices'
import TenantManagement from './pages/TenantManagement'
import PaymentHistory from './pages/PaymentHistory'

// Components
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <Sidebar role={user?.role} logout={logout} />
      <div className="main-content">
        <Topbar role={user?.role} />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin-dash" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Landlord Routes */}
          <Route path="/landlord" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><LandlordDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><RoomManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/tenants" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><TenantManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><ContractManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><InvoiceManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['Landlord']}>
              <Layout><PaymentHistory /></Layout>
            </ProtectedRoute>
          } />

          {/* Tenant Routes */}
          <Route path="/tenant" element={
            <ProtectedRoute allowedRoles={['Tenant']}>
              <Layout><TenantInvoices /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['Tenant']}>
              <Layout><SearchRooms /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
