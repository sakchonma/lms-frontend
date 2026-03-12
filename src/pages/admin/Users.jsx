import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'learner' });

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await API.put(`/admin/users/${editingUser._id}`, formData);
      } else {
        await API.post('/admin/users', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'learner' });
      fetchUsers();
    } catch (error) { alert(error.response?.data?.message || 'Error saving user'); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...user, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  // Filter and Paginate Data
  const filteredUsers = users.filter(user => 
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>จัดการผู้ใช้งาน</h1>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>+ สร้างผู้ใช้งาน</button>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="ค้นหาผู้ใช้งานด้วยชื่อ, อีเมล หรือชื่อผู้ใช้..." 
          className="form-control" 
          style={{ maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '450px', padding: '32px' }}>
            <h2 style={{ marginTop: 0 }}>{editingUser ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้งานใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้ (Username)</label>
                <input type="text" placeholder="ระบุชื่อผู้ใช้" className="form-control" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input type="email" placeholder="ระบุอีเมล" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">รหัสผ่าน</label>
                  <input type="password" placeholder="ระบุรหัสผ่าน" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">ชื่อ</label>
                  <input type="text" placeholder="ระบุชื่อ" className="form-control" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">นามสกุล</label>
                  <input type="text" placeholder="ระบุนามสกุล" className="form-control" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">บทบาท</label>
                <select className="form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="learner">ผู้เรียน (Learner)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>บันทึก</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px', padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ชื่อ-นามสกุล</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>อีเมล</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>บทบาท</th>
              <th style={{ textAlign: 'right', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(user => (
                <tr key={user._id} className="hover-row">
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', fontWeight: '600' }}>{user.firstName} {user.lastName}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{user.email}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เรียน'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', textAlign: 'right' }}>
                    <div className="row-actions">
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => handleEdit(user)}>แก้ไข</button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(user._id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>ไม่พบข้อมูลผู้ใช้งาน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '10px' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ก่อนหน้า
          </button>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            ถัดไป
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;
