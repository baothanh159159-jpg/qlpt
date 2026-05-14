// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import { History, CheckCircle, CreditCard, Banknote } from 'lucide-react';

// const PaymentHistory = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchHistory = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/Payment/History');
//       setPayments(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   return (
//     <div className="page-container">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Lịch sử phiếu thu</h2>
//           <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quản lý và theo dõi các khoản thanh toán từ khách thuê.</p>
//         </div>
//       </div>

//       <div className="table-container">
//         <table>
//           <thead>
//             <tr>
//               <th>Mã hóa đơn</th>
//               <th>Khách thuê</th>
//               <th>Kỳ hóa đơn</th>
//               <th>Số tiền thu</th>
//               <th>Ngày thanh toán</th>
//               <th>Phương thức</th>
//               <th>Trạng thái</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải lịch sử...</td></tr>
//             ) : payments.length === 0 ? (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
//                   <History size={48} className="mx-auto mb-4 text-muted opacity-20" />
//                   <p className="text-muted font-medium">Chưa có giao dịch thanh toán nào.</p>
//                 </td>
//               </tr>
//             ) : payments.map((p) => (
//               <tr key={p.id || p.Id}>
//                 <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
//                   ...{(p.invoiceId || p.InvoiceId)?.toString().slice(-6).toUpperCase()}
//                 </td>
//                 <td style={{ fontWeight: 600 }}>{p.tenant?.fullName || p.Tenant?.FullName || 'N/A'}</td>
//                 <td>
//                   Tháng {p.invoice?.invoiceMonth || p.Invoice?.InvoiceMonth}/{p.invoice?.invoiceYear || p.Invoice?.InvoiceYear}
//                 </td>
//                 <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
//                   {(p.amount || p.Amount)?.toLocaleString()} đ
//                 </td>
//                 <td>{new Date(p.paymentDate || p.PaymentDate).toLocaleString('vi-VN')}</td>
//                 <td>
//                   <div className="flex items-center gap-1">
//                     {(p.paymentMethod || p.PaymentMethod)?.includes('Bank') ? <CreditCard size={14} className="text-info" /> : <Banknote size={14} className="text-success" />}
//                     {(p.paymentMethod || p.PaymentMethod)}
//                   </div>
//                 </td>
//                 <td>
//                   <span className="badge badge-active flex items-center gap-1 w-max">
//                     <CheckCircle size={12} /> Thành công
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory;

import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  History,
  CheckCircle,
  CreditCard,
  Banknote,
  Eye,
  X,
  Zap,
  Droplets,
  Home,
  CalendarDays,
} from "lucide-react";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // THÊM
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const res = await api.get("/Payment/History");
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

  // THÊM
  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetail(true);
  };

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            Lịch sử phiếu thu
          </h2>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Quản lý và theo dõi các khoản thanh toán từ khách thuê.
          </p>
        </div>
      </div>

      {/* TABLE */}
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
              <th>Chi tiết</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  Đang tải lịch sử...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                  }}
                >
                  <History
                    size={48}
                    className="mx-auto mb-4 text-muted opacity-20"
                  />

                  <p className="text-muted font-medium">
                    Chưa có giao dịch thanh toán nào.
                  </p>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id || p.Id}>
                  {/* MÃ */}
                  <td
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    ...
                    {(p.invoiceId || p.InvoiceId)
                      ?.toString()
                      .slice(-6)
                      .toUpperCase()}
                  </td>

                  {/* KHÁCH */}
                  <td style={{ fontWeight: 600 }}>
                    {p.tenant?.fullName || p.Tenant?.FullName || "N/A"}
                  </td>

                  {/* KỲ */}
                  <td>
                    Tháng {p.invoice?.invoiceMonth || p.Invoice?.InvoiceMonth}/
                    {p.invoice?.invoiceYear || p.Invoice?.InvoiceYear}
                  </td>

                  {/* TIỀN */}
                  <td
                    style={{
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {(p.amount || p.Amount)?.toLocaleString()} đ
                  </td>

                  {/* NGÀY */}
                  <td>
                    {new Date(p.paymentDate || p.PaymentDate).toLocaleString(
                      "vi-VN",
                    )}
                  </td>

                  {/* METHOD */}
                  <td>
                    <div className="flex items-center gap-1">
                      {(p.paymentMethod || p.PaymentMethod)?.includes(
                        "Bank",
                      ) ? (
                        <CreditCard size={14} className="text-info" />
                      ) : (
                        <Banknote size={14} className="text-success" />
                      )}

                      {p.paymentMethod || p.PaymentMethod}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span className="badge badge-active flex items-center gap-1 w-max">
                      <CheckCircle size={12} />
                      Thành công
                    </span>
                  </td>

                  {/* ACTION */}
                  <td>
                    <button
                      className="btn btn-outline btn-sm flex items-center gap-1"
                      onClick={() => handleViewDetail(p)}
                    >
                      <Eye size={14} />
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && selectedPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "650px",
              padding: "2rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  Chi tiết thanh toán
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Thông tin hóa đơn đã thanh toán
                </p>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* INFO */}
            <div className="space-y-4">
              {/* ROOM */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Home size={18} />
                  <strong>Thông tin phòng</strong>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p className="text-muted text-sm">Phòng</p>

                    <strong>
                      {selectedPayment.invoice?.roomName ||
                        selectedPayment.Invoice?.RoomName ||
                        "---"}
                    </strong>
                  </div>

                  <div>
                    <p className="text-muted text-sm">Kỳ hóa đơn</p>

                    <strong>
                      Tháng{" "}
                      {selectedPayment.invoice?.invoiceMonth ||
                        selectedPayment.Invoice?.InvoiceMonth}
                      /
                      {selectedPayment.invoice?.invoiceYear ||
                        selectedPayment.Invoice?.InvoiceYear}
                    </strong>
                  </div>
                </div>
              </div>

              {/* PAYMENT TIME */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  backgroundColor: "#ecfeff",
                  border: "1px solid #a5f3fc",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays size={18} />
                  <strong>Thông tin thanh toán</strong>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Thanh toán lúc</span>

                    <strong>
                      {new Date(
                        selectedPayment.paymentDate ||
                          selectedPayment.PaymentDate,
                      ).toLocaleString("vi-VN")}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Phương thức</span>

                    <strong>
                      {selectedPayment.paymentMethod ||
                        selectedPayment.PaymentMethod}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Trạng thái</span>

                    <strong style={{ color: "#16a34a" }}>Thành công</strong>
                  </div>
                </div>
              </div>

              {/* ROOM FEE */}
              <div
                className="flex justify-between items-center"
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="flex items-center gap-2">
                  <Home size={18} />
                  <span>Tiền phòng</span>
                </div>

                <strong>
                  {(
                    selectedPayment.invoice?.roomFee ||
                    selectedPayment.Invoice?.RoomFee ||
                    0
                  ).toLocaleString()}{" "}
                  đ
                </strong>
              </div>

              {/* ELECTRIC */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid #fde68a",
                  backgroundColor: "#fffbeb",
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    color: "#d97706",
                    fontWeight: 700,
                  }}
                >
                  <Zap size={18} />
                  Chi tiết tiền điện
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Chỉ số cũ</span>

                    <strong>
                      {selectedPayment.invoice?.electricityOld ||
                        selectedPayment.Invoice?.ElectricityOld ||
                        0}{" "}
                      kWh
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Chỉ số mới</span>

                    <strong>
                      {selectedPayment.invoice?.electricityNew ||
                        selectedPayment.Invoice?.ElectricityNew ||
                        0}{" "}
                      kWh
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Đơn giá điện</span>

                    <strong>
                      {(
                        selectedPayment.invoice?.electricityPrice ||
                        selectedPayment.Invoice?.ElectricityPrice ||
                        0
                      ).toLocaleString()}{" "}
                      đ/kWh
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Tiền điện</span>

                    <strong style={{ color: "#d97706" }}>
                      {(
                        selectedPayment.invoice?.electricityFee ||
                        selectedPayment.Invoice?.ElectricityFee ||
                        0
                      ).toLocaleString()}{" "}
                      đ
                    </strong>
                  </div>
                </div>
              </div>

              {/* WATER */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid #bfdbfe",
                  backgroundColor: "#eff6ff",
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    color: "#2563eb",
                    fontWeight: 700,
                  }}
                >
                  <Droplets size={18} />
                  Chi tiết tiền nước
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Chỉ số cũ</span>

                    <strong>
                      {selectedPayment.invoice?.waterOld ||
                        selectedPayment.Invoice?.WaterOld ||
                        0}{" "}
                      m³
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Chỉ số mới</span>

                    <strong>
                      {selectedPayment.invoice?.waterNew ||
                        selectedPayment.Invoice?.WaterNew ||
                        0}{" "}
                      m³
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Đơn giá nước</span>

                    <strong>
                      {(
                        selectedPayment.invoice?.waterPrice ||
                        selectedPayment.Invoice?.WaterPrice ||
                        0
                      ).toLocaleString()}{" "}
                      đ/m³
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Tiền nước</span>

                    <strong style={{ color: "#2563eb" }}>
                      {(
                        selectedPayment.invoice?.waterFee ||
                        selectedPayment.Invoice?.WaterFee ||
                        0
                      ).toLocaleString()}{" "}
                      đ
                    </strong>
                  </div>
                </div>
              </div>

              {/* TOTAL */}
              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div className="flex justify-between items-center">
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  >
                    TỔNG THANH TOÁN
                  </span>

                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: "var(--primary)",
                    }}
                  >
                    {(
                      selectedPayment.amount ||
                      selectedPayment.Amount ||
                      0
                    ).toLocaleString()}{" "}
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
