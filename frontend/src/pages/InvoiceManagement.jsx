import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Plus, FileText, CheckCircle, AlertTriangle, Zap, Droplets, X, Eye, Printer } from 'lucide-react';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ 
    roomId: '', 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear(),
    electricityIndex: '',
    waterIndex: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const roomsRes = await api.get('/Room/GetAllRooms');
      const rentedRooms = roomsRes.data.filter(r => r.status === 'Rented');
      setRooms(rentedRooms);

      const invPromises = rentedRooms.map(r => api.get(`/Invoice/GetByRoom/${r.id}`));
      const invResponses = await Promise.all(invPromises);
      
      let allInvoices = [];
      invResponses.forEach(res => {
        allInvoices = [...allInvoices, ...res.data];
      });
      
      allInvoices.sort((a, b) => b.invoiceYear - a.invoiceYear || b.invoiceMonth - a.invoiceMonth);
      setInvoices(allInvoices);
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
      await api.post('/Invoice/Generate', {
        roomId: formData.roomId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        electricityNew: parseFloat(formData.electricityIndex),
        waterNew: parseFloat(formData.waterIndex)
      });
      setShowModal(false);
      fetchData();
      alert('Tạo hóa đơn thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo hóa đơn');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.post(`/Payment/Pay/${id}`);
      fetchData();
      alert('Đã xác nhận thanh toán thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Hóa đơn & Tiền phòng</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Xuất hóa đơn mới
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Phòng</th>
              <th>Tháng/Năm</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{inv.invoiceNumber || inv.id.substring(0,8)}</td>
                <td>{inv.roomName || `Phòng ${inv.roomNumber}`}</td>
                <td>{inv.invoiceMonth}/{inv.invoiceYear}</td>
                <td style={{ fontWeight: 700 }}>{inv.totalAmount.toLocaleString()} đ</td>
                <td>
                  <span className={`badge ${inv.status === 'Paid' ? 'badge-active' : 'badge-locked'}`}>
                    {inv.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </td>
                <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="flex gap-2">
                    {inv.status !== 'Paid' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(inv.id)}>
                        Xác nhận TT
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedInvoice(inv); setShowDetail(true); }}>
                      <Eye size={14} />
                    </button>
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
            <h3 className="mb-4">Xuất hóa đơn tháng</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="label">Chọn Phòng (Đang thuê)</label>
                <select className="w-full p-2 border rounded-lg mt-1" value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})} required>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name || r.Name || `Phòng ${r.roomCode || r.RoomCode}`}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mb-4">
                <div style={{ flex: 1 }}>
                  <label className="label">Tháng</label>
                  <input type="number" min="1" max="12" className="w-full p-2 border rounded-lg mt-1" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Năm</label>
                  <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <div style={{ flex: 1 }}>
                  <label className="label flex items-center gap-1"><Zap size={14} className="text-warning" /> Số điện cuối</label>
                  <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.electricityIndex} onChange={(e) => setFormData({...formData, electricityIndex: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label flex items-center gap-1"><Droplets size={14} className="text-info" /> Số nước cuối</label>
                  <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.waterIndex} onChange={(e) => setFormData({...formData, waterIndex: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary w-full">Xuất hóa đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hóa Đơn Chi Tiết #{selectedInvoice.invoiceNumber || selectedInvoice.id.substring(0,8)}</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-muted">Tiền phòng</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.roomFee?.toLocaleString()} đ</span>
              </div>
              <div className="p-2 border rounded">
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiền điện</span>
                  <span>{selectedInvoice.electricityFee?.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiền nước</span>
                  <span>{selectedInvoice.waterFee?.toLocaleString()} đ</span>
                </div>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span style={{ fontWeight: 700 }}>TỔNG CỘNG</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedInvoice.totalAmount?.toLocaleString()} đ</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button className="btn btn-outline w-full" onClick={() => setShowDetail(false)}>Đóng</button>
              <button className="btn btn-primary w-full flex items-center justify-center gap-2" onClick={() => window.print()}>
                <Printer size={18} /> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
