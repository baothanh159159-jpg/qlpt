import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, Search, RefreshCw, Check, X, 
  Shield, Lock, Unlock, Key, AlertCircle, Trash2 
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/Admin/GetAllUsers?query=${search}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action, userId) => {
    try {
      let res;
      if (action === 'approve') res = await api.put(`/Admin/ApproveUser/${userId}`);
      else if (action === 'reject') res = await api.put(`/Admin/RejectUser/${userId}`);
      else if (action === 'toggleBan') res = await api.put(`/Admin/ToggleBan/${userId}`);
      else if (action === 'reset') res = await api.put(`/Admin/ResetPassword/${userId}`);
      
      setMessage({ type: 'success', text: res.data.message });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thao tác thất bại' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản trị hệ thống</h2>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 p-2 border rounded-lg bg-white w-64">
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Tìm email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none outline-none text-sm"
              />
            </div>
            <button className="btn btn-primary" onClick={fetchUsers}>
              <RefreshCw size={16} />
              Làm mới
            </button>
        </div>
      </div>

      {message && (
        <div className={`badge mb-4 w-full`} style={{ 
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Vai Trò</th>
              <th>Phê duyệt</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.approvalStatus === 'Approved' ? 'badge-active' : user.approvalStatus === 'Rejected' ? 'badge-locked' : 'badge-pending'}`}>
                    {user.approvalStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-active' : 'badge-locked'}`}>
                    {user.isActive ? 'Hoạt động' : 'Bị Khóa'}
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
                          <X size={14} /> Từ chối
                        </button>
                      </>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => handleAction('toggleBan', user.id)}>
                      {user.isActive ? <Lock size={14} /> : <Unlock size={14} />} {user.isActive ? 'Khóa' : 'Mở'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleAction('reset', user.id)}>
                      <Key size={14} /> Pass
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
