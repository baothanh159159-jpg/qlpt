import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import { 
  Users, UserCheck, Clock, Ban, Search, RefreshCw, 
  Check, X, Shield, Lock, Unlock, Key, AlertCircle, Edit2
} from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, landlords: 0, tenants: 0, banned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/Admin/GetAllUsers?query=${search}`),
        api.get('/Admin/Stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleAction = async (action, userId, extraData = null) => {
    try {
      let res;
      if (action === 'approve') res = await api.put(`/Admin/ApproveUser/${userId}`);
      else if (action === 'reject') res = await api.put(`/Admin/RejectUser/${userId}`);
      else if (action === 'toggleBan') res = await api.put(`/Admin/ToggleBan/${userId}`);
      else if (action === 'reset') res = await api.put(`/Admin/ResetPassword/${userId}`);
      else if (action === 'changeRole') res = await api.put(`/Admin/ChangeRole/${userId}`, { role: extraData });
      
      setMessage({ type: 'success', text: res.data.message });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thao tác thất bại' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return u.approvalStatus === 'Pending';
    if (filter === 'Banned') return !u.isActive;
    if (filter === 'Landlord') return u.role === 'Landlord';
    if (filter === 'Tenant') return u.role === 'Tenant';
    return true;
  });

  return (
    <div className="page-container">
      <div className="stats-grid">
        <StatCard label="Tổng TK" value={stats.total} icon={Users} color="#4F46E5" />
        <StatCard label="Chủ Trọ" value={stats.landlords} icon={Shield} color="#3B82F6" />
        <StatCard label="Khách Thuê" value={stats.tenants} icon={UserCheck} color="#10B981" />
        <StatCard label="Chờ Duyệt" value={stats.pending} icon={Clock} color="#F59E0B" />
        <StatCard label="Bị Khóa" value={stats.banned} icon={Ban} color="#EF4444" />
      </div>

      <div className="card mb-6">
        {message && (
          <div className={`badge mb-4 w-full`} style={{ 
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <AlertCircle size={18} />
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="flex items-center gap-2 p-2 border rounded-lg w-full bg-white">
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Tìm theo email tài khoản..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchData}>
            <RefreshCw size={16} /> Làm Mới
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['All', 'Pending', 'Banned', 'Landlord', 'Tenant'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`badge ${filter === f ? 'badge-active' : 'badge-landlord'}`} 
              style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: 'none', opacity: filter === f ? 1 : 0.6 }}
            >
              {f === 'All' ? 'Tất cả' : f === 'Pending' ? 'Chờ Duyệt' : f === 'Banned' ? 'Bị Khóa' : f === 'Landlord' ? 'Chủ Trọ' : 'Khách Thuê'}
            </button>
          ))}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Email / Username</th>
                <th>Vai Trò</th>
                <th>Duyệt</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu thực tế...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Không tìm thấy người dùng nào.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{user.email}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                      {user.role !== 'Admin' && (
                        <button 
                          className="p-1 hover:bg-gray-100 rounded text-muted"
                          onClick={() => {
                            const newRole = user.role === 'Landlord' ? 'Tenant' : 'Landlord';
                            if (window.confirm(`Đổi vai trò người dùng này sang ${newRole}?`)) {
                              handleAction('changeRole', user.id, newRole);
                            }
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.approvalStatus === 'Approved' ? 'badge-active' : user.approvalStatus === 'Rejected' ? 'badge-locked' : 'badge-pending'}`}>
                      {user.approvalStatus === 'Approved' ? 'Đã Duyệt' : user.approvalStatus === 'Rejected' ? 'Từ Chối' : 'Chờ Duyệt'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-active' : 'badge-locked'}`}>
                      {user.isActive ? '✓ Hoạt động' : '✗ Bị Khóa'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="flex gap-1">
                      {user.approvalStatus === 'Pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#10b981' }} onClick={() => handleAction('approve', user.id)}>
                            <Check size={14} /> Duyệt
                          </button>
                          <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#ef4444' }} onClick={() => handleAction('reject', user.id)}>
                            <X size={14} /> Từ Chối
                          </button>
                        </>
                      )}
                      
                      {user.role !== 'Admin' && (
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ backgroundColor: user.isActive ? '#ef4444' : '#10b981' }}
                          onClick={() => handleAction('toggleBan', user.id)}
                        >
                          {user.isActive ? <Lock size={14} /> : <Unlock size={14} />} {user.isActive ? 'Khóa' : 'Mở'}
                        </button>
                      )}

                      <button className="btn btn-outline btn-sm" style={{ backgroundColor: '#64748b', color: 'white' }} onClick={() => handleAction('reset', user.id)}>
                        <Key size={14} /> Reset MK
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
