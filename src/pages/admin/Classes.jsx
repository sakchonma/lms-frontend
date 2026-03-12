import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';
import ParticipantModal from './ParticipantModal';

const Classes = () => {
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
    classCode: '', title: '', level: 'Beginner', learningProgram: '', instructor: '', 
    category: '', contentCreator: '', isMandatory: false, description: '', 
    termsAndConditions: '', adminContact: '', isTemplate: false, price: 0, image: '',
    status: 'upcoming',
    enrollmentLogic: 'Single',
    approvalMode: 'Automatic',
    rounds: [],
    checkInSettings: { mode: 'Single', qrCodeType: 'Round', enabled: true },
    enrollmentSettings: { 
      status: 'Open', quota: 0, approvalRequired: true, 
      allowReEnrollAfterReject: false, allowCancellation: true, 
      autoCancelIfLowEnrollment: false 
    },
    publishSettings: { mode: 'Immediate' }
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/admin/classes');
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error(error); 
      setClasses([]);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleAddRound = () => {
    const newRound = { title: '', type: 'Class', start: '', end: '', location: '', url: '', room: '', instructor: '', description: '' };
    setFormData({ ...formData, rounds: [...formData.rounds, newRound] });
  };

  const handleRoundChange = (index, field, value) => {
    const updatedRounds = [...formData.rounds];
    updatedRounds[index][field] = value;
    setFormData({ ...formData, rounds: updatedRounds });
  };

  const handleEdit = (cls) => {
    setFormData({ ...cls });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append basic fields
      const complexKeys = ['rounds', 'checkInSettings', 'enrollmentSettings', 'publishSettings', 'tags', 'attachments'];
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
        await API.put(`/admin/classes/${formData._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/admin/classes', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      setFormData(initialFormData);
      setSelectedFile(null);
      fetchClasses();
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) { 
      console.error(error);
      alert('Error saving class program: ' + (error.response?.data?.message || error.message)); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรแกรมคลาสเรียนนี้?')) {
      try {
        await API.delete(`/admin/classes/${id}`);
        fetchClasses();
      } catch (error) { 
        alert('เกิดข้อผิดพลาดในการลบโปรแกรมคลาสเรียน: ' + (error.response?.data?.message || error.message)); 
      }
    }
  };

  // Filter and Paginate Data
  const filteredClasses = classes.filter(cls => 
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.classCode && cls.classCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.instructor && cls.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>ระบบจัดการโปรแกรมคลาสเรียน</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(initialFormData); setActiveTab('basic'); setShowModal(true); }}>+ สร้างโปรแกรมคลาสเรียนใหม่</button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="ค้นหาคลาสด้วยชื่อ, รหัส หรือผู้สอน..." 
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
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>โปรแกรมคลาสเรียน</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>รหัส</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>ผู้สอน</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>รอบอบรม</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>สถานะ</th>
              <th style={{ textAlign: 'right', padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--conicle-border)' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(cls => (
                <tr key={cls._id} className="hover-row">
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={cls.image || 'https://placehold.co/40x40'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600' }}>{cls.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{cls.classCode}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>{cls.instructor}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className="badge badge-info">{cls.rounds?.length || 0} รอบ</span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span className={`badge ${cls.publishSettings?.mode === 'Immediate' ? 'badge-success' : 'badge-warning'}`}>
                      {cls.publishSettings?.mode === 'Immediate' ? 'เผยแพร่' : 'รอการเผยแพร่'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => setParticipantModal({ isOpen: true, itemId: cls._id, itemTitle: cls.title })}>ผู้เข้าเรียน</button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', marginRight: '8px' }} onClick={() => handleEdit(cls)}>แก้ไข</button>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(cls._id)}>ลบ</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>ไม่พบข้อมูลโปรแกรมคลาสเรียน</td>
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '950px' }}>
            <div className="modal-header">
              <h2>{formData._id ? 'แก้ไข' : 'สร้างใหม่'} โปรแกรมคลาสเรียน</h2>
              <button className="btn" style={{ background: 'none', fontSize: '1.5rem' }} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="tabs">
                {[
                  { id: 'basic', label: 'ข้อมูลทั่วไป' },
                  { id: 'rounds', label: 'รอบการอบรม' },
                  { id: 'checkin', label: 'การเช็กอิน' },
                  { id: 'enrollment', label: 'การรับสมัคร' },
                  { id: 'publish', label: 'การเผยแพร่' }
                ].map(tab => (
                  <div key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                    {tab.label}
                  </div>
                ))}
              </div>

              <form id="class-form" onSubmit={handleSubmit}>
                {activeTab === 'basic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">ชื่อโปรแกรมคลาสเรียน *</label>
                      <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">รหัสโปรแกรมคลาสเรียน (ID)</label>
                      <input type="text" className="form-control" value={formData.classCode} onChange={e => setFormData({...formData, classCode: e.target.value})} />
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
                      <label className="form-label">หมวดหมู่เนื้อหา</label>
                      <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ผู้ผลิตเนื้อหา</label>
                      <input type="text" className="form-control" value={formData.contentCreator} onChange={e => setFormData({...formData, contentCreator: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ผู้สอนหลัก</label>
                      <input type="text" className="form-control" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ราคาหลักสูตร (บาท)</label>
                      <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">คำอธิบายโปรแกรมคลาสเรียน</label>
                      <textarea className="form-control" style={{ height: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">รูปภาพหน้าปก</label>
                      <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                      {formData.image && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ fontSize: '0.8rem', color: '#666' }}>รูปปัจจุบัน:</p>
                          <img src={formData.image} alt="Current" style={{ width: '100px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">เงื่อนไขการลงทะเบียน</label>
                      <select className="form-control" value={formData.enrollmentLogic} onChange={e => setFormData({...formData, enrollmentLogic: e.target.value})}>
                        <option value="Single">ลงทะเบียนได้ 1 คลาสเท่านั้น</option>
                        <option value="Multiple">ลงทะเบียนได้หลายคลาส</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.isMandatory} onChange={e => setFormData({...formData, isMandatory: e.target.checked})} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>หลักสูตรภาคบังคับ</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.isTemplate} onChange={e => setFormData({...formData, isTemplate: e.target.checked})} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>ตั้งค่าเป็น Template</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'rounds' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3>รอบการอบรมในคลาส</h3>
                      <button type="button" className="btn btn-outline" onClick={handleAddRound}>+ เพิ่มรอบการอบรม</button>
                    </div>
                    {formData.rounds?.map((round, index) => (
                      <div key={index} className="card" style={{ padding: '24px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group">
                            <label className="form-label">ชื่อรอบการอบรม</label>
                            <input type="text" className="form-control" value={round.title} onChange={e => handleRoundChange(index, 'title', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">ประเภทรอบ</label>
                            <select className="form-control" value={round.type} onChange={e => handleRoundChange(index, 'type', e.target.value)}>
                              <option value="Class">คลาสเรียน (On-site)</option>
                              <option value="Meeting">การประชุม (Online Meeting)</option>
                              <option value="Live">ถ่ายทอดสด (Live Stream)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">ผู้สอนรอบนี้</label>
                            <input type="text" className="form-control" value={round.instructor} onChange={e => handleRoundChange(index, 'instructor', e.target.value)} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group">
                            <label className="form-label">วันที่และเวลาเริ่มต้น</label>
                            <input type="datetime-local" className="form-control" value={round.start ? new Date(round.start).toISOString().slice(0, 16) : ''} onChange={e => handleRoundChange(index, 'start', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">วันที่และเวลาสิ้นสุด</label>
                            <input type="datetime-local" className="form-control" value={round.end ? new Date(round.end).toISOString().slice(0, 16) : ''} onChange={e => handleRoundChange(index, 'end', e.target.value)} />
                          </div>
                        </div>

                        {round.type === 'Class' ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label className="form-label">สถานที่จัดคลาส</label>
                              <input type="text" className="form-control" placeholder="เช่น Conicle Head Office" value={round.location} onChange={e => handleRoundChange(index, 'location', e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">ห้องที่ใช้</label>
                              <input type="text" className="form-control" placeholder="เช่น Room A" value={round.room} onChange={e => handleRoundChange(index, 'room', e.target.value)} />
                            </div>
                          </div>
                        ) : (
                          <div className="form-group">
                            <label className="form-label">{round.type === 'Meeting' ? 'URL Link การประชุม' : 'เลือกลิงก์รายการถ่ายทอดสด'}</label>
                            <input type="text" className="form-control" placeholder="https://..." value={round.url} onChange={e => handleRoundChange(index, 'url', e.target.value)} />
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          <button type="button" className="btn" style={{ color: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => {
                            const updatedRounds = [...formData.rounds];
                            updatedRounds.splice(index, 1);
                            setFormData({ ...formData, rounds: updatedRounds });
                          }}>ลบรอบการอบรมนี้ออก</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'checkin' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div className="form-group">
                      <label className="form-label">กำหนดรูปแบบการเช็กอิน</label>
                      <select className="form-control" value={formData.checkInSettings?.mode} onChange={e => setFormData({...formData, checkInSettings: {...formData.checkInSettings, mode: e.target.value}})}>
                        <option value="Single">เช็กอินอย่างเดียว</option>
                        <option value="CheckInCheckOut">เช็กอินและเช็กเอาต์</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">กำหนดการสร้าง QR Code</label>
                      <select className="form-control" value={formData.checkInSettings?.qrCodeType} onChange={e => setFormData({...formData, checkInSettings: {...formData.checkInSettings, qrCodeType: e.target.value}})}>
                        <option value="Round">รายรอบการอบรม (QR Code ตามรอบ)</option>
                        <option value="Daily">รายวัน (QR Code เดียวใช้ทั้งวัน)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">ผู้ถือ QR Code สำหรับเช็คอิน</label>
                      <select className="form-control">
                        <option value="User">ผู้เรียน (แสดง QR ให้แอดมินสแกน)</option>
                        <option value="Admin">ผู้ดูแล (แสดง QR ให้ผู้เรียนสแกน)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'enrollment' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">สถานะการรับสมัคร</label>
                        <select className="form-control" value={formData.enrollmentSettings?.status} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, status: e.target.value}})}>
                          <option value="Open">เปิดรับสมัคร</option>
                          <option value="Closed">ปิดรับสมัคร</option>
                          <option value="Scheduled">กำหนดเวลา</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">จำนวนที่นั่งและโควตา (0 = ไม่จำกัด)</label>
                        <input type="number" className="form-control" value={formData.enrollmentSettings?.quota} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, quota: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">เงื่อนไขการขออนุมัติเรียน</label>
                        <select className="form-control" value={formData.enrollmentSettings?.approvalRequired ? 'Yes' : 'No'} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, approvalRequired: e.target.value === 'Yes'}})}>
                          <option value="No">ไม่ต้องอนุมัติ</option>
                          <option value="Yes">ต้องได้รับการอนุมัติ</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">สรุปและอนุมัติผลการเรียน</label>
                        <select className="form-control" value={formData.approvalMode} onChange={e => setFormData({...formData, approvalMode: e.target.value})}>
                          <option value="Automatic">สรุปผลอัตโนมัติโดยระบบ</option>
                          <option value="Admin">อนุมัติผลโดยแอดมิน</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings?.autoCancelIfLowEnrollment} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, autoCancelIfLowEnrollment: e.target.checked}})} />
                        <span style={{ fontSize: '0.875rem' }}>ยกเลิกคลาสอัตโนมัติ (กรณีผู้เรียนไม่ถึงขั้นต่ำ)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings?.allowReEnrollAfterReject} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowReEnrollAfterReject: e.target.checked}})} />
                        <span style={{ fontSize: '0.875rem' }}>อนุญาตให้ผู้ที่ถูกปฏิเสธลงทะเบียนซ้ำได้</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.enrollmentSettings?.allowCancellation} onChange={e => setFormData({...formData, enrollmentSettings: {...formData.enrollmentSettings, allowCancellation: e.target.checked}})} />
                        <span style={{ fontSize: '0.875rem' }}>อนุญาตให้ผู้เรียนยกเลิกการลงทะเบียนได้</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'publish' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">สถานะการมองเห็น</label>
                      <select className="form-control" value={formData.publishSettings?.mode} onChange={e => setFormData({...formData, publishSettings: {...formData.publishSettings, mode: e.target.value}})}>
                        <option value="Unpublished">ไม่เผยแพร่</option>
                        <option value="Immediate">เผยแพร่ทันที</option>
                        <option value="Scheduled">ตั้งวันที่และเวลาเผยแพร่</option>
                      </select>
                    </div>
                    {formData.publishSettings?.mode === 'Scheduled' && (
                      <div className="form-group">
                        <label className="form-label">เผยแพร่ตั้งแต่ - ถึง</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="date" className="form-control" />
                          <input type="date" className="form-control" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>ปิด</button>
              <button type="submit" form="class-form" className="btn btn-primary">{formData._id ? 'อัปเดต' : 'บันทึก'} โปรแกรมคลาสเรียน</button>
            </div>
          </div>
        </div>
      )}

      <ParticipantModal 
        isOpen={participantModal.isOpen}
        onClose={() => setParticipantModal({ ...participantModal, isOpen: false })}
        itemId={participantModal.itemId}
        itemTitle={participantModal.itemTitle}
        type="class"
      />
    </AdminLayout>
  );
};

export default Classes;
