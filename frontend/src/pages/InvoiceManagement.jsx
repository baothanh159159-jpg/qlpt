import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Plus, Eye, Printer, X, Zap, Droplets, Lock, Pencil, FileText, CheckCircle } from 'lucide-react';

/* ─────────────────────────────────────────
   Inline styles (scoped to this component)
   ───────────────────────────────────────── */
const S = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
  },
  modal: {
    background: '#1a1d2e',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    fontFamily: "'Inter', sans-serif",
  },
  modalHeader: {
    padding: '1.75rem 1.75rem 0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '1.25rem',
  },
  sectionSeparator: {
    borderTop: '1px solid #2d3148',
    margin: '0 1.75rem',
    paddingTop: '0.75rem',
    marginBottom: '0.25rem',
  },
  sectionLabel: {
    textAlign: 'center',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#64748b',
    marginBottom: '0.75rem',
  },
  body: { padding: '0 1.75rem 1.75rem' },
  row: { display: 'flex', gap: '0.875rem', marginBottom: '1rem' },
  col: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8' },
  labelIcon: { display: 'flex', alignItems: 'center', gap: '0.35rem' },

  /* inputs */
  input: {
    background: '#252842',
    border: '1px solid #3a3f5c',
    borderRadius: '8px',
    padding: '0.6rem 0.875rem',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputFocus: { borderColor: '#6366f1' },
  inputDisabled: {
    background: '#1e2135',
    border: '1px solid #2a2f4a',
    color: '#64748b',
    cursor: 'not-allowed',
  },
  select: {
    background: '#252842',
    border: '1px solid #3a3f5c',
    borderRadius: '8px',
    padding: '0.6rem 0.875rem',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'auto',
  },

  /* disabled row with lock + edit btn */
  disabledRow: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  disabledInputWrap: {
    flex: 1,
    display: 'flex', alignItems: 'center',
    background: '#1e2135',
    border: '1px solid #2a2f4a',
    borderRadius: '8px',
    padding: '0.55rem 0.875rem',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  editBtn: {
    background: '#2d3148',
    border: '1px solid #3a3f5c',
    borderRadius: '8px',
    padding: '0.55rem 0.875rem',
    color: '#94a3b8',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  },

  /* utility zone card */
  zoneCard: {
    background: '#212438',
    border: '1px solid #2d3148',
    borderRadius: '12px',
    padding: '1rem 1.125rem',
    marginBottom: '0.875rem',
  },
  zoneTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '0.875rem',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },

  /* computed fields */
  computedGreen: {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '8px',
    padding: '0.55rem 0.875rem',
    color: '#4ade80',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  computedBlue: {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '8px',
    padding: '0.55rem 0.875rem',
    color: '#818cf8',
    fontSize: '0.85rem',
    fontWeight: 600,
  },

  /* summary bar */
  summaryBar: {
    background: '#0f1120',
    borderTop: '1px solid #2d3148',
    padding: '0.875rem 1.75rem',
    display: 'flex', alignItems: 'center', flexWrap: 'wrap',
    gap: '1rem 2rem',
  },
  summaryTitle: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginRight: '0.5rem',
  },
  summaryItem: { fontSize: '0.78rem', color: '#94a3b8' },
  summaryValue: { color: '#e2e8f0', fontWeight: 600 },
  summaryTotal: { fontSize: '0.82rem', fontWeight: 700, color: '#818cf8' },

  /* footer buttons */
  footer: {
    display: 'flex', gap: '0.75rem',
    padding: '0.875rem 1.75rem 1.75rem',
  },
  btnCancel: {
    flex: 1,
    background: '#252842',
    border: '1px solid #3a3f5c',
    borderRadius: '10px',
    padding: '0.75rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnSubmit: {
    flex: 1,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
    transition: 'opacity 0.15s',
  },
};

/* ─────────────── helpers ─────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

const UtilityZone = ({ type, icon, color, label, unit, formData, setFormData }) => {
  const isElec = type === 'electricity';
  const oldKey = isElec ? 'electricityOld' : 'waterOld';
  const newKey = isElec ? 'electricityNew' : 'waterNew';
  const priceKey = isElec ? 'electricPrice' : 'waterPrice';
  const editKey = isElec ? 'editElecOld' : 'editWaterOld';

  const oldVal = formData[oldKey];
  const newVal = formData[newKey];
  const price = formData[priceKey];
  const isEditing = formData[editKey];

  const consumed = Math.max(0, (parseFloat(newVal) || 0) - (parseFloat(oldVal) || 0));
  const total = consumed * (parseFloat(price) || 0);

  const toggle = () => setFormData(f => ({ ...f, [editKey]: !f[editKey] }));

  return (
    <div style={S.zoneCard}>
      <div style={S.zoneTitle}>
        {icon}
        {label}
      </div>

      {/* Old + New reading */}
      <div style={S.row}>
        <div style={S.col}>
          <span style={{ ...S.label, ...S.labelIcon }}>
            {icon && React.cloneElement(icon, { size: 12 })} Số {isElec ? 'điện' : 'nước'} đầu
          </span>
          <div style={S.disabledRow}>
            <div style={S.disabledInputWrap}>
              <Lock size={13} />
              {isEditing
                ? <input
                    autoFocus
                    type="number"
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', width: '100%', fontSize: '0.9rem' }}
                    value={oldVal}
                    onChange={e => setFormData(f => ({ ...f, [oldKey]: e.target.value }))}
                  />
                : <span>{oldVal !== '' ? oldVal : '—'}</span>
              }
            </div>
            <button
              type="button"
              style={S.editBtn}
              onClick={toggle}
            >
              <Pencil size={12} />
              {isEditing ? 'Xong' : 'Sửa'}
            </button>
          </div>
        </div>

        <div style={S.col}>
          <span style={{ ...S.label, ...S.labelIcon }}>
            {icon && React.cloneElement(icon, { size: 12 })} Số {isElec ? 'điện' : 'nước'} cuối
          </span>
          <input
            type="number"
            placeholder="Nhập số cuối"
            style={S.input}
            value={newVal}
            onChange={e => setFormData(f => ({ ...f, [newKey]: e.target.value }))}
            required
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#3a3f5c')}
          />
        </div>
      </div>

      {/* Consumed + Price + Total */}
      <div style={S.row}>
        <div style={S.col}>
          <span style={S.label}>Tiêu thụ</span>
          <div style={S.computedGreen}>
            Tiêu thụ: <strong>{consumed} {unit}</strong>
          </div>
        </div>
        <div style={S.col}>
          <span style={S.label}>Đơn giá (VNĐ/{unit})</span>
          <input
            type="number"
            style={S.input}
            value={price}
            onChange={e => setFormData(f => ({ ...f, [priceKey]: e.target.value }))}
            required
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#3a3f5c')}
          />
        </div>
        <div style={S.col}>
          <span style={S.label}>Thành tiền</span>
          <div style={S.computedBlue}>
            {isElec ? 'Thành tiền điện' : 'Thành tiền nước'}: <strong>{fmt(total)} VNĐ</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rooms, setRooms] = useState([]);

  const defaultForm = {
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricityOld: '',
    electricityNew: '',
    waterOld: '',
    waterNew: '',
    electricPrice: 4000,
    waterPrice: 15000,
    editElecOld: false,
    editWaterOld: false,
  };
  const [formData, setFormData] = useState(defaultForm);

  /* ── computed ── */
  const elecConsumed = Math.max(0, (parseFloat(formData.electricityNew) || 0) - (parseFloat(formData.electricityOld) || 0));
  const waterConsumed = Math.max(0, (parseFloat(formData.waterNew) || 0) - (parseFloat(formData.waterOld) || 0));
  const elecFee = elecConsumed * (parseFloat(formData.electricPrice) || 0);
  const waterFee = waterConsumed * (parseFloat(formData.waterPrice) || 0);
  const total = elecFee + waterFee;

  /* ── fetch last utility reading when room changes ── */
  useEffect(() => {
    if (!formData.roomId) return;
    
    // The backend returns an array sorted by year DESC, month DESC.
    // We take the first element (the most recent reading) to auto-fill the old index.
    api.get(`/Utility/GetByRoom/${formData.roomId}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          setFormData(f => ({
            ...f,
            electricityOld: latest.electricityNew ?? '',
            waterOld: latest.waterNew ?? '',
          }));
        } else {
          setFormData(f => ({
            ...f,
            electricityOld: '',
            waterOld: '',
          }));
        }
      })
      .catch(() => {
        setFormData(f => ({
          ...f,
          electricityOld: '',
          waterOld: '',
        }));
      });
  }, [formData.roomId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const roomsRes = await api.get('/Room/GetAllRooms');
      const rentedRooms = roomsRes.data.filter(r => r.status === 'Rented');
      setRooms(rentedRooms);

      const invPromises = rentedRooms.map(r => api.get(`/Invoice/GetByRoom/${r.id}`));
      const invResponses = await Promise.all(invPromises);

      let allInvoices = [];
      invResponses.forEach(res => { allInvoices = [...allInvoices, ...res.data]; });
      allInvoices.sort((a, b) => b.invoiceYear - a.invoiceYear || b.invoiceMonth - a.invoiceMonth);
      setInvoices(allInvoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => { setFormData(defaultForm); setShowModal(true); };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Invoice/Generate', {
        roomId: formData.roomId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        electricityOld: parseFloat(formData.electricityOld) || 0,
        electricityNew: parseFloat(formData.electricityNew),
        waterOld: parseFloat(formData.waterOld) || 0,
        waterNew: parseFloat(formData.waterNew),
        electricPrice: parseFloat(formData.electricPrice),
        waterPrice: parseFloat(formData.waterPrice),
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Hóa đơn &amp; Tiền phòng</h2>
        <button className="btn btn-primary" onClick={openModal}>
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
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{inv.invoiceNumber || inv.id.substring(0, 8)}</td>
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

      {/* ══════════════ CREATE MODAL ══════════════ */}
      {showModal && (
        <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <form onSubmit={handleCreate}>

              {/* Header */}
              <div style={S.modalHeader}>
                <h3 style={S.title}>Xuất hóa đơn tháng</h3>

                {/* Room + Month/Year */}
                <div style={S.row}>
                  <div style={{ ...S.col, flex: 1.4 }}>
                    <label style={S.label}>Chọn Phòng (Đang thuê)</label>
                    <select
                      style={S.select}
                      value={formData.roomId}
                      onChange={e => setFormData(f => ({ ...f, roomId: e.target.value }))}
                      required
                    >
                      <option value="">-- Chọn phòng --</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name || r.Name || `Phòng ${r.roomCode || r.RoomCode}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={S.col}>
                    <label style={S.label}>Tháng / Năm</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number" min="1" max="12"
                        style={{ ...S.input, textAlign: 'center' }}
                        value={formData.month}
                        onChange={e => setFormData(f => ({ ...f, month: e.target.value }))}
                        required
                      />
                      <span style={{ color: '#64748b', alignSelf: 'center', fontSize: '1.1rem' }}>/</span>
                      <input
                        type="number"
                        style={{ ...S.input, textAlign: 'center' }}
                        value={formData.year}
                        onChange={e => setFormData(f => ({ ...f, year: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={S.sectionSeparator}>
                <p style={S.sectionLabel}>ĐIỆN &amp; NƯỚC</p>
              </div>

              {/* Utility zones */}
              <div style={S.body}>
                <UtilityZone
                  type="electricity"
                  icon={<Zap size={15} color="#facc15" />}
                  color="#facc15"
                  label="Khu vực Điện"
                  unit="kWh"
                  formData={formData}
                  setFormData={setFormData}
                />
                <UtilityZone
                  type="water"
                  icon={<Droplets size={15} color="#38bdf8" />}
                  color="#38bdf8"
                  label="Khu vực Nước"
                  unit="m³"
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>

              {/* Summary bar */}
              <div style={S.summaryBar}>
                <span style={S.summaryTitle}>Tóm tắt hóa đơn</span>
                <span style={S.summaryItem}>
                  Tiền điện: <span style={S.summaryValue}>{fmt(elecFee)}</span>
                </span>
                <span style={S.summaryItem}>
                  Tiền nước: <span style={S.summaryValue}>{fmt(waterFee)}</span>
                </span>
                <span style={S.summaryItem}>
                  Phí dịch vụ khác: <span style={S.summaryValue}>0</span>
                </span>
                <span style={S.summaryTotal}>
                  Tổng hóa đơn: {fmt(total)}
                </span>
              </div>

              {/* Footer buttons */}
              <div style={S.footer}>
                <button
                  type="button"
                  style={S.btnCancel}
                  onClick={() => setShowModal(false)}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2d3148')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#252842')}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={S.btnSubmit}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Xuất hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ DETAIL MODAL ══════════════ */}
      {showDetail && selectedInvoice && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: '460px' }}>
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ ...S.title, marginBottom: 0, fontSize: '1.15rem' }}>
                  Hóa Đơn Chi Tiết #{selectedInvoice.invoiceNumber || selectedInvoice.id.substring(0, 8)}
                </h3>
                <button
                  onClick={() => setShowDetail(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Tiền phòng', value: selectedInvoice.roomFee },
                  { label: 'Tiền điện', value: selectedInvoice.electricityFee, icon: <Zap size={14} color="#facc15" /> },
                  { label: 'Tiền nước', value: selectedInvoice.waterFee, icon: <Droplets size={14} color="#38bdf8" /> },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#212438', borderRadius: '8px', padding: '0.65rem 0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                      {item.icon}{item.label}
                    </span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.value?.toLocaleString()} đ</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #2d3148', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#f1f5f9' }}>TỔNG CỘNG</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>{selectedInvoice.totalAmount?.toLocaleString()} đ</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button style={S.btnCancel} onClick={() => setShowDetail(false)}>Đóng</button>
                <button style={S.btnSubmit} onClick={() => window.print()}>
                  <Printer size={16} style={{ marginRight: '0.35rem', display: 'inline' }} /> In hóa đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
