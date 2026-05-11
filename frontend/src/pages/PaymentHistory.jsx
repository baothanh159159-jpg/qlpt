import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, CheckCircle, CreditCard, Banknote } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Payment/History');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Lịch sử phiếu thu</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quản lý và theo dõi các khoản thanh toán từ khách thuê.</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Khách thuê</th>
              <th>Kỳ hóa đơn</th>
              <th>Số tiền thu</th>
              <th>Ngày thanh toán</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải lịch sử...</td></tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <History size={48} className="mx-auto mb-4 text-muted opacity-20" />
                  <p className="text-muted font-medium">Chưa có giao dịch thanh toán nào.</p>
                </td>
              </tr>
            ) : payments.map((p) => (
              <tr key={p.id || p.Id}>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ...{(p.invoiceId || p.InvoiceId)?.toString().slice(-6).toUpperCase()}
                </td>
                <td style={{ fontWeight: 600 }}>{p.tenant?.fullName || p.Tenant?.FullName || 'N/A'}</td>
                <td>
                  Tháng {p.invoice?.invoiceMonth || p.Invoice?.InvoiceMonth}/{p.invoice?.invoiceYear || p.Invoice?.InvoiceYear}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {(p.amount || p.Amount)?.toLocaleString()} đ
                </td>
                <td>{new Date(p.paymentDate || p.PaymentDate).toLocaleString('vi-VN')}</td>
                <td>
                  <div className="flex items-center gap-1">
                    {(p.paymentMethod || p.PaymentMethod)?.includes('Bank') ? <CreditCard size={14} className="text-info" /> : <Banknote size={14} className="text-success" />}
                    {(p.paymentMethod || p.PaymentMethod)}
                  </div>
                </td>
                <td>
                  <span className="badge badge-active flex items-center gap-1 w-max">
                    <CheckCircle size={12} /> Thành công
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
