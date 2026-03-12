import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('lms_token', data.token);
      localStorage.setItem('lms_role', data.role);
      
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/learner/home');
      }
    } catch (error) {
      alert('เข้าสู่ระบบล้มเหลว: ' + (error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <form onSubmit={handleLogin} className="card" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--conicle-red)' }}>Conicle</h2>
          <p style={{ margin: 0, color: 'var(--conicle-text-muted)', fontSize: '0.9rem' }}>เข้าสู่ระบบเพื่อจัดการการเรียนรู้</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">อีเมล</label>
          <input type="email" placeholder="ระบุอีเมลของคุณ" className="form-control" 
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label className="form-label">รหัสผ่าน</label>
          <input type="password" placeholder="ระบุรหัสผ่าน" className="form-control" 
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
};

export default Login;
