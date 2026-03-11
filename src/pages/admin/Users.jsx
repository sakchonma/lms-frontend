import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'learner' });

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
    if (window.confirm('Move this user to trash?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>+ Create User</button>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Username" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              <input type="email" placeholder="Email" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              {!editingUser && <input type="password" placeholder="Password" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="First Name" style={{ flex: 1, marginBottom: '10px', padding: '8px' }} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                <input type="text" placeholder="Last Name" style={{ flex: 1, marginBottom: '10px', padding: '8px' }} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
              <select style={{ width: '100%', marginBottom: '20px', padding: '8px' }} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="learner">Learner</option>
                <option value="admin">Admin</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#ccc' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px', padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px' }}>{user.firstName} {user.lastName}</td>
                <td style={{ padding: '15px' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>{user.role}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(user._id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Users;
