import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    type: 'avatar',
    requiredLevel: 1,
    description: ''
  });

  const fetchRewards = async () => {
    try {
      const res = await API.get('/admin/rewards');
      setRewards(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/rewards', formData);
      setShowModal(false);
      setFormData({ name: '', image: '', type: 'avatar', requiredLevel: 1, description: '' });
      fetchRewards();
    } catch (error) {
      alert('Error creating reward');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await API.delete(`/admin/rewards/${id}`);
        fetchRewards();
      } catch (error) {
        alert('Error deleting reward');
      }
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Reward Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Reward</button>
      </div>

      {loading ? (
        <p>Loading rewards...</p>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>Level Required</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map(reward => (
                <tr key={reward._id}>
                  <td>
                    <img src={reward.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ fontWeight: '700' }}>{reward.name}</td>
                  <td>
                    <span className="badge" style={{ background: '#eee', color: '#333' }}>{reward.type.toUpperCase()}</span>
                  </td>
                  <td><span style={{ fontWeight: '800', color: 'var(--conicle-red)' }}>LVL {reward.requiredLevel}</span></td>
                  <td style={{ color: '#666', fontSize: '0.85rem' }}>{reward.description}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(reward._id)}
                      style={{ border: 'none', background: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>New Reward</h2>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Reward Name</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-control"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="avatar">Avatar</option>
                    <option value="frame">Frame</option>
                    <option value="badge">Badge</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level Required</label>
                  <input 
                    type="number" className="form-control" required min="1"
                    value={formData.requiredLevel} onChange={e => setFormData({...formData, requiredLevel: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Reward</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Rewards;
