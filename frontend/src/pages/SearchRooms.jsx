import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Home,
  Search,
  MapPin,
  Maximize,
  CheckCircle,
  X,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Send,
  AlertCircle,
  Loader,
} from "lucide-react";

const SearchRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================
  // FILTER MỚI
  // =========================
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minArea: "",
    sortPrice: "",
    hasImage: false,
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRentModal, setShowRentModal] = useState(false);
  const [rentData, setRentData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [pageMessage, setPageMessage] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [successSent, setSuccessSent] = useState(false);

  // =========================
  // LOAD ROOM
  // =========================
  const fetchRooms = async () => {
    setLoading(true);

    try {
      const res = await api.get("/Room/GetAllRooms");

      const availableRooms = res.data.filter(
        (r) =>
          r.status === "Available" ||
          r.status === "Trống" ||
          r.Status === "Available" ||
          r.Status === "Trống",
      );

      setRooms(availableRooms);
    } catch (err) {
      console.error("Lỗi tải phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // =========================
  // OPEN MODAL
  // =========================
  const handleOpenRentModal = async (room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
    setModalMessage(null);
    setSuccessSent(false);

    try {
      await api.get("/Account/Me");

      setRentData({
        fullName: "",
        phoneNumber: "",
        address: "",
      });
    } catch {
      setRentData({
        fullName: "",
        phoneNumber: "",
        address: "",
      });
    }

    setShowRentModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleCloseModal = () => {
    setShowRentModal(false);
    setSelectedRoom(null);
    setModalMessage(null);
    setSuccessSent(false);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleRentSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setModalMessage(null);

    if (!rentData.fullName.trim()) {
      setModalMessage({
        type: "error",
        text: "Vui lòng nhập họ tên!",
      });

      setSubmitting(false);
      return;
    }

    if (!rentData.phoneNumber.trim()) {
      setModalMessage({
        type: "error",
        text: "Vui lòng nhập số điện thoại!",
      });

      setSubmitting(false);
      return;
    }

    try {
      const roomId = selectedRoom.id || selectedRoom.Id;

      const res = await api.post("/Contract/RequestContract", {
        roomId,
        fullName: rentData.fullName.trim(),
        phoneNumber: rentData.phoneNumber.trim(),
        address: rentData.address.trim() || null,
      });

      setSuccessSent(true);

      setModalMessage({
        type: "success",
        text: res.data?.message || "Gửi yêu cầu thuê phòng thành công!",
      });

      fetchRooms();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Gửi yêu cầu thất bại!";

      setModalMessage({
        type: "error",
        text: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // GET IMAGES
  // =========================
  const getImages = (room) => {
    const imgs = room.images || room.Images || [];

    return imgs.map((img) => img.imageUrl || img.ImageUrl).filter(Boolean);
  };

  // =========================
  // FILTER ROOM MỚI
  // =========================
  const filteredRooms = rooms
    .filter((r) => {
      const code = (r.roomCode || r.RoomCode || "").toLowerCase();

      const name = (r.name || r.Name || "").toLowerCase();

      const roomPrice = Number(r.price || r.Price || 0);

      const roomArea = Number(r.area || r.Area || 0);

      // Search
      const matchSearch =
        code.includes(search.toLowerCase()) ||
        name.includes(search.toLowerCase());

      // Giá từ
      const matchMinPrice =
        !filters.minPrice || roomPrice >= Number(filters.minPrice);

      // Giá đến
      const matchMaxPrice =
        !filters.maxPrice || roomPrice <= Number(filters.maxPrice);

      // Diện tích
      const matchArea = !filters.minArea || roomArea >= Number(filters.minArea);

      // Có ảnh
      const matchImage = !filters.hasImage || getImages(r).length > 0;

      return (
        matchSearch && matchMinPrice && matchMaxPrice && matchArea && matchImage
      );
    })

    .sort((a, b) => {
      const priceA = Number(a.price || a.Price || 0);

      const priceB = Number(b.price || b.Price || 0);

      if (filters.sortPrice === "asc") {
        return priceA - priceB;
      }

      if (filters.sortPrice === "desc") {
        return priceB - priceA;
      }

      return 0;
    });

  // =========================
  // IMAGE SLIDER
  // =========================
  const nextImage = (imgs) =>
    setCurrentImageIndex((prev) => (prev + 1) % imgs.length);

  const prevImage = (imgs) =>
    setCurrentImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            Tìm phòng thuê
          </h2>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Khám phá căn phòng phù hợp với bạn.
          </p>
        </div>

        {/* ========================= */}
        {/* FILTER BAR MỚI */}
        {/* ========================= */}

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 p-2 border rounded-lg bg-white w-64 shadow-sm">
            <Search size={18} className="text-muted" />

            <input
              type="text"
              placeholder="Tìm theo số phòng, tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none outline-none text-sm"
            />
          </div>

          {/* Giá từ */}
          <input
            type="number"
            placeholder="Giá từ"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({
                ...filters,
                minPrice: e.target.value,
              })
            }
            className="p-2 border rounded-lg text-sm w-28"
          />

          {/* Giá đến */}
          <input
            type="number"
            placeholder="Giá đến"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxPrice: e.target.value,
              })
            }
            className="p-2 border rounded-lg text-sm w-28"
          />

          {/* Diện tích */}
          <input
            type="number"
            placeholder="Diện tích >="
            value={filters.minArea}
            onChange={(e) =>
              setFilters({
                ...filters,
                minArea: e.target.value,
              })
            }
            className="p-2 border rounded-lg text-sm w-32"
          />

          {/* Sort */}
          <select
            value={filters.sortPrice}
            onChange={(e) =>
              setFilters({
                ...filters,
                sortPrice: e.target.value,
              })
            }
            className="p-2 border rounded-lg text-sm"
          >
            <option value="">Sắp xếp giá</option>

            <option value="asc">Giá tăng dần</option>

            <option value="desc">Giá giảm dần</option>
          </select>

          {/* Có ảnh */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasImage}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  hasImage: e.target.checked,
                })
              }
            />
            Có hình ảnh
          </label>
        </div>
      </div>

      {/* THÔNG BÁO */}
      {pageMessage && (
        <div
          style={{
            backgroundColor:
              pageMessage.type === "success" ? "#dcfce7" : "#fee2e2",

            color: pageMessage.type === "success" ? "#166534" : "#991b1b",

            padding: "1.25rem",
            borderRadius: "0.75rem",
            display: "flex",
            gap: "0.75rem",
            fontWeight: 600,
            border: "1px solid currentColor",
            marginBottom: "1.5rem",
            alignItems: "center",
          }}
        >
          {pageMessage.type === "success" ? (
            <CheckCircle size={22} />
          ) : (
            <AlertCircle size={22} />
          )}

          {pageMessage.text}
        </div>
      )}

      {/* ROOM GRID */}
      <div className="room-grid">
        {loading ? (
          <div className="col-span-full text-center py-16">
            <Loader
              size={40}
              className="mx-auto mb-4 text-muted"
              style={{
                animation: "spin 1s linear infinite",
              }}
            />

            <p className="text-muted">Đang tìm kiếm phòng trống...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full card text-center py-20">
            <Home
              size={64}
              className="mx-auto mb-4 text-muted"
              style={{ opacity: 0.1 }}
            />

            <p className="text-muted font-medium">
              Hiện tại không có phòng phù hợp.
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const imgs = getImages(room);

            const roomName =
              room.name ||
              room.Name ||
              `Phòng ${room.roomCode || room.RoomCode}`;

            return (
              <div
                key={room.id || room.Id}
                className="card p-0 overflow-hidden hover-scale shadow-lg border-none bg-white"
              >
                {/* IMAGE */}
                <div
                  style={{
                    aspectRatio: "1 / 1",
                    backgroundColor: "#f8fafc",
                    position: "relative",
                  }}
                >
                  {imgs.length > 0 ? (
                    <img
                      src={imgs[0]}
                      alt={roomName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-full text-muted"
                      style={{ opacity: 0.2 }}
                    >
                      <ImageIcon size={64} />
                    </div>
                  )}

                  {/* BADGE */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ● Còn trống
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div style={{ padding: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: "800",
                      marginBottom: "0.75rem",
                      color: "#1e293b",
                    }}
                  >
                    {roomName}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Maximize size={16} />
                      Diện tích:
                      <strong>{room.area || room.Area} m²</strong>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={16} />
                      {room.address ||
                        room.Address ||
                        "Liên hệ để biết địa chỉ"}
                    </div>

                    <div className="pt-2 border-t mt-4 flex items-baseline gap-1">
                      <span
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: "900",
                          color: "var(--primary)",
                        }}
                      >
                        {(room.price || room.Price)?.toLocaleString()}
                      </span>

                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        đ/tháng
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    style={{
                      padding: "0.875rem",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                    onClick={() => handleOpenRentModal(room)}
                  >
                    <Send
                      size={18}
                      style={{
                        marginRight: "0.5rem",
                      }}
                    />
                    Xem chi tiết & Thuê
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== MODAL GỬI YÊU CẦU THUÊ PHÒNG ===== */}
      {showRentModal && selectedRoom && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '860px',
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            display: 'flex',
            minHeight: '520px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>

            {/* ===== TRÁI: Carousel ảnh ===== */}
            <div style={{ flex: 1.2, backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden', minHeight: '520px' }}>
              {getImages(selectedRoom).length > 0 ? (
                <>
                  <img
                    src={getImages(selectedRoom)[currentImageIndex]}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    alt="Ảnh phòng"
                  />
                  {getImages(selectedRoom).length > 1 && (
                    <>
                      <button onClick={() => prevImage(getImages(selectedRoom))} style={{
                        position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
                        padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => nextImage(getImages(selectedRoom))} style={{
                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
                        padding: '0.75rem', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <ChevronRight size={20} />
                      </button>
                      <div style={{
                        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '0.5rem'
                      }}>
                        {getImages(selectedRoom).map((_, i) => (
                          <div key={i} style={{
                            width: i === currentImageIndex ? '20px' : '8px', height: '8px',
                            borderRadius: '4px',
                            backgroundColor: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.3)',
                            transition: 'all 0.3s ease'
                          }} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <ImageIcon size={72} />
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Chưa có ảnh</p>
                </div>
              )}
              {/* Nút đóng trên ảnh (mobile) */}
              <button onClick={handleCloseModal} style={{
                position: 'absolute', top: '1rem', right: '1rem',
                backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem',
                borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'none'
              }}>
                <X size={20} />
              </button>
            </div>

            {/* ===== PHẢI: Form đặt phòng ===== */}
            <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', backgroundColor: 'white' }}>

              {/* Header form */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                    {selectedRoom.name || selectedRoom.Name}
                  </h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.25rem' }}>
                    {(selectedRoom.price || selectedRoom.Price)?.toLocaleString()} đ/tháng
                  </p>
                </div>
                <button onClick={handleCloseModal} style={{
                  padding: '0.5rem', borderRadius: '50%', border: 'none',
                  backgroundColor: '#f1f5f9', cursor: 'pointer', color: '#64748b'
                }}>
                  <X size={22} />
                </button>
              </div>

              {/* Thông tin phòng */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mã phòng
                  </p>
                  <p style={{ fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                    {selectedRoom.roomCode || selectedRoom.RoomCode}
                  </p>
                </div>
                <div style={{ padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Diện tích
                  </p>
                  <p style={{ fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                    {selectedRoom.area || selectedRoom.Area} m²
                  </p>
                </div>
              </div>

              {/* ===== Thông báo trong modal ===== */}
              {modalMessage && (
                <div style={{
                  backgroundColor: modalMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: modalMessage.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${modalMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {modalMessage.type === 'success'
                    ? <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    : <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  }
                  <span>{modalMessage.text}</span>
                </div>
              )}

              {/* ===== Nếu đã gửi thành công: hiện nút đóng ===== */}
              {successSent ? (
                <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 1.5rem'
                  }}>
                    <CheckCircle size={36} style={{ color: '#16a34a' }} />
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Chủ trọ sẽ xem xét và liên hệ với bạn qua số điện thoại đã cung cấp.
                  </p>
                  <button
                    className="btn btn-primary w-full"
                    style={{ padding: '0.875rem' }}
                    onClick={handleCloseModal}
                  >
                    Đã hiểu, đóng lại
                  </button>
                </div>
              ) : (
                /* ===== Form gửi yêu cầu ===== */
                <form onSubmit={handleRentSubmit}>
                  {/* Họ tên */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#fafafa'
                    }}>
                      <User size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <input
                        type="text"
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'transparent' }}
                        value={rentData.fullName}
                        onChange={(e) => setRentData({ ...rentData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                      backgroundColor: '#fafafa'
                    }}>
                      <Phone size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <input
                        type="tel"
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'transparent' }}
                        value={rentData.phoneNumber}
                        onChange={(e) => setRentData({ ...rentData, phoneNumber: e.target.value })}
                        placeholder="09xx xxx xxx"
                        required
                      />
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Địa chỉ hiện tại <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>(không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%', padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                        fontSize: '0.9rem', fontWeight: 500, outline: 'none',
                        backgroundColor: '#fafafa', boxSizing: 'border-box'
                      }}
                      value={rentData.address}
                      onChange={(e) => setRentData({ ...rentData, address: e.target.value })}
                      placeholder="Xã, Huyện, Tỉnh..."
                    />
                  </div>

                  {/* Nút gửi */}
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    style={{ padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Đang gửi yêu cầu...
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Send size={18} />
                        Gửi yêu cầu thuê phòng
                      </span>
                    )}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem', fontWeight: 500 }}>
                    Chủ trọ sẽ nhận được yêu cầu và liên hệ lại qua SĐT của bạn.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRooms;
