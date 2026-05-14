import React from "react";
import { QrCode, FileText, Eye } from "lucide-react";

const TenantDashboard = () => {
  const invoices = [
    {
      id: "#INV-2026-001",
      month: "Tháng 6/2026",
      rent: "1,500,000 đ",
      util: "19,000 đ",
      total: "1,519,000 đ",
      status: "CHƯA THANH TOÁN",
    },
    {
      id: "#INV-2026-002",
      month: "Tháng 4/2026",
      rent: "1,500,000 đ",
      util: "9,200 đ",
      total: "1,509,200 đ",
      status: "ĐÃ THANH TOÁN",
    },
  ];

  return (
    <div className="page-container">
      {/* Debt Banner */}
      <div
        className="card mb-6"
        style={{
          backgroundColor: "#1e293b",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              opacity: 0.8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Tổng công nợ cần thanh toán
          </p>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              margin: "0.5rem 0",
            }}
          >
            1,519,000 đ
          </h2>
          <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
            1 hóa đơn chưa thanh toán
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{
            backgroundColor: "#10b981",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
          }}
        >
          <QrCode size={20} />
          Thanh Toán QR
        </button>
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
                <th>Điện + Nước</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                    {inv.id}
                  </td>
                  <td>{inv.month}</td>
                  <td>{inv.rent}</td>
                  <td>{inv.util}</td>
                  <td style={{ fontWeight: 700 }}>{inv.total}</td>
                  <td>
                    <span
                      className={`badge ${inv.status === "ĐÃ THANH TOÁN" ? "badge-active" : "badge-locked"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm">
                        Chi tiết
                      </button>
                      <button className="btn btn-primary btn-sm">
                        <Eye size={14} />
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

export default TenantDashboard;
