import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lock, Mail, AlertCircle, User, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'Tenant' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Account/Dangki', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setSuccess(res.data.message);
      if (formData.role === 'Tenant') {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-main)',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="avatar" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <LayoutDashboard size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>Tham gia QLPT Pro</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tạo tài khoản mới để bắt đầu</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email / Username</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Mail size={18} className="text-muted" />
              <input 
                type="text" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="Nhập email hoặc username"
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Mật khẩu</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Lock size={18} className="text-muted" />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                placeholder="••••••••"
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Xác nhận mật khẩu</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Lock size={18} className="text-muted" />
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                placeholder="••••••••"
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Tôi là...</label>
            <div className="flex gap-2">
              <button 
                type="button"
                className={`btn w-full ${formData.role === 'Tenant' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFormData({...formData, role: 'Tenant'})}
              >
                Khách thuê
              </button>
              <button 
                type="button"
                className={`btn w-full ${formData.role === 'Landlord' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFormData({...formData, role: 'Landlord'})}
              >
                Chủ nhà
              </button>
            </div>
            {formData.role === 'Landlord' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                * Tài khoản chủ nhà cần Admin phê duyệt mới có thể đăng nhập.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mb-4" 
            disabled={loading}
            style={{ padding: '0.75rem' }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký Tài Khoản'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Đã có tài khoản?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              style={{ color: 'var(--primary)', fontWeight: '600' }}
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
