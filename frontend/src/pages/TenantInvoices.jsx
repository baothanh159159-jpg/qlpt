import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QrCode, FileText, Eye, AlertCircle, CheckCircle, X, Zap, Droplets, CreditCard } from 'lucide-react';

const TenantInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Invoice/MyInvoices'); 
      setInvoices(res.data);
      
      const unpaid = res.data
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      setUnpaidTotal(unpaid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenDetail = (inv) => {
    setSelectedInvoice(inv);
    setShowDetail(true);
  };

  const getQRUrl = (inv) => {
    if (!inv || !inv.bankAccountNumber) return null;
    const amount = inv.totalAmount;
    const description = `THANH TOAN PHONG ${inv.roomName} THANG ${inv.invoiceMonth}`;
    // VietQR format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
    return `https://img.vietqr.io/image/${inv.bankCode}-${inv.bankAccountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(inv.bankAccountName)}`;
  };

  return (
    <div className="page-container">
      {/* Debt Banner */}
      <div className="card mb-6" style={{ backgroundColor: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng công nợ cần thanh toán</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0.5rem 0' }}>{unpaidTotal.toLocaleString()} đ</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{invoices.filter(i => i.status !== 'Paid').length} hóa đơn chưa thanh toán</p>
        </div>
        <div className="flex gap-2">
           <button className="btn btn-primary" style={{ backgroundColor: '#10b981', padding: '0.75rem 1.5rem', fontSize: '1rem' }} onClick={() => {
             const firstUnpaid = invoices.find(i => i.status !== 'Paid');
             if (firstUnpaid) {
               setSelectedInvoice(firstUnpaid);
               setShowQR(true);
             } else {
               alert('Bạn không có hóa đơn nào cần thanh toán!');
             }
           }}>
            <QrCode size={20} />
            Thanh Toán Nhanh
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4">Lịch Sử Hóa Đơn ({invoices.length} hóa đơn)</h3>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã Hóa Đơn</th>
                <th>Tháng</th>
                <th>Tiền Phòng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải hóa đơn...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Bạn chưa có hóa đơn nào.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{inv.invoiceNumber || inv.id.substring(0,8)}</td>
                  <td>Tháng {inv.invoiceMonth}/{inv.invoiceYear}</td>
                  <td>{inv.roomFee?.toLocaleString() || '---'} đ</td>
                  <td style={{ fontWeight: 700 }}>{inv.totalAmount.toLocaleString()} đ</td>
                  <td>
                    <span className={`badge ${inv.status === 'Paid' ? 'badge-active' : 'badge-locked'}`}>
                      {inv.status === 'Paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenDetail(inv)}>Chi tiết</button>
                      {inv.status !== 'Paid' && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedInvoice(inv); setShowQR(true); }}>
                          <QrCode size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Chi Tiết Hóa Đơn #{selectedInvoice.invoiceNumber || selectedInvoice.id.substring(0,8)}</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-muted">Tiền phòng (Tháng {selectedInvoice.invoiceMonth})</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.roomFee?.toLocaleString()} đ</span>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2 font-semibold text-warning">
                  <Zap size={16} /> Tiền Điện
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiền điện sử dụng</span>
                  <span style={{ fontWeight: 600 }}>{selectedInvoice.electricityFee?.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2 font-semibold text-info">
                  <Droplets size={16} /> Tiền Nước
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiền nước sử dụng</span>
                  <span style={{ fontWeight: 600 }}>{selectedInvoice.waterFee?.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>TỔNG CỘNG</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedInvoice.totalAmount?.toLocaleString()} đ</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button className="btn btn-outline w-full" onClick={() => setShowDetail(false)}>Đóng</button>
              {selectedInvoice.status !== 'Paid' && (
                <button className="btn btn-primary w-full flex items-center justify-center gap-2" onClick={() => { setShowDetail(false); setShowQR(true); }}>
                  <QrCode size={18} /> Thanh toán ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Quét mã VietQR</h3>
              <button onClick={() => setShowQR(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            {selectedInvoice.bankAccountNumber ? (
              <>
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <img 
                    src={getQRUrl(selectedInvoice)} 
                    alt="VietQR" 
                    style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }} 
                  />
                </div>
                <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2 font-semibold">
                    <CreditCard size={16} /> Thông tin chuyển khoản
                  </div>
                  <p className="text-sm"><span className="text-muted">Ngân hàng:</span> <strong>{selectedInvoice.bankCode}</strong></p>
                  <p className="text-sm"><span className="text-muted">Số TK:</span> <strong>{selectedInvoice.bankAccountNumber}</strong></p>
                  <p className="text-sm"><span className="text-muted">Chủ TK:</span> <strong>{selectedInvoice.bankAccountName}</strong></p>
                  <p className="text-sm"><span className="text-muted">Nội dung:</span> <strong>THANH TOAN PHONG {selectedInvoice.roomName}</strong></p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted">
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Chủ nhà chưa cấu hình thông tin ngân hàng.<br/>Vui lòng liên hệ trực tiếp để thanh toán.</p>
              </div>
            )}

            <button className="btn btn-outline w-full" onClick={() => setShowQR(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantInvoices;
