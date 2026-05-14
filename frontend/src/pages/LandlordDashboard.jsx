// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import StatCard from '../components/dashboard/StatCard';
// import { Home, UserCheck, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

// const LandlordDashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [bankInfo, setBankInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const [resStats, resMe] = await Promise.all([
//         api.get('/Dashboard/Overview'),
//         api.get('/Account/Me')
//       ]);
//       setStats(resStats.data);
//       setBankInfo(resMe.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   if (loading) return <div className="page-container">Đang tải thống kê...</div>;

//   return (
//     <div className="page-container">
//       <div className="flex justify-between items-center mb-6">
//         <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Tổng quan hệ thống</h2>
//         <button className="btn btn-outline btn-sm" onClick={fetchStats}>
//           <RefreshCw size={16} /> Làm mới
//         </button>
//       </div>

//       <div className="stats-grid">
//         <StatCard label="Tổng Số Phòng" value={stats?.totalRooms || 0} icon={Home} color="#3B82F6" />
//         <StatCard label="Phòng Trống" value={stats?.emptyRooms || 0} icon={Home} color="#EC4899" />
//         <StatCard label="Doanh Thu (Tháng Này)" value={`${(stats?.currentMonthRevenue || 0).toLocaleString()} đ`} icon={TrendingUp} color="#10B981" />
//         <StatCard label="Công Nợ Cần Thu" value={`${(stats?.unpaidDebt || 0).toLocaleString()} đ`} icon={AlertCircle} color="#EF4444" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="card">
//           <h3 className="mb-4">Biểu đồ doanh thu (6 tháng gần nhất)</h3>
//           <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
//             {stats?.monthlyRevenueChart?.map((item, index) => {
//               const height = item.revenue > 0 ? (item.revenue / (Math.max(...stats.monthlyRevenueChart.map(m => m.revenue)) || 1) * 100) : 5;
//               return (
//                 <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
//                     <div style={{
//                       width: '100%',
//                       height: `${Math.min(height, 100)}%`,
//                       backgroundColor: 'var(--primary)',
//                       borderRadius: '0.25rem 0.25rem 0 0',
//                       transition: 'height 0.5s ease'
//                     }}></div>
//                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>T{item.month}/{item.year}</span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         <div className="card">
//           <h3 className="mb-4">Cấu hình Thanh toán VietQR</h3>
//           <p className="text-muted text-sm mb-4">Thông tin này sẽ được dùng để tạo mã QR thanh toán cho khách thuê.</p>
//           <form onSubmit={async (e) => {
//             e.preventDefault();
//             const formData = new FormData(e.target);
//             try {
//               await api.put('/Account/UpdateBankInfo', {
//                 bankCode: formData.get('bankCode'),
//                 bankAccountNumber: formData.get('bankAccountNumber'),
//                 bankAccountName: formData.get('bankAccountName')
//               });
//               alert('Cập nhật thành công!');
//               window.dispatchEvent(new Event('bankInfoUpdated'));
//               fetchStats();
//             } catch (err) {
//               alert('Lỗi khi cập nhật thông tin');
//             }
//           }}>
//             <div className="mb-3">
//               <label className="label">Mã Ngân hàng (VD: MB, VCB, ICB...)</label>
//               <input name="bankCode" defaultValue={bankInfo?.bankCode} className="w-full p-2 border rounded-lg" required />
//             </div>
//             <div className="mb-3">
//               <label className="label">Số tài khoản</label>
//               <input name="bankAccountNumber" defaultValue={bankInfo?.bankAccountNumber} className="w-full p-2 border rounded-lg" required />
//             </div>
//             <div className="mb-4">
//               <label className="label">Tên chủ tài khoản (Viết liền không dấu)</label>
//               <input name="bankAccountName" defaultValue={bankInfo?.bankAccountName} className="w-full p-2 border rounded-lg" required />
//             </div>
//             <button type="submit" className="btn btn-primary w-full">Lưu cấu hình</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandlordDashboard;

import React, { useState, useEffect } from "react";
import api from "../services/api";
import StatCard from "../components/dashboard/StatCard";
import { Home, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

const LandlordDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    try {
      const [resStats, resMe] = await Promise.all([
        api.get("/Dashboard/Overview"),
        api.get("/Account/Me"),
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

  if (loading) {
    return <div className="page-container">Đang tải thống kê...</div>;
  }

  // =========================
  // XỬ LÝ BIỂU ĐỒ
  // =========================

  const revenueChart = stats?.monthlyRevenueChart || [];

  // Lấy doanh thu lớn nhất
  const maxRevenue = Math.max(
    ...revenueChart.map((item) => Number(item.revenue || 0)),
    1,
  );

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
          Tổng quan hệ thống
        </h2>

        <button className="btn btn-outline btn-sm" onClick={fetchStats}>
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* THỐNG KÊ */}
      <div className="stats-grid">
        <StatCard
          label="Tổng Số Phòng"
          value={stats?.totalRooms || 0}
          icon={Home}
          color="#3B82F6"
        />

        <StatCard
          label="Phòng Trống"
          value={stats?.emptyRooms || 0}
          icon={Home}
          color="#EC4899"
        />

        <StatCard
          label="Doanh Thu (Tháng Này)"
          value={`${(stats?.currentMonthRevenue || 0).toLocaleString()} đ`}
          icon={TrendingUp}
          color="#10B981"
        />

        <StatCard
          label="Công Nợ Cần Thu"
          value={`${(stats?.unpaidDebt || 0).toLocaleString()} đ`}
          icon={AlertCircle}
          color="#EF4444"
        />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================= */}
        {/* BIỂU ĐỒ DOANH THU */}
        {/* ========================= */}

        <div className="card">
          <h3 className="mb-4">Biểu đồ doanh thu (6 tháng gần nhất)</h3>

          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "flex-end",
              gap: "1rem",
              padding: "2rem 0 1rem 0",
            }}
          >
            {revenueChart.map((item, index) => {
              const revenue = Number(item.revenue || 0);

              // =========================
              // TÍNH CHIỀU CAO CỘT
              // =========================

              let barHeight = 20;

              if (revenue > 0) {
                // Chiều cao từ 20% -> 100%
                barHeight = (revenue / maxRevenue) * 220 + 20;
              }

              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                  }}
                >
                  {/* SỐ TIỀN */}
                  <div
                    style={{
                      marginBottom: "10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {revenue.toLocaleString()}
                  </div>

                  {/* CỘT BIỂU ĐỒ */}
                  <div
                    style={{
                      width: "100%",
                      height: `${barHeight}px`,
                      minHeight: "20px",

                      background:
                        revenue > 0
                          ? "linear-gradient(to top, #2563eb, #60a5fa)"
                          : "#cbd5e1",

                      borderRadius: "10px 10px 0 0",

                      transition: "all 0.5s ease",

                      boxShadow:
                        revenue > 0
                          ? "0 8px 20px rgba(37, 99, 235, 0.3)"
                          : "none",
                    }}
                  />

                  {/* THÁNG */}
                  <span
                    style={{
                      marginTop: "12px",
                      fontSize: "0.8rem",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    T{item.month}/{item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================= */}
        {/* VIETQR */}
        {/* ========================= */}

        <div className="card">
          <h3 className="mb-4">Cấu hình Thanh toán VietQR</h3>

          <p className="text-muted text-sm mb-4">
            Thông tin này sẽ được dùng để tạo mã QR thanh toán cho khách thuê.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const formData = new FormData(e.target);

              try {
                await api.put("/Account/UpdateBankInfo", {
                  bankCode: formData.get("bankCode"),
                  bankAccountNumber: formData.get("bankAccountNumber"),
                  bankAccountName: formData.get("bankAccountName"),
                });

                alert("Cập nhật thành công!");

                window.dispatchEvent(new Event("bankInfoUpdated"));

                fetchStats();
              } catch (err) {
                alert("Lỗi khi cập nhật thông tin");
              }
            }}
          >
            <div className="mb-3">
              <label className="label">Ngân hàng</label>
              <select
                name="bankCode"
                defaultValue={bankInfo?.bankCode || ""}
                className="w-full p-2 border rounded-lg"
                required
                style={{ cursor: "pointer" }}
              >
                <option value="">-- Chọn ngân hàng --</option>
                <option value="ACB">ACB – Ngân hàng Á Châu</option>
                <option value="AGRIBANK">AGRIBANK – Ngân hàng Nông nghiệp &amp; PTNT</option>
                <option value="BIDV">BIDV – Ngân hàng Đầu tư &amp; Phát triển VN</option>
                <option value="BVB">BVB – Ngân hàng Bảo Việt</option>
                <option value="CAKE">CAKE – Ngân hàng số CAKE by VPBank</option>
                <option value="DONGABANK">DONGABANK – Ngân hàng Đông Á</option>
                <option value="EXIMBANK">EXIMBANK – Ngân hàng Xuất Nhập khẩu VN</option>
                <option value="GPB">GPB – Ngân hàng Dầu Khí Toàn Cầu</option>
                <option value="HDB">HDB – Ngân hàng HD Bank</option>
                <option value="ICB">ICB – Vietinbank</option>
                <option value="IVB">IVB – Ngân hàng Indovina</option>
                <option value="KLB">KLB – Ngân hàng Kiên Long</option>
                <option value="LPB">LPB – Ngân hàng Lộc Phát (LienVietPostBank)</option>
                <option value="MB">MB – Ngân hàng Quân Đội</option>
                <option value="MSB">MSB – Ngân hàng Hàng Hải</option>
                <option value="NAB">NAB – Ngân hàng Nam Á</option>
                <option value="NCB">NCB – Ngân hàng Quốc Dân</option>
                <option value="OCB">OCB – Ngân hàng Phương Đông</option>
                <option value="PBVN">PBVN – Ngân hàng PVcomBank</option>
                <option value="PGB">PGB – Ngân hàng Xăng dầu Petrolimex</option>
                <option value="SACOMBANK">SACOMBANK – Ngân hàng Sài Gòn Thương Tín</option>
                <option value="SAIGONBANK">SAIGONBANK – Ngân hàng Sài Gòn Công Thương</option>
                <option value="SCB">SCB – Ngân hàng Sài Gòn</option>
                <option value="SEABANK">SEABANK – Ngân hàng Đông Nam Á</option>
                <option value="SHB">SHB – Ngân hàng Sài Gòn – Hà Nội</option>
                <option value="SHBVN">SHBVN – Ngân hàng Shinhan Việt Nam</option>
                <option value="TECHCOMBANK">TECHCOMBANK – Ngân hàng Kỹ Thương VN</option>
                <option value="TPBANK">TPBANK – Ngân hàng Tiên Phong</option>
                <option value="UBANK">UBANK – Ngân hàng số Ubank by VPBank</option>
                <option value="VAB">VAB – Ngân hàng Việt Á</option>
                <option value="VCB">VCB – Vietcombank</option>
                <option value="VCCB">VCCB – Ngân hàng Bản Việt</option>
                <option value="VIB">VIB – Ngân hàng Quốc tế</option>
                <option value="VIDBANK">VIDBANK – Ngân hàng VID Public</option>
                <option value="VIETBANK">VIETBANK – Ngân hàng Việt Nam Thương Tín</option>
                <option value="VPB">VPB – VPBank</option>
                <option value="WVN">WVN – Ngân hàng Woori Việt Nam</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="label">Số tài khoản</label>

              <input
                name="bankAccountNumber"
                defaultValue={bankInfo?.bankAccountNumber}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="label">
                Tên chủ tài khoản (Viết liền không dấu)
              </label>

              <input
                name="bankAccountName"
                defaultValue={bankInfo?.bankAccountName}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Lưu cấu hình
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
