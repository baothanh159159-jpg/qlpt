import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Landlord') navigate('/landlord');
      else navigate('/tenant');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-main)' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="avatar" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <LayoutDashboard size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>QLPT Pro</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Đăng nhập vào hệ thống quản lý</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email / Username</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Mail size={18} className="text-muted" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email hoặc username"
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Mật khẩu</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
              <Lock size={18} className="text-muted" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-none outline-none text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mb-4" 
            disabled={loading}
            style={{ padding: '0.75rem' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Chưa có tài khoản?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              style={{ color: 'var(--primary)', fontWeight: '600' }}
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
