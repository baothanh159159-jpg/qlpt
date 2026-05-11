import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, Check, X, Calendar, User, Home, AlertCircle, Clock } from 'lucide-react';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  
  const [formData, setFormData] = useState({ 
    roomId: '', 
    tenantId: '', 
    startDate: new Date().toISOString().split('T')[0], 
    endDate: '', 
    depositAmount: 0 
  });
  
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, roomsRes, tenantsRes] = await Promise.all([
        api.get('/Contract/GetAll'),
        api.get('/Room/GetAllRooms'),
        api.get('/Tenant/GetAll') 
      ]);
      setContracts(contractsRes.data);
      setRooms(roomsRes.data.filter(r => r.status === 'Available' || r.status === 'Trống'));
      
      setTenants(tenantsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Contract/Add', {
        ...formData,
        depositAmount: parseFloat(formData.depositAmount)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo hợp đồng');
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/Contract/ApproveContract/${selectedContract.id}`, {
        startDate: formData.startDate,
        endDate: formData.endDate,
        depositAmount: parseFloat(formData.depositAmount)
      });
      setShowApproveModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi duyệt hợp đồng');
    }
  };

  const handleEnd = async (id) => {
    if (!window.confirm('Kết thúc hợp đồng này?')) return;
    try {
      await api.put(`/Contract/EndContract/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý hợp đồng</h2>
        <button className="btn btn-primary" onClick={() => {
           setFormData({ roomId: '', tenantId: '', startDate: new Date().toISOString().split('T')[0], endDate: '', depositAmount: 0 });
           setShowModal(true);
        }}>
          <Plus size={18} /> Tạo hợp đồng mới
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Khách Thuê</th>
              <th>Ngày Bắt Đầu</th>
              <th>Ngày Kết Thúc</th>
              <th>Tiền Cọc</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải hợp đồng...</td></tr>
            ) : contracts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có hợp đồng nào.</td></tr>
            ) : contracts.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.roomName || `Phòng ${c.roomCode}`}</td>
                <td>{c.tenantName || 'N/A'}</td>
                <td>{new Date(c.startDate).toLocaleDateString('vi-VN')}</td>
                <td>{new Date(c.endDate).toLocaleDateString('vi-VN')}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.depositAmount.toLocaleString()} đ</td>
                <td>
                  <span className={`badge ${c.status === 'Active' ? 'badge-active' : c.status === 'Pending' ? 'badge-pending' : 'badge-locked'}`}>
                    {c.status === 'Active' ? 'Đang hiệu lực' : c.status === 'Pending' ? 'Chờ duyệt' : 'Đã kết thúc'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    {c.status === 'Active' && (
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleEnd(c.id)}>
                        Kết thúc
                      </button>
                    )}
                    {c.status === 'Pending' && (
                      <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => {
                        setSelectedContract(c);
                        setFormData({ ...formData, depositAmount: 0, endDate: '' });
                        setShowApproveModal(true);
                      }}>
                        <Check size={14} /> Duyệt ngay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="mb-4">Tạo hợp đồng thuê phòng</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="label">Chọn Phòng (Còn trống)</label>
                <select className="w-full p-2 border rounded-lg mt-1" value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})} required>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name || r.roomCode}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Chọn Khách Thuê</label>
                <select className="w-full p-2 border rounded-lg mt-1" value={formData.tenantId} onChange={(e) => setFormData({...formData, tenantId: e.target.value})} required>
                  <option value="">-- Chọn khách thuê --</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName} - {t.phoneNumber}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mb-4">
                <div style={{ flex: 1 }}>
                  <label className="label">Ngày bắt đầu</label>
                  <input type="date" className="w-full p-2 border rounded-lg mt-1" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Ngày kết thúc</label>
                  <input type="date" className="w-full p-2 border rounded-lg mt-1" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="mb-6">
                <label className="label">Tiền đặt cọc (VNĐ)</label>
                <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.depositAmount} onChange={(e) => setFormData({...formData, depositAmount: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary w-full">Kích hoạt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal (For Pending Requests) */}
      {showApproveModal && selectedContract && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-6">
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Duyệt yêu cầu thuê phòng</h3>
               <button onClick={() => setShowApproveModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <p className="text-sm"><span className="text-muted">Phòng:</span> <strong>{selectedContract.roomName || selectedContract.roomCode}</strong></p>
              <p className="text-sm"><span className="text-muted">Người thuê:</span> <strong>{selectedContract.tenantName}</strong></p>
            </div>

            <form onSubmit={handleApprove}>
              <div className="flex gap-4 mb-4">
                <div style={{ flex: 1 }}>
                  <label className="label">Ngày bắt đầu</label>
                  <input type="date" className="w-full p-2 border rounded-lg mt-1" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Ngày kết thúc</label>
                  <input type="date" className="w-full p-2 border rounded-lg mt-1" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="mb-6">
                <label className="label">Tiền đặt cọc đã thu (VNĐ)</label>
                <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.depositAmount} onChange={(e) => setFormData({...formData, depositAmount: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline w-full" onClick={() => setShowApproveModal(false)}>Đóng</button>
                <button type="submit" className="btn btn-primary w-full">Duyệt & Kích hoạt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
