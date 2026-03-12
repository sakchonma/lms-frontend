import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ParticipantModal = ({ isOpen, onClose, itemId, type, itemTitle }) => {
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
      fetchAllUsers();
    }
  }, [isOpen, itemId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users/participants?type=${type}&itemId=${itemId}`);
      setEnrolledUsers(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleManage = async (userId, action) => {
    try {
      await API.post('/admin/users/participants/manage', {
        userId,
        itemId,
        type,
        action
      });
      fetchParticipants();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!isOpen) return null;

  const nonEnrolledUsers = allUsers.filter(u => 
    !enrolledUsers.some(eu => eu._id === u._id) &&
    (u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
      <div className="card" style={{ width: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>จัดการผู้เข้าเรียน: {itemTitle}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Enrolled Users List */}
          <div style={{ padding: '24px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
            <h4 style={{ marginTop: 0, marginBottom: '16px' }}>ผู้ที่ลงทะเบียนแล้ว ({enrolledUsers.length})</h4>
            {loading ? <p>กำลังโหลด...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {enrolledUsers.map(user => (
                  <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ color: '#666' }}>{user.email}</div>
                    </div>
                    <button 
                      onClick={() => handleManage(user._id, 'remove')}
                      style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      ลบออก
                    </button>
                  </div>
                ))}
                {enrolledUsers.length === 0 && <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>ยังไม่มีผู้ลงทะเบียน</p>}
              </div>
            )}
          </div>

          {/* Add New Users */}
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginTop: 0, marginBottom: '16px' }}>เพิ่มผู้เข้าเรียนใหม่</h4>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหรืออีเมล..." 
              className="form-control" 
              style={{ marginBottom: '16px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nonEnrolledUsers.slice(0, 20).map(user => (
                <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</div>
                    <div style={{ color: '#666' }}>{user.email}</div>
                  </div>
                  <button 
                    onClick={() => handleManage(user._id, 'add')}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                  >
                    เพิ่ม
                  </button>
                </div>
              ))}
              {searchTerm && nonEnrolledUsers.length === 0 && <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>ไม่พบรายชื่อที่ค้นหา</p>}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>เสร็จสิ้น</button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;
