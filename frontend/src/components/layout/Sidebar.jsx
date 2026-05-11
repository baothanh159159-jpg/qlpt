import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../../services/api'
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  FileText, 
  History, 
  Receipt, 
  QrCode, 
  Search, 
  LogOut,
  ShieldCheck,
  UserCircle,
  AlertCircle
} from 'lucide-react'

const Sidebar = ({ role, logout }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);

  useEffect(() => {
    const fetchBankInfo = () => {
      if (role === 'Landlord') {
        api.get('/Account/Me')
          .then(res => setBankInfo(res.data))
          .catch(err => console.error("Could not fetch bank info", err));
      }
    };

    fetchBankInfo();
    window.addEventListener('bankInfoUpdated', fetchBankInfo);
    return () => window.removeEventListener('bankInfoUpdated', fetchBankInfo);
  }, [role]);

  const adminLinks = [
    { name: 'Quản trị hệ thống', icon: ShieldCheck, path: '/admin' },
    { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin-dash' },
  ]

  const landlordLinks = [
    { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/landlord' },
    { name: 'Quản lý phòng', icon: Home, path: '/rooms' },
    { name: 'Khách thuê', icon: Users, path: '/tenants' },
    { name: 'Hợp đồng', icon: FileText, path: '/contracts' },
    { name: 'Lịch sử phiếu thu', icon: History, path: '/history' },
    { name: 'Hóa đơn xuất', icon: Receipt, path: '/invoices' },
  ]

  const tenantLinks = [
    { name: 'Tìm phòng thuê', icon: Search, path: '/search' },
    { name: 'Hóa đơn của tôi', icon: FileText, path: '/tenant' },
  ]

  const getLinks = () => {
    if (role === 'Admin') return adminLinks;
    if (role === 'Landlord') return landlordLinks;
    return tenantLinks;
  }

  const getUserInfo = () => {
    if (role === 'Admin') return { name: 'Admin', role: 'Quản Trị Viên' };
    const user = JSON.parse(localStorage.getItem('user'));
    return { name: user?.email || 'User', role: role === 'Landlord' ? 'Chủ Nhà' : 'Khách Thuê' };
  }

  const userInfo = getUserInfo();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <LayoutDashboard size={28} />
        <span>QLPT Pro</span>
      </div>

      <div className="user-profile">
        <div className="avatar">
          {userInfo.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{userInfo.name}</div>
          <div className="role">{userInfo.role}</div>
        </div>
      </div>

      <nav className="nav-group">
        {getLinks().map((link) => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {role === 'Landlord' && (
          <button className="nav-item w-full mb-4" style={{ border: '1px solid var(--border)' }} onClick={() => setShowQRModal(true)}>
            <QrCode size={20} />
            <span>Xem mã VietQR</span>
          </button>
        )}

        <button className="nav-item w-full" style={{ color: 'var(--danger)' }} onClick={logout}>
          <LogOut size={20} />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowQRModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff5f7', textAlign: 'center', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            {bankInfo?.bankCode && bankInfo?.bankAccountNumber ? (
              <>
                <h3 style={{ textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '1px', fontSize: '1.1rem' }}>
                  {bankInfo.bankAccountName || 'Tên Chủ Tài Khoản'}
                </h3>
                <p className="text-muted mb-6">******{bankInfo.bankAccountNumber.slice(-3)}</p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <img 
                    src={`https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.bankAccountNumber}-compact2.png?accountName=${encodeURIComponent(bankInfo.bankAccountName || '')}`} 
                    alt="VietQR" 
                    style={{ width: '250px', height: '250px', objectFit: 'contain' }}
                  />
                </div>
                <p className="text-sm mt-6 text-muted">Mã QR dùng để nhận thanh toán tiền phòng</p>
              </>
            ) : (
              <div className="py-8">
                <AlertCircle size={48} className="mx-auto mb-4 text-warning" />
                <h3>Chưa cấu hình VietQR</h3>
                <p className="text-muted mt-2">Vui lòng vào phần Bảng Điều Khiển để cấu hình thông tin Ngân hàng của bạn.</p>
              </div>
            )}
            <button className="btn btn-outline w-full mt-4" onClick={() => setShowQRModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
