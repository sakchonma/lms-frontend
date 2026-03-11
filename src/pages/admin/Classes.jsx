import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', course: '', schedule: '' });

  const fetchData = async () => {
    try {
      const resClasses = await API.get('/admin/classes');
      const resCourses = await API.get('/admin/courses');
      setClasses(resClasses.data);
      setCourses(resCourses.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/classes', formData);
      setShowModal(false);
      setFormData({ title: '', course: '', schedule: '' });
      fetchData();
    } catch (error) { alert('Error creating class'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Class Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Class</button>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2>Create New Class</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Class Name (e.g. Batch A)" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              <select style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <input type="text" placeholder="Schedule (e.g. Mon-Fri 9:00)" style={{ width: '100%', marginBottom: '20px', padding: '8px' }} value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#ccc' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Class Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Course</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Students</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px' }}>{cls.title}</td>
                <td style={{ padding: '15px' }}>{cls.course?.title}</td>
                <td style={{ padding: '15px' }}>{cls.users?.length || 0} enrolled</td>
                <td style={{ padding: '15px' }}>{cls.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Classes;
