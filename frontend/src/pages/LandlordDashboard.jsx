import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import { Home, UserCheck, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

const LandlordDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [resStats, resMe] = await Promise.all([
        api.get('/Dashboard/Overview'),
        api.get('/Account/Me')
      ]);
      setStats(resStats.data);
      setBankInfo(resMe.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="page-container">Đang tải thống kê...</div>;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Tổng quan hệ thống</h2>
        <button className="btn btn-outline btn-sm" onClick={fetchStats}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Tổng Số Phòng" value={stats?.totalRooms || 0} icon={Home} color="#3B82F6" />
        <StatCard label="Phòng Trống" value={stats?.emptyRooms || 0} icon={Home} color="#EC4899" />
        <StatCard label="Doanh Thu (Tháng Này)" value={`${(stats?.currentMonthRevenue || 0).toLocaleString()} đ`} icon={TrendingUp} color="#10B981" />
        <StatCard label="Công Nợ Cần Thu" value={`${(stats?.unpaidDebt || 0).toLocaleString()} đ`} icon={AlertCircle} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="mb-4">Biểu đồ doanh thu (6 tháng gần nhất)</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
            {stats?.monthlyRevenueChart?.map((item, index) => {
              const height = item.revenue > 0 ? (item.revenue / (Math.max(...stats.monthlyRevenueChart.map(m => m.revenue)) || 1) * 100) : 5;
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.min(height, 100)}%`, 
                      backgroundColor: 'var(--primary)', 
                      borderRadius: '0.25rem 0.25rem 0 0',
                      transition: 'height 0.5s ease'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>T{item.month}/{item.year}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Cấu hình Thanh toán VietQR</h3>
          <p className="text-muted text-sm mb-4">Thông tin này sẽ được dùng để tạo mã QR thanh toán cho khách thuê.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await api.put('/Account/UpdateBankInfo', {
                bankCode: formData.get('bankCode'),
                bankAccountNumber: formData.get('bankAccountNumber'),
                bankAccountName: formData.get('bankAccountName')
              });
              alert('Cập nhật thành công!');
              fetchStats();
            } catch (err) {
              alert('Lỗi khi cập nhật thông tin');
            }
          }}>
            <div className="mb-3">
              <label className="label">Mã Ngân hàng (VD: MB, VCB, ICB...)</label>
              <input name="bankCode" defaultValue={bankInfo?.bankCode} className="w-full p-2 border rounded-lg" required />
            </div>
            <div className="mb-3">
              <label className="label">Số tài khoản</label>
              <input name="bankAccountNumber" defaultValue={bankInfo?.bankAccountNumber} className="w-full p-2 border rounded-lg" required />
            </div>
            <div className="mb-4">
              <label className="label">Tên chủ tài khoản (Viết liền không dấu)</label>
              <input name="bankAccountName" defaultValue={bankInfo?.bankAccountName} className="w-full p-2 border rounded-lg" required />
            </div>
            <button type="submit" className="btn btn-primary w-full">Lưu cấu hình</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
