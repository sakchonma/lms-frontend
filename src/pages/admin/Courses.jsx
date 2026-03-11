import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'draft', image: '' });
  
  // State สำหรับเพิ่ม Section/Lesson
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLesson, setNewLesson] = useState({ title: '', type: 'video', videoUrl: '', content: '' });

  const fetchCourses = async () => {
    try {
      const { data } = await API.get('/admin/courses');
      setCourses(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/courses', formData);
      setShowMainModal(false);
      setFormData({ title: '', description: '', status: 'draft', image: '' });
      fetchCourses();
    } catch (error) { alert('Error creating course'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanent delete this course?')) {
      try {
        await API.delete(`/admin/courses/${id}`);
        fetchCourses();
      } catch (error) { 
        alert('Delete Failed: ' + (error.response?.data?.message || error.message)); 
      }
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle) return;
    try {
      await API.post(`/admin/courses/${selectedCourse._id}/sections`, { title: newSectionTitle });
      setNewSectionTitle('');
      // Refresh selected course data
      const { data } = await API.get('/admin/courses');
      setCourses(data);
      setSelectedCourse(data.find(c => c._id === selectedCourse._id));
    } catch (error) { alert('Error adding section'); }
  };

  const handleAddLesson = async (sectionId) => {
    if (!newLesson.title) return;
    try {
      await API.post(`/admin/courses/sections/${sectionId}/lessons`, newLesson);
      setNewLesson({ title: '', type: 'video', videoUrl: '', content: '' });
      // Refresh
      const { data } = await API.get('/admin/courses');
      setCourses(data);
      setSelectedCourse(data.find(c => c._id === selectedCourse._id));
    } catch (error) { alert('Error adding lesson'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Course Management</h1>
        <button className="btn btn-primary" onClick={() => setShowMainModal(true)}>+ Create Course</button>
      </div>

      {/* Modal สร้างคอร์ส */}
      {showMainModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '450px' }}>
            <h2>Create New Course</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Course Title" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" style={{ width: '100%', marginBottom: '10px', padding: '8px', height: '80px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <input type="text" placeholder="Image URL" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
              <select style={{ width: '100%', marginBottom: '20px', padding: '8px' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#ccc' }} onClick={() => setShowMainModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal จัดการเนื้อหา (Manage Contents) */}
      {showContentModal && selectedCourse && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Manage Content: {selectedCourse.title}</h2>
              <button onClick={() => setShowContentModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4>+ Add New Section</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Section Title (e.g. Getting Started)" style={{ flex: 1, padding: '8px' }} value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
                <button onClick={handleAddSection} className="btn btn-primary">Add</button>
              </div>
            </div>

            {selectedCourse.sections?.map((section, sIdx) => (
              <div key={section._id} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Section {sIdx + 1}: {section.title}</h3>
                
                {/* รายการ Lesson */}
                <div style={{ marginLeft: '20px' }}>
                  {section.lessons?.map((lesson, lIdx) => (
                    <div key={lesson._id} style={{ padding: '8px', borderBottom: '1px solid #ddd', fontSize: '0.9rem' }}>
                      {lIdx + 1}. {lesson.title} ({lesson.type})
                    </div>
                  ))}
                  
                  {/* ฟอร์มเพิ่ม Lesson */}
                  <div style={{ marginTop: '15px', padding: '10px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>Add Lesson to this Section</p>
                    <input type="text" placeholder="Lesson Title" style={{ width: '100%', marginBottom: '5px', padding: '5px' }} value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                    <input type="text" placeholder="Video URL (Optional)" style={{ width: '100%', marginBottom: '5px', padding: '5px' }} value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} />
                    <button onClick={() => handleAddLesson(section._id)} className="btn" style={{ fontSize: '0.7rem', backgroundColor: '#334155', color: 'white' }}>+ Add Lesson</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {courses.map(course => (
          <div key={course._id} className="card">
            <img 
              src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} 
              alt={course.title} 
              style={{ width: '100%', borderRadius: '8px', height: '140px', objectFit: 'cover' }} 
            />
            <h3 style={{ margin: '10px 0' }}>{course.title}</h3>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', backgroundColor: course.status === 'publish' ? '#dcfce7' : '#fee2e2', color: course.status === 'publish' ? '#166534' : '#991b1b' }}>
              {course.status.toUpperCase()}
            </span>
            <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => { setSelectedCourse(course); setShowContentModal(true); }}
                className="btn" 
                style={{ fontSize: '0.7rem', flex: 1, backgroundColor: '#e2e8f0' }}
              >
                Manage Contents
              </button>
              <button 
                onClick={() => handleDelete(course._id)}
                className="btn" 
                style={{ fontSize: '0.7rem', color: 'red', border: '1px solid #fee2e2' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Courses;
