import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';
import ParticipantModal from './ParticipantModal';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showMainModal, setShowMainModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); 
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Participant Modal State
  const [participantModal, setParticipantModal] = useState({ isOpen: false, itemId: null, itemTitle: '' });
  
  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialFormData = {
    courseCode: '', title: '', level: 'Beginner', learningProgram: '', instructor: '', 
    category: '', contentCreator: '', isMandatory: false, description: '', 
    termsAndConditions: '', adminContact: '', isTemplate: false, price: 0, image: '',
    status: 'draft',
    tags: [],
    enrollmentSettings: { 
      formType: 'Standard',
      period: { status: 'Open', start: '', end: '' },
      quota: 0, 
      approvalRequired: true,
      allowReEnrollAfterReject: false,
      allowCancellation: true
    },
    publishSettings: { 
      mode: 'Immediate',
      startDate: '',
      endDate: ''
    }
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchCourses = async () => {
    try {
      const { data } = await API.get('/admin/courses');
      setCourses(data);
      if (formData._id) {
        const updated = data.find(c => c._id === formData._id);
        if (updated) setFormData(updated);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // List of keys that are objects/arrays and need stringifying
      const complexKeys = ['enrollmentSettings', 'publishSettings', 'tags', 'attachments'];
      
      Object.keys(formData).forEach(key => {
        if (complexKeys.includes(key)) {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'image' && key !== 'sections' && formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (formData._id) {
        await API.put(`/admin/courses/${formData._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const response = await API.post('/admin/courses', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(response.data); 
      }
      
      fetchCourses();
      setSelectedFile(null);
      if (activeTab !== 'basic' && activeTab !== 'details') alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      else setShowMainModal(false);
    } catch (error) { 
      console.error('Full Error Response:', error.response?.data);
      const detailMsg = error.response?.data?.message || error.message;
      const validationDetails = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
      const fullBody = error.response?.data ? JSON.stringify(error.response.data, null, 2) : '';
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + detailMsg + '\n\nFull Detail: ' + fullBody); 
    }
  };

  const handleAddSectionInline = async () => {
    if (!newSectionTitle) return;
    try {
      await API.post(`/admin/courses/${formData._id}/sections`, { title: newSectionTitle });
      setNewSectionTitle('');
      fetchCourses();
    } catch (error) { alert('Error adding section'); }
  };

  const handleAddLessonInline = async (sectionId) => {
    if (!newLessonData.title) return;
    try {
      await API.post(`/admin/courses/sections/${sectionId}/lessons`, newLessonData);
      setAddingLessonTo(null);
      setNewLessonData({ title: '', type: '', url: '' });
      fetchCourses();
    } catch (error) { alert('Error adding lesson'); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('ลบส่วนนี้และเนื้อหาภายในทั้งหมด?')) {
      try {
        await API.delete(`/admin/courses/sections/${sectionId}`);
        fetchCourses();
      } catch (error) { alert('Error deleting section'); }
    }
  };

  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (window.confirm('ลบบทเรียนนี้?')) {
      try {
        await API.delete(`/admin/courses/sections/${sectionId}/lessons/${lessonId}`);
        fetchCourses();
      } catch (error) { alert('Error deleting lesson'); }
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?')) {
      try {
        await API.delete(`/admin/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบคอร์ส');
      }
    }
  };

  // Filter and Paginate Data
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>ระบบจัดการคอร์ส</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(initialFormData); setActiveTab('basic'); setShowMainModal(true); }}>
          + สร้างคอร์สใหม่
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="ค้นหาคอร์สด้วยชื่อ, รหัส หรือผู้สอน..." 
          className="form-control" 
          style={{ maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ชื่อคอร์ส</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>รหัส</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ระดับ</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ผู้สอน</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>สถานะ</th>
              <th style={{ textAlign: 'right', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)', width: '350px' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(course => (
                <tr key={course._id} className="hover-row">
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={course.image || 'https://placehold.co/40x40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600' }}>{course.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{course.courseCode}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{course.level}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{course.instructor}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className={`badge ${course.status === 'publish' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                      {course.status === 'publish' ? 'เผยแพร่' : 'แบบร่าง'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="row-actions">
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => setParticipantModal({ isOpen: true, itemId: course._id, itemTitle: course.title })}>ผู้เข้าเรียน</button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => { setFormData(course); setActiveTab('content'); setShowMainModal(true); }}>เนื้อหาหลักสูตร</button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => { setFormData(course); setActiveTab('basic'); setShowMainModal(true); }}>แก้ไข</button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(course._id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>ไม่พบข้อมูลคอร์ส</td>
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

      {showMainModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: activeTab === 'content' ? '950px' : '800px' }}>
            <div className="modal-header">
              <h2>{formData._id ? 'แก้ไข' : 'สร้างใหม่'} คอร์ส {activeTab === 'content' && `: ${formData.title}`}</h2>
              <button className="btn" style={{ background: 'none', fontSize: '1.5rem' }} onClick={() => setShowMainModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="tabs">
                {[
                  { id: 'basic', label: 'ข้อมูลทั่วไป' },
                  { id: 'details', label: 'รายละเอียด' },
                  { id: 'content', label: 'เนื้อหาหลักสูตร' },
                  { id: 'enrollment', label: 'การรับสมัคร' },
                  { id: 'publish', label: 'การเผยแพร่' }
                ].map(tab => (
                  <div 
                    key={tab.id} 
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} 
                    onClick={() => {
                      if (tab.id === 'content' && !formData._id) {
                        alert('กรุณาบันทึกข้อมูลพื้นฐานคอร์สก่อนจัดการเนื้อหา');
                        return;
                      }
                      setActiveTab(tab.id);
                    }}
                    style={{ opacity: (tab.id === 'content' && !formData._id) ? 0.5 : 1 }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              <form id="course-form" onSubmit={handleSubmit}>
                {activeTab === 'basic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">ชื่อคอร์ส *</label>
                      <input type="text" className="form-control" placeholder="เช่น Basic SQL" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">รหัสคอร์ส (ID)</label>
                      <input type="text" className="form-control" placeholder="เช่น SQL-101" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ระดับความยาก</label>
                      <select className="form-control" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                        <option value="Beginner">ระดับต้น (Beginner)</option>
                        <option value="Intermediate">ระดับกลาง (Intermediate)</option>
                        <option value="Advanced">ระดับสูง (Advanced)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">โปรแกรมการเรียน</label>
                      <input type="text" className="form-control" value={formData.learningProgram} onChange={e => setFormData({...formData, learningProgram: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ราคา (บาท)</label>
                      <input type="number" className="form-control" placeholder="0 = ฟรี" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ผู้สอน</label>
                      <input type="text" className="form-control" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">หมวดหมู่</label>
                      <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ผู้ผลิตเนื้อหา</label>
                      <input type="text" className="form-control" value={formData.contentCreator} onChange={e => setFormData({...formData, contentCreator: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tag (คั่นด้วยคอมม่า)</label>
                      <input type="text" className="form-control" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '25px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.isMandatory} onChange={e => setFormData({...formData, isMandatory: e.target.checked})} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>หลักสูตรจำเป็น</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">คำอธิบายหลักสูตร</label>
                      <textarea className="form-control" style={{ height: '120px', resize: 'none' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">เงื่อนไขและข้อกำหนดในการเรียน</label>
                      <textarea className="form-control" style={{ height: '80px', resize: 'none' }} value={formData.termsAndConditions} onChange={e => setFormData({...formData, termsAndConditions: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ข้อมูลติดต่อผู้ดูแลหลักสูตร</label>
                      <input type="text" className="form-control" value={formData.adminContact} onChange={e => setFormData({...formData, adminContact: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.isTemplate} onChange={e => setFormData({...formData, isTemplate: e.target.checked})} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>ตั้งค่าให้คอร์สนี้เป็น Template</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label">รูปภาพหน้าปก</label>
                      <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                      {formData.image && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ fontSize: '0.8rem', color: '#666' }}>รูปปัจจุบัน:</p>
                          <img src={formData.image} alt="Current" style={{ width: '100px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'content' && formData._id && (
                  <div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--conicle-border)', marginBottom: '24px' }}>
                      <label className="form-label">สร้างส่วนเนื้อหาใหม่</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" className="form-control" placeholder="เช่น ส่วนที่ 1: บทนำ" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
                        <button type="button" className="btn btn-primary" onClick={handleAddSectionInline} style={{ whiteSpace: 'nowrap' }}>+ สร้างส่วน</button>
                      </div>
                    </div>

                    {formData.sections?.map((s, i) => (
                      <div key={s._id} className="card" style={{ marginBottom: '24px', padding: '24px', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: 'var(--conicle-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ background: 'var(--conicle-red)', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{i+1}</span>
                            {s.title}
                          </h4>
                          <button type="button" onClick={() => handleDeleteSection(s._id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>ลบส่วนนี้</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                          {s.lessons?.map((lesson, lIdx) => (
                            <div key={lesson._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #eee' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--conicle-text-muted)', width: '20px' }}>{lIdx+1}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{lesson.title}</div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>{lesson.type}</span>
                                  {lesson.url && <span style={{ fontSize: '0.65rem', color: 'var(--conicle-text-muted)', textDecoration: 'underline' }}>{lesson.url}</span>}
                                </div>
                              </div>
                              <button type="button" onClick={() => handleDeleteLesson(s._id, lesson._id)} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                            </div>
                          ))}
                          {(!s.lessons || s.lessons.length === 0) && addingLessonTo !== s._id && <p style={{color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '20px', border: '1px dashed #ddd', borderRadius: '10px'}}>ยังไม่มีบทเรียนในส่วนนี้</p>}
                        </div>

                        {addingLessonTo === s._id ? (
                          <div style={{ padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '10px', border: '1px solid #d1d5db' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">ชื่อบทเรียน</label>
                                <input type="text" className="form-control" value={newLessonData.title} onChange={e => setNewLessonData({...newLessonData, title: e.target.value})} placeholder="เช่น วิธีการใช้งานเบื้องต้น" />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">ประเภทเนื้อหา</label>
                                <select className="form-control" value={newLessonData.type} onChange={e => setNewLessonData({...newLessonData, type: e.target.value})}>
                                  <option value="">-- เลือกประเภท --</option>
                                  <option value="Video">Video (.mp4)</option>
                                  <option value="Audio">Audio (.mp3)</option>
                                  <option value="YouTube">External Video (YouTube)</option>
                                  <option value="Document">Document (.pdf)</option>
                                  <option value="Article">Article</option>
                                  <option value="FlashCard">Flash Card</option>
                                  <option value="SCORM">SCORM (V.1.2)</option>
                                  <option value="Weblink">Weblink</option>
                                  <option value="File">File</option>
                                  <option value="Test">Test</option>
                                  <option value="Survey">Survey</option>
                                  <option value="Activity">Activity</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">ลิงก์เนื้อหา (URL)</label>
                              <input type="text" className="form-control" value={newLessonData.url} onChange={e => setNewLessonData({...newLessonData, url: e.target.value})} placeholder="https://..." />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button type="button" className="btn btn-primary" onClick={() => handleAddLessonInline(s._id)} style={{ flex: 1 }}>บันทึกบทเรียน</button>
                              <button type="button" className="btn btn-outline" onClick={() => setAddingLessonTo(null)} style={{ flex: 1 }}>ยกเลิก</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '10px 20px', borderColor: 'var(--conicle-red)', color: 'var(--conicle-red)' }} onClick={() => setAddingLessonTo(s._id)}>+ เพิ่มบทเรียนใหม่</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'enrollment' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">เลือกแบบฟอร์มการสมัครเรียน</label>
                        <select className="form-control" value={formData.enrollmentSettings.formType || 'Standard'} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, formType: e.target.value}})}>
                          <option value="Standard">แบบฟอร์มมาตรฐาน</option>
                          <option value="Custom">แบบฟอร์มกำหนดเอง</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">กำหนดระยะเวลาการลงทะเบียน</label>
                        <select className="form-control" value={formData.enrollmentSettings.period?.status || 'Open'} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: { ...formData.enrollmentSettings.period, status: e.target.value }}})}>
                          <option value="Open">เปิดตลอด</option>
                          <option value="Closed">ปิดรับสมัคร</option>
                          <option value="Scheduled">กำหนดเวลา</option>
                        </select>
                      </div>
                    </div>

                    {formData.enrollmentSettings.period?.status === 'Scheduled' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div className="form-group">
                          <label className="form-label">วันเริ่มต้น</label>
                          <input type="datetime-local" className="form-control" 
                            value={formData.enrollmentSettings.period?.start ? new Date(formData.enrollmentSettings.period.start).toISOString().slice(0, 16) : ''} 
                            onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: { ...formData.enrollmentSettings.period, start: e.target.value }}})} 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">วันสิ้นสุด</label>
                          <input type="datetime-local" className="form-control" 
                            value={formData.enrollmentSettings.period?.end ? new Date(formData.enrollmentSettings.period.end).toISOString().slice(0, 16) : ''} 
                            onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: { ...formData.enrollmentSettings.period, end: e.target.value }}})} 
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">กำหนดจำนวนที่นั่งและโควตา (0 = ไม่จำกัด)</label>
                        <input type="number" className="form-control" value={formData.enrollmentSettings.quota} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, quota: parseInt(e.target.value) || 0}})} />
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings.allowReEnrollAfterReject} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowReEnrollAfterReject: e.target.checked}})} />
                        <span style={{ fontSize: '0.9rem' }}>อนุญาตให้ผู้ที่ถูกปฏิเสธลงทะเบียนซ้ำได้</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings.approvalRequired} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, approvalRequired: e.target.checked}})} />
                        <span style={{ fontSize: '0.9rem' }}>ต้องได้รับการอนุมัติก่อนเข้าเรียน (Approval Required)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings.allowCancellation} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowCancellation: e.target.checked}})} />
                        <span style={{ fontSize: '0.9rem' }}>อนุญาตให้ผู้เรียนยกเลิกการลงทะเบียนได้</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'publish' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">สถานะการมองเห็น</label>
                        <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                          <option value="draft">แบบร่าง (ส่วนตัว)</option>
                          <option value="publish">เผยแพร่ (สาธารณะ)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">รูปแบบการเผยแพร่</label>
                        <select className="form-control" value={formData.publishSettings?.mode || 'Immediate'} onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, mode: e.target.value}})}>
                          <option value="Immediate">เผยแพร่ทันที</option>
                          <option value="Scheduled">ตั้งเวลาเผยแพร่</option>
                          <option value="Unpublished">ไม่เผยแพร่</option>
                        </select>
                      </div>
                    </div>

                    {formData.publishSettings?.mode === 'Scheduled' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div className="form-group">
                          <label className="form-label">วันที่เริ่มต้นเผยแพร่</label>
                          <input type="datetime-local" className="form-control" 
                            value={formData.publishSettings?.startDate ? new Date(formData.publishSettings.startDate).toISOString().slice(0, 16) : ''} 
                            onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, startDate: e.target.value}})} 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">วันที่สิ้นสุดเผยแพร่</label>
                          <input type="datetime-local" className="form-control" 
                            value={formData.publishSettings?.endDate ? new Date(formData.publishSettings.endDate).toISOString().slice(0, 16) : ''} 
                            onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, endDate: e.target.value}})} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowMainModal(false)}>ปิด</button>
              {activeTab !== 'content' && (
                <button type="submit" form="course-form" className="btn btn-primary">{formData._id ? 'อัปเดต' : 'บันทึก'} คอร์ส</button>
              )}
            </div>
          </div>
        </div>
      )}

      <ParticipantModal 
        isOpen={participantModal.isOpen}
        onClose={() => setParticipantModal({ ...participantModal, isOpen: false })}
        itemId={participantModal.itemId}
        itemTitle={participantModal.itemTitle}
        type="course"
      />
    </AdminLayout>
  );
};

export default Courses;
