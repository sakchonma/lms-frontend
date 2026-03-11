import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Enrollments = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/admin/users/enrollments');
      setRequests(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId, courseId, action) => {
    try {
      await API.post(`/admin/users/enrollments/${action}`, { userId, courseId });
      alert(`Enrollment ${action}d successfully`);
      fetchRequests();
    } catch (error) { alert('Error processing request'); }
  };

  return (
    <AdminLayout>
      <h1>Enrollment Requests</h1>
      <p style={{ color: '#64748b' }}>Approve or reject students' requests to join courses.</p>
      
      <div className="card" style={{ marginTop: '20px', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Requested Course</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No pending requests</td></tr>
            ) : (
              requests.map((req, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px' }}>{req.userName}</td>
                  <td style={{ padding: '15px' }}>{req.userEmail}</td>
                  <td style={{ padding: '15px' }}><strong>{req.courseTitle}</strong></td>
                  <td style={{ padding: '15px' }}>
                    <button onClick={() => handleAction(req.userId, req.courseId, 'approve')} className="btn" style={{ backgroundColor: '#10b981', color: 'white', marginRight: '10px', fontSize: '0.8rem' }}>Approve</button>
                    <button onClick={() => handleAction(req.userId, req.courseId, 'reject')} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.8rem' }}>Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Enrollments;
