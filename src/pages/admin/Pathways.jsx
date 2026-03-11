import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Pathways = () => {
  const [pathways, setPathways] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', pathwayCourses: [] });

  const fetchData = async () => {
    try {
      const resPath = await API.get('/admin/pathways');
      const resCourse = await API.get('/admin/courses');
      setPathways(resPath.data || []);
      setCourses(resCourse.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCourseToPath = (courseId) => {
    if (!courseId) return;
    // ป้องกันการเพิ่มคอร์สซ้ำ (เช็คแบบทนทานต่อ Missing Data)
    const exists = formData.pathwayCourses.some(c => {
      const id = c.courseId?._id || c.courseId;
      return id?.toString() === courseId.toString();
    });
    if (exists) return;
    
    setFormData({
      ...formData,
      pathwayCourses: [...formData.pathwayCourses, { courseId, order: formData.pathwayCourses.length + 1 }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // กรองเฉพาะคอร์สที่มีอยู่จริงส่งไป Backend
    const cleanCourses = formData.pathwayCourses
      .filter(c => (c.courseId?._id || c.courseId))
      .map((c, i) => ({ 
        courseId: c.courseId?._id || c.courseId, 
        order: i + 1 
      }));

    const payload = {
      title: formData.title,
      description: formData.description,
      courses: cleanCourses
    };

    try {
      if (editingId) {
        await API.put(`/admin/pathways/${editingId}`, payload);
      } else {
        await API.post('/admin/pathways', payload);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', description: '', pathwayCourses: [] });
      fetchData();
    } catch (error) { alert('Error saving pathway'); }
  };

  const handleEdit = (path) => {
    // กรองเอาคอร์สที่อาจจะถูกลบออกก่อนจะเปิดหน้า Edit
    const validExistingCourses = (path.courses || []).filter(c => c.courseId !== null);
    
    setEditingId(path._id);
    setFormData({
      title: path.title || '',
      description: path.description || '',
      pathwayCourses: validExistingCourses
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this pathway?')) {
      try {
        await API.delete(`/admin/pathways/${id}`);
        fetchData();
      } catch (error) { alert('Error deleting pathway'); }
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Learning Pathways</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', pathwayCourses: [] }); setShowModal(true); }}>
          + Create Pathway
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingId ? 'Edit Pathway' : 'New Sequential Pathway'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Pathway Title" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" style={{ width: '100%', marginBottom: '10px', padding: '8px', height: '80px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              
              <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                <h4>Add Courses in Order</h4>
                <select style={{ width: '100%', padding: '8px' }} onChange={(e) => handleAddCourseToPath(e.target.value)} value="">
                  <option value="">-- Choose Course to Add --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
                
                <div style={{ marginTop: '10px' }}>
                  {formData.pathwayCourses.map((pc, idx) => {
                    const cInfo = courses.find(c => c._id === (pc.courseId?._id || pc.courseId));
                    if (!cInfo) return null; // ข้ามถ้าไม่เจอคอร์ส
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', backgroundColor: '#f8fafc', marginBottom: '5px', borderRadius: '4px' }}>
                        <span>{idx + 1}. {cInfo.title}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, pathwayCourses: formData.pathwayCourses.filter((_, i) => i !== idx) })} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Save'} Pathway</button>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#ccc' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {pathways.map(path => (
          <div key={path._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{path.title}</h3>
                <div>
                  <button onClick={() => handleEdit(path)} style={{ color: 'blue', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handleDelete(path._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '10px' }}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{path.description}</p>
              <hr />
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem' }}>
                {path.courses?.map((c, i) => (
                  <li key={i}>{c.courseId?.title || <span style={{color:'red'}}>Course Deleted</span>}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Pathways;
