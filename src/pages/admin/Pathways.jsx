import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';
import ParticipantModal from './ParticipantModal';

const Pathways = () => {
  const [pathways, setPathways] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Participant Modal State
  const [participantModal, setParticipantModal] = useState({ isOpen: false, itemId: null, itemTitle: '' });
  
  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialFormData = {
    pathwayCode: '', title: '', level: 'Beginner', instructor: '', description: '',
    image: '', price: 0, adminContact: '', isMandatory: false, isTemplate: false,
    learningProgram: '', category: '', contentCreator: '', tags: [], termsAndConditions: '',
    durationSettings: { type: 'Days', startDate: '', endDate: '', numberOfDays: 0 },
    status: 'draft',
    sections: [],
    enrollmentSettings: { 
      status: 'Open', quota: 0, approvalRequired: true, 
      allowReEnrollment: false, allowCancellation: true,
      formType: 'Standard',
      period: { status: 'Open', start: '', end: '' }
    },
    publishSettings: { mode: 'Unpublished', startDate: '', endDate: '' }
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchPathways = async () => {
    try {
      const { data } = await API.get('/admin/pathways');
      setPathways(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error(error); 
      setPathways([]);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [coursesRes, classesRes] = await Promise.all([
        API.get('/admin/courses'),
        API.get('/admin/classes')
      ]);
      setCourses(coursesRes.data);
      setClasses(classesRes.data);
    } catch (error) { console.error('Error fetching support data:', error); }
  };

  useEffect(() => { 
    fetchPathways(); 
    fetchSupportData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleAddSection = () => {
    const newSection = { title: '', description: '', durationType: 'Days', duration: 30, startDate: '', endDate: '', items: [] };
    setFormData({ ...formData, sections: [...formData.sections, newSection] });
  };

  const handleAddItemToSection = (sectionIndex) => {
    const newItem = { itemType: 'Course', refId: '', isMandatory: true };
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].items.push(newItem);
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleEdit = (path) => {
    // Ensure nested objects exist and refId is sanitized (if it's populated, get the ID)
    const sanitizedSections = (path.sections || []).map(section => ({
      ...section,
      items: (section.items || []).map(item => ({
        ...item,
        refId: item.refId?._id || item.refId // If refId is populated object, take _id, else take as is
      }))
    }));

    const sanitizedPath = {
      ...initialFormData,
      ...path,
      sections: sanitizedSections,
      durationSettings: { ...initialFormData.durationSettings, ...path.durationSettings },
      enrollmentSettings: { ...initialFormData.enrollmentSettings, ...path.enrollmentSettings },
      publishSettings: { ...initialFormData.publishSettings, ...path.publishSettings },
    };
    setFormData(sanitizedPath);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append basic fields
      const complexKeys = ['sections', 'durationSettings', 'enrollmentSettings', 'publishSettings', 'tags', 'attachments'];
      Object.keys(formData).forEach(key => {
        if (complexKeys.includes(key)) {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'image' && formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      // Append file if selected
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (formData._id) {
        await API.put(`/admin/pathways/${formData._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/admin/pathways', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      setFormData(initialFormData);
      setSelectedFile(null);
      fetchPathways();
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) { 
      console.error(error);
      alert('Error saving pathway: ' + (error.response?.data?.message || error.message)); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเส้นทางการเรียนรู้นี้?')) {
      try {
        await API.delete(`/admin/pathways/${id}`);
        fetchPathways();
      } catch (error) { 
        alert('เกิดข้อผิดพลาดในการลบเส้นทางการเรียนรู้: ' + (error.response?.data?.message || error.message)); 
      }
    }
  };

  // Filter and Paginate Data
  const filteredPathways = pathways.filter(path => 
    path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (path.pathwayCode && path.pathwayCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPathways.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPathways.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>ระบบจัดการเส้นทางการเรียนรู้</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(initialFormData); setShowModal(true); }}>+ สร้างเส้นทางการเรียนรู้ใหม่</button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="ค้นหาเส้นทางด้วยชื่อ หรือ รหัส..." 
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
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>เส้นทางการเรียนรู้</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>รหัส</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>ระดับ</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>โครงสร้าง</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>สถานะ</th>
              <th style={{ textAlign: 'right', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(path => (
                <tr key={path._id} className="hover-row">
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={path.image || 'https://placehold.co/40x40?text=Path'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600' }}>{path.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{path.pathwayCode}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className="badge badge-outline">{path.level}</span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                      <div>{path.sections?.length || 0} ส่วนเนื้อหา</div>
                      <div style={{ color: '#666' }}>{path.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0)} รายการ</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className={`badge ${path.status === 'publish' ? 'badge-success' : 'badge-warning'}`}>
                      {path.status === 'publish' ? 'เผยแพร่' : 'แบบร่าง'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => setParticipantModal({ isOpen: true, itemId: path._id, itemTitle: path.title })}>ผู้เข้าเรียน</button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => handleEdit(path)}>แก้ไข</button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(path._id)}>ลบ</button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>ไม่พบข้อมูลเส้นทางการเรียนรู้</td>
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

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '1000px', maxHeight: '95vh', overflowY: 'auto' }}>
            <h2>{formData._id ? 'แก้ไข' : 'สร้าง'} เส้นทางการเรียนรู้</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
              {[
                { id: 'basic', label: 'ข้อมูลพื้นฐาน' },
                { id: 'general', label: 'ข้อมูลทั่วไป' },
                { id: 'content-structure', label: 'โครงสร้างเนื้อหา' },
                { id: 'enrollment', label: 'การรับสมัคร' },
                { id: 'publish', label: 'การเผยแพร่' }
              ].map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 15px', border: 'none', background: 'none', borderBottom: activeTab === tab.id ? '3px solid var(--conicle-red)' : 'none', cursor: 'pointer', fontWeight: '600', color: activeTab === tab.id ? 'var(--conicle-red)' : '#666', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">รหัสเส้นทาง (ID)</label>
                    <input type="text" placeholder="เช่น PATH-001" className="form-control" value={formData.pathwayCode} onChange={e => setFormData({...formData, pathwayCode: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ชื่อเส้นทางการเรียนรู้ *</label>
                    <input type="text" placeholder="เช่น พัฒนาทักษะการจัดการข้อมูล" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">รูปแบบระยะเวลาการเรียน</label>
                    <select className="form-control" value={formData.durationSettings.type} onChange={e => setFormData({...formData, durationSettings: {...formData.durationSettings, type: e.target.value}})}>
                      <option value="Days">แบบกำหนดเป็นจำนวนวัน</option>
                      <option value="Fixed">แบบมีกำหนดวันที่เริ่มต้น – สิ้นสุด</option>
                    </select>
                  </div>

                  {formData.durationSettings.type === 'Days' ? (
                    <div className="form-group">
                      <label className="form-label">จำนวนวัน</label>
                      <input type="number" className="form-control" value={formData.durationSettings.numberOfDays} onChange={e => setFormData({...formData, durationSettings: {...formData.durationSettings, numberOfDays: parseInt(e.target.value)}})} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">วันที่เริ่มต้น</label>
                        <input type="date" className="form-control" value={formData.durationSettings.startDate ? formData.durationSettings.startDate.split('T')[0] : ''} onChange={e => setFormData({...formData, durationSettings: {...formData.durationSettings, startDate: e.target.value}})} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">วันที่สิ้นสุด</label>
                        <input type="date" className="form-control" value={formData.durationSettings.endDate ? formData.durationSettings.endDate.split('T')[0] : ''} onChange={e => setFormData({...formData, durationSettings: {...formData.durationSettings, endDate: e.target.value}})} />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">ระดับความยาก</label>
                    <select className="form-control" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                      <option value="Beginner">Beginner (ระดับต้น)</option>
                      <option value="Intermediate">Intermediate (ระดับกลาง)</option>
                      <option value="Advanced">Advanced (ระดับสูง)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">โปรแกรมการเรียน</label>
                    <input type="text" className="form-control" value={formData.learningProgram} onChange={e => setFormData({...formData, learningProgram: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่เนื้อหา</label>
                    <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ผู้ผลิตเนื้อหา</label>
                    <input type="text" className="form-control" value={formData.contentCreator} onChange={e => setFormData({...formData, contentCreator: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tag (แยกด้วยคอมมา)</label>
                    <input type="text" className="form-control" value={formData.tags.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={formData.isMandatory} onChange={e => setFormData({...formData, isMandatory: e.target.checked})} />
                      <span>เป็นหลักสูตรภาคบังคับ</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">คำอธิบายเส้นทางการเรียนรู้</label>
                    <textarea className="form-control" style={{ height: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เงื่อนไขและข้อกำหนดในการเรียน</label>
                    <textarea className="form-control" style={{ height: '100px' }} value={formData.termsAndConditions} onChange={e => setFormData({...formData, termsAndConditions: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ข้อมูลติดต่อผู้ดูแลหลักสูตร</label>
                    <input type="text" className="form-control" value={formData.adminContact} onChange={e => setFormData({...formData, adminContact: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={formData.isTemplate} onChange={e => setFormData({...formData, isTemplate: e.target.checked})} />
                      <span>ตั้งค่าให้หลักสูตรนี้เป็น Template ที่สามารถคัดลอกได้</span>
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

              {activeTab === 'content-structure' && (
                <div>
                  <button type="button" className="btn btn-outline" onClick={handleAddSection} style={{ marginBottom: '15px' }}>+ เพิ่มส่วนเนื้อหา (Section)</button>
                  {formData.sections?.map((section, sIdx) => (
                    <div key={sIdx} className="card" style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f9fafb' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '10px', marginBottom: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">ชื่อ Section</label>
                          <input type="text" className="form-control" style={{ fontWeight: 'bold' }} value={section.title} onChange={e => {
                            const updated = [...formData.sections];
                            updated[sIdx].title = e.target.value;
                            setFormData({...formData, sections: updated});
                          }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">รูปแบบเวลา</label>
                          <select className="form-control" value={section.durationType} onChange={e => {
                            const updated = [...formData.sections];
                            updated[sIdx].durationType = e.target.value;
                            setFormData({...formData, sections: updated});
                          }}>
                            <option value="Days">จำนวนวัน</option>
                            <option value="Fixed">ช่วงวันที่</option>
                          </select>
                        </div>
                        {section.durationType === 'Days' ? (
                          <div className="form-group">
                            <label className="form-label">ระบุจำนวนวัน</label>
                            <input type="number" className="form-control" value={section.duration} onChange={e => {
                              const updated = [...formData.sections];
                              updated[sIdx].duration = e.target.value;
                              setFormData({...formData, sections: updated});
                            }} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label">เริ่ม</label>
                              <input type="date" className="form-control" style={{ fontSize: '0.8rem' }} value={section.startDate ? section.startDate.split('T')[0] : ''} onChange={e => {
                                const updated = [...formData.sections];
                                updated[sIdx].startDate = e.target.value;
                                setFormData({...formData, sections: updated});
                              }} />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label">สิ้นสุด</label>
                              <input type="date" className="form-control" style={{ fontSize: '0.8rem' }} value={section.endDate ? section.endDate.split('T')[0] : ''} onChange={e => {
                                const updated = [...formData.sections];
                                updated[sIdx].endDate = e.target.value;
                                setFormData({...formData, sections: updated});
                              }} />
                            </div>
                          </div>
                        )}
                        <div className="form-group" style={{ gridColumn: 'span 3' }}>
                          <label className="form-label">คำอธิบาย Section</label>
                          <input type="text" className="form-control" value={section.description} onChange={e => {
                            const updated = [...formData.sections];
                            updated[sIdx].description = e.target.value;
                            setFormData({...formData, sections: updated});
                          }} />
                        </div>
                      </div>
                      
                      <div style={{ marginLeft: '20px', borderLeft: '2px solid var(--conicle-border)', paddingLeft: '20px' }}>
                        {section.items?.map((item, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 0.3 }}>
                              <label className="form-label">ประเภท</label>
                              <select className="form-control" value={item.itemType} onChange={e => {
                                const updated = [...formData.sections];
                                updated[sIdx].items[iIdx].itemType = e.target.value;
                                updated[sIdx].items[iIdx].refId = '';
                                setFormData({...formData, sections: updated});
                              }}>
                                <option value="Course">Course</option>
                                <option value="Class">Class Program</option>
                                <option value="Live">Live</option>
                                <option value="Activity">Activity</option>
                                <option value="Test">Test</option>
                                <option value="Survey">Survey</option>
                                <option value="Video">Video</option>
                                <option value="Audio">Audio</option>
                                <option value="YouTube">External Video (YouTube)</option>
                                <option value="Document">Document</option>
                                <option value="Article">Article</option>
                                <option value="FlashCard">Flash Card</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label">รายการ</label>
                              {item.itemType === 'Course' ? (
                                <select className="form-control" value={item.refId} onChange={e => {
                                  const updated = [...formData.sections];
                                  updated[sIdx].items[iIdx].refId = e.target.value;
                                  setFormData({...formData, sections: updated});
                                }}>
                                  <option value="">-- เลือกคอร์ส --</option>
                                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                              ) : item.itemType === 'Class' ? (
                                <select className="form-control" value={item.refId} onChange={e => {
                                  const updated = [...formData.sections];
                                  updated[sIdx].items[iIdx].refId = e.target.value;
                                  setFormData({...formData, sections: updated});
                                }}>
                                  <option value="">-- เลือกคลาส --</option>
                                  {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.title}</option>)}
                                </select>
                              ) : (
                                <input type="text" placeholder="รหัสอ้างอิง (ID)" className="form-control" value={item.refId} onChange={e => {
                                  const updated = [...formData.sections];
                                  updated[sIdx].items[iIdx].refId = e.target.value;
                                  setFormData({...formData, sections: updated});
                                }} />
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <label style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '600' }}>
                                <input type="checkbox" checked={item.isMandatory} onChange={e => {
                                  const updated = [...formData.sections];
                                  updated[sIdx].items[iIdx].isMandatory = e.target.checked;
                                  setFormData({...formData, sections: updated});
                                }} /> จำเป็น
                              </label>
                              <button type="button" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {
                                const updated = [...formData.sections];
                                updated[sIdx].items.splice(iIdx, 1);
                                setFormData({...formData, sections: updated});
                              }}>&times;</button>
                            </div>
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => handleAddItemToSection(sIdx)}>+ เพิ่มเนื้อหา</button>
                      </div>
                      <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button type="button" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => {
                          const updated = [...formData.sections];
                          updated.splice(sIdx, 1);
                          setFormData({...formData, sections: updated});
                        }}>ลบ Section นี้</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'enrollment' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">เลือกแบบฟอร์มการสมัครเรียน</label>
                    <select className="form-control" value={formData.enrollmentSettings.formType} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, formType: e.target.value}})}>
                      <option value="Standard">แบบฟอร์มมาตรฐาน</option>
                      <option value="Advanced">แบบฟอร์มละเอียด</option>
                      <option value="Custom">แบบฟอร์มกำหนดเอง</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ระยะเวลาการลงทะเบียน</label>
                    <select className="form-control" value={formData.enrollmentSettings.period.status} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: {...formData.enrollmentSettings.period, status: e.target.value}}})}>
                      <option value="Open">เปิด</option>
                      <option value="Closed">ปิด</option>
                      <option value="Scheduled">กำหนดเวลา (เปิด-ปิดอัตโนมัติ)</option>
                    </select>
                  </div>

                  {formData.enrollmentSettings.period.status === 'Scheduled' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">วันที่เริ่มลงทะเบียน</label>
                        <input type="datetime-local" className="form-control" value={formData.enrollmentSettings.period.start ? formData.enrollmentSettings.period.start.substring(0, 16) : ''} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: {...formData.enrollmentSettings.period, start: e.target.value}}})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">วันที่สิ้นสุดลงทะเบียน</label>
                        <input type="datetime-local" className="form-control" value={formData.enrollmentSettings.period.end ? formData.enrollmentSettings.period.end.substring(0, 16) : ''} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, period: {...formData.enrollmentSettings.period, end: e.target.value}}})} />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label">จำนวนที่นั่งและโควตา (0 = ไม่จำกัด)</label>
                    <input type="number" className="form-control" value={formData.enrollmentSettings.quota} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, quota: parseInt(e.target.value)}})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เงื่อนไขการขออนุมัติเรียน</label>
                    <select className="form-control" value={formData.enrollmentSettings.approvalRequired ? 'true' : 'false'} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, approvalRequired: e.target.value === 'true'}})}>
                      <option value="false">ไม่ต้องอนุมัติ (ลงทะเบียนแล้วเข้าเรียนได้เลย)</option>
                      <option value="true">ต้องได้รับการอนุมัติ</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <input type="checkbox" checked={formData.enrollmentSettings.allowReEnrollment} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowReEnrollment: e.target.checked}})} />
                      <span>อนุญาตให้ผู้ที่ถูกปฏิเสธลงทะเบียนซ้ำได้</span>
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={formData.enrollmentSettings.allowCancellation} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowCancellation: e.target.checked}})} />
                      <span>อนุญาตให้ผู้เรียนยกเลิกการลงทะเบียนในเส้นทางการเรียนรู้นั้นได้</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'publish' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">การตั้งค่าการเผยแพร่</label>
                    <select className="form-control" value={formData.publishSettings.mode} onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, mode: e.target.value}, status: e.target.value === 'Published' ? 'publish' : 'draft'})}>
                      <option value="Published">เผยแพร่ทันที</option>
                      <option value="Scheduled">ตั้งวันที่และเวลาที่ต้องการเผยแพร่</option>
                      <option value="Unpublished">ไม่เผยแพร่</option>
                    </select>
                  </div>

                  {formData.publishSettings.mode === 'Scheduled' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">เริ่มเผยแพร่</label>
                        <input type="datetime-local" className="form-control" value={formData.publishSettings.startDate ? formData.publishSettings.startDate.substring(0, 16) : ''} onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, startDate: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">สิ้นสุดการเผยแพร่</label>
                        <input type="datetime-local" className="form-control" value={formData.publishSettings.endDate ? formData.publishSettings.endDate.substring(0, 16) : ''} onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, endDate: e.target.value}})} />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{formData._id ? 'อัปเดต' : 'บันทึก'} เส้นทางการเรียนรู้</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ParticipantModal 
        isOpen={participantModal.isOpen}
        onClose={() => setParticipantModal({ ...participantModal, isOpen: false })}
        itemId={participantModal.itemId}
        itemTitle={participantModal.itemTitle}
        type="pathway"
      />
    </AdminLayout>
  );
};

export default Pathways;
