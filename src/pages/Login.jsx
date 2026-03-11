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
      alert('Login Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleLogin} className="card" style={{ width: '350px' }}>
        <h2 style={{ textAlign: 'center' }}>LMS Login</h2>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input type="email" style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
    </div>
  );
};

export default Login;
