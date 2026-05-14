import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Home, Plus, Edit2, Trash2, Image as ImageIcon, X, Maximize, Upload, Loader } from 'lucide-react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  
  const [formData, setFormData] = useState({ 
    roomCode: '', 
    name: '', 
    area: '', 
    price: '', 
    description: '',
    address: '',
    status: 'Available',
    existingUrls: [],   // URLs already saved on server (edit mode)
    selectedFiles: [],  // new File objects chosen by user
    previewUrls: []     // object URLs for local preview
  });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Room/GetAllRooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const getImages = (room) => {
    const imgs = room.images || room.Images || [];
    return imgs.map(img => img.imageUrl || img.ImageUrl);
  };

  const handleOpenModal = (room = null) => {
    // Revoke any lingering object URLs to free memory
    formData.previewUrls.forEach(u => URL.revokeObjectURL(u));
    if (room) {
      setIsEditing(true);
      setCurrentRoomCode(room.roomCode || room.RoomCode);
      const existingImgs = getImages(room);
      setFormData({
        roomCode: room.roomCode || room.RoomCode,
        name: room.name || room.Name || '',
        area: room.area || room.Area || '',
        price: room.price || room.Price || '',
        description: room.description || room.Description || '',
        address: room.address || room.Address || '',
        status: room.status || room.Status || 'Available',
        existingUrls: existingImgs,
        selectedFiles: [],
        previewUrls: []
      });
    } else {
      setIsEditing(false);
      setFormData({ 
        roomCode: '', name: '', area: '', price: '', 
        description: '', address: '', status: 'Available',
        existingUrls: [], selectedFiles: [], previewUrls: []
      });
    }
    setShowModal(true);
  };

  /* ── file picker handler ── */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setFormData(f => ({
      ...f,
      selectedFiles: [...f.selectedFiles, ...files],
      previewUrls: [...f.previewUrls, ...newPreviews]
    }));
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  /* ── remove a newly-selected (not-yet-uploaded) file ── */
  const handleRemoveNewFile = (index) => {
    URL.revokeObjectURL(formData.previewUrls[index]);
    setFormData(f => ({
      ...f,
      selectedFiles: f.selectedFiles.filter((_, i) => i !== index),
      previewUrls: f.previewUrls.filter((_, i) => i !== index)
    }));
  };

  /* ── remove an already-saved URL (edit mode) ── */
  const handleRemoveExisting = (index) => {
    setFormData(f => ({
      ...f,
      existingUrls: f.existingUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let uploadedUrls = [];

      // Upload new files if any
      if (formData.selectedFiles.length > 0) {
        const fd = new FormData();
        formData.selectedFiles.forEach(f => fd.append('files', f));
        const res = await api.post('/Room/UploadImages', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = res.data.urls || [];
      }

      const allImageUrls = [...formData.existingUrls, ...uploadedUrls];

      const payload = {
        RoomCode: formData.roomCode,
        Name: formData.name,
        Area: parseFloat(formData.area),
        Price: parseFloat(formData.price),
        Description: formData.description,
        Address: formData.address,
        Status: formData.status,
        Images: allImageUrls
      };

      if (isEditing) {
        await api.put(`/Room/UpdateRoom/${currentRoomCode}`, payload);
      } else {
        await api.post('/Room/AddRoom', payload);
      }

      // Revoke local preview URLs
      formData.previewUrls.forEach(u => URL.revokeObjectURL(u));
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu thông tin phòng');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (roomCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ${roomCode}?`)) return;
    try {
      await api.delete(`/Room/DeleteRoom/${roomCode}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa phòng');
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý phòng trọ</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Thêm phòng mới
        </button>
      </div>

      <div className="room-grid">
        {loading ? (
          <p className="col-span-full text-center py-10">Đang tải danh sách phòng...</p>
        ) : rooms.length === 0 ? (
          <div className="col-span-full card text-center py-20">
             <Home size={48} className="mx-auto mb-4 text-muted opacity-20" />
             <p className="text-muted">Bạn chưa có phòng nào. Hãy thêm phòng mới!</p>
          </div>
        ) : rooms.map((room) => {
          const roomCode = room.roomCode || room.RoomCode;
          const roomName = room.name || room.Name || `Phòng ${roomCode}`;
          const roomStatus = room.status || room.Status;
          const imgs = getImages(room);

          return (
            <div key={room.id || room.Id} className="card p-0 overflow-hidden hover-scale">
              <div style={{ aspectRatio: '1 / 1', backgroundColor: '#f1f5f9', position: 'relative' }}>
                {imgs.length > 0 ? (
                  <img 
                    src={imgs[0]} 
                    alt={roomName} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted opacity-30">
                    <ImageIcon size={48} />
                    <span className="text-xs mt-2">Chưa có ảnh</span>
                  </div>
                )}
                {imgs.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>
                    +{imgs.length - 1} ảnh khác
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`badge ${roomStatus === 'Available' || roomStatus === 'Trống' ? 'badge-active' : 'badge-pending'}`}>
                    {roomStatus === 'Available' || roomStatus === 'Trống' ? 'Trống' : 'Đang thuê'}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{roomName}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Maximize size={14} /> {room.area || room.Area} m²
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {(room.price || room.Price)?.toLocaleString()} đ/tháng
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button className="btn btn-outline btn-sm w-full" onClick={() => handleOpenModal(room)}><Edit2 size={14} /> Sửa</button>
                  <button className="btn btn-outline btn-sm w-full" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(roomCode)}><Trash2 size={14} /> Xóa</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{isEditing ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Mã phòng</label>
                <input type="text" className="w-full p-2 border rounded-lg mt-1" value={formData.roomCode} onChange={(e) => setFormData({...formData, roomCode: e.target.value})} required disabled={isEditing} />
              </div>
              <div>
                <label className="label">Tên phòng</label>
                <input type="text" className="w-full p-2 border rounded-lg mt-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="label">Diện tích (m²)</label>
                <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} required />
              </div>
              <div>
                <label className="label">Giá thuê (VNĐ)</label>
                <input type="number" className="w-full p-2 border rounded-lg mt-1" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <label className="label">Địa chỉ</label>
                <input type="text" className="w-full p-2 border rounded-lg mt-1" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>

              {/* ── Image Upload Section ── */}
              <div className="md:col-span-2">
                <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Ảnh phòng</label>

                {/* Drop zone / picker trigger */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <Upload size={24} style={{ margin: '0 auto 0.4rem', color: '#94a3b8' }} />
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                    Nhấn để chọn ảnh từ máy
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>JPG, PNG, WEBP – Có thể chọn nhiều ảnh cùng lúc</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {/* Thumbnail grid */}
                {(formData.existingUrls.length > 0 || formData.previewUrls.length > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {/* Already-saved images */}
                    {formData.existingUrls.map((url, i) => (
                      <div key={`ex-${i}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(i)}
                          style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            background: '#ef4444', border: 'none', borderRadius: '50%',
                            width: '20px', height: '20px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {/* New preview images */}
                    {formData.previewUrls.map((url, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px dashed var(--primary)' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(i)}
                          style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            background: '#ef4444', border: 'none', borderRadius: '50%',
                            width: '20px', height: '20px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">Mô tả</label>
                <textarea className="w-full p-2 border rounded-lg mt-1" rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="md:col-span-2 flex gap-2 pt-4">
                <button type="button" className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary w-full" disabled={uploading}>
                  {uploading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải ảnh...
                    </span>
                  ) : (isEditing ? 'Cập nhật' : 'Lưu phòng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
