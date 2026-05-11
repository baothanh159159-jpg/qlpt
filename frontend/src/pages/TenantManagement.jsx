import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, RefreshCw, Mail, Phone, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TenantManagement = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Tenant/GetAll'); 
      setTenants(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Không thể tải danh sách khách thuê. Vui lòng kiểm tra quyền hạn!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t => 
    t.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    t.phoneNumber?.includes(search)
  );

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý khách thuê</h2>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 p-2 border rounded-lg bg-white w-64">
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Tìm khách thuê..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none outline-none text-sm"
              />
            </div>
            <button className="btn btn-primary" onClick={fetchTenants}>
              <RefreshCw size={16} /> Làm mới
            </button>
        </div>
      </div>

      {message && (
        <div className={`badge mb-4 w-full`} style={{ 
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          display: 'flex', gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 text-muted">Đang tải danh sách...</p>
        ) : filteredTenants.length === 0 ? (
          <div className="col-span-full card text-center py-10">
            <Users size={48} className="mx-auto mb-4 text-muted opacity-20" />
            <p className="text-muted">Chưa có khách thuê nào trong hệ thống.</p>
          </div>
        ) : filteredTenants.map((tenant) => (
          <div key={tenant.id} className="card hover-scale">
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                {(tenant.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontWeight: 700 }}>{tenant.fullName}</h3>
                <span className={`badge badge-active`}>
                  Khách đang thuê
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone size={14} /> {tenant.phoneNumber}
              </div>
              {tenant.email && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Mail size={14} /> {tenant.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar size={14} /> Tham gia: {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm w-full" onClick={() => navigate('/contracts')}>Xem hợp đồng</button>
              <button className="btn btn-primary btn-sm w-full" onClick={() => {
                if (tenant.email) {
                  window.location.href = `mailto:${tenant.email}?subject=Thông báo từ Chủ nhà QLPT Pro`;
                } else {
                  alert(`Vui lòng liên hệ trực tiếp qua số điện thoại: ${tenant.phoneNumber}`);
                }
              }}>Gửi thông báo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantManagement;
