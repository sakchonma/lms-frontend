import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCls, resMe] = await Promise.all([
          API.get(`/learner/class/${id}`),
          API.get('/auth/me').catch(() => ({ data: null }))
        ]);
        setCls(resCls.data);
        setUserData(resMe.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    if (!selectedRound) return alert('กรุณาเลือกรอบการอบรมที่ต้องการเข้าเรียน');
    try {
      const { data } = await API.post(`/learner/enroll-class/${id}`, { roundId: selectedRound });
      alert(data.message);
      navigate('/learner/my-courses');
    } catch (error) { 
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'); 
    }
  };

  if (loading) return <LearnerLayout><div style={{padding:'20px', color: 'white'}}>Loading class details...</div></LearnerLayout>;
  if (!cls) return <LearnerLayout><div style={{padding:'20px', color: 'white'}}>Class not found</div></LearnerLayout>;

  const isEnrolled = userData?.myClasses?.some(c => (c._id || c) === id);
  const price = cls.price || 0;

  return (
    <LearnerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <button 
                onClick={() => navigate(-1)} 
                style={{ 
                  marginBottom: '24px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  padding: 0
                }}
              >
                ← กลับ
              </button>
              <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', marginBottom: '8px' }}>{cls.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-info">{cls.level || 'Expert'}</span>
                {cls.isMandatory && <span className="badge" style={{ backgroundColor: 'var(--conicle-red)', color: 'white' }}>REQUIRED</span>}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class Code: {cls.classCode}</span>
              </div>
            </div>
            
            <div className="card" style={{ 
              padding: '0', 
              overflow: 'hidden', 
              aspectRatio: '16/9',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: '16px'
            }}>
              <img 
                src={cls.image || 'https://placehold.co/1200x675/1e293b/3b82f6?text=CLASS+PROGRAM'} 
                alt={cls.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>รายละเอียดคลาสเรียน</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>
                {cls.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>โปรแกรมการเรียน</h4>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{cls.learningProgram || '-'}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>ผู้ผลิตเนื้อหา</h4>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{cls.contentCreator || '-'}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>หมวดหมู่</h4>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{cls.category || '-'}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>ติดต่อผู้ดูแล</h4>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{cls.adminContact || '-'}</p>
                </div>
              </div>
            </div>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>เลือกรอบการอบรม</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cls.rounds?.length || 0} รอบที่เปิดรับสมัคร</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cls.rounds?.map(round => (
                  <div 
                    key={round._id} 
                    className={`card ${selectedRound === round._id ? 'active' : ''}`}
                    onClick={() => setSelectedRound(round._id)}
                    style={{ 
                      padding: '24px', 
                      cursor: 'pointer', 
                      border: selectedRound === round._id ? '2px solid #3b82f6' : '1px solid var(--border)',
                      backgroundColor: selectedRound === round._id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {selectedRound === round._id && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#3b82f6', fontSize: '1.2rem' }}>✓</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, color: 'white' }}>{round.title}</h4>
                      <span className="badge" style={{ fontSize: '0.65rem', background: '#3b82f6', color: 'white' }}>{round.type}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <span>📅</span>
                        <span>{new Date(round.start).toLocaleDateString('th-TH')} - {new Date(round.end).toLocaleDateString('th-TH')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <span>🕒</span>
                        <span>{new Date(round.start).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(round.end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <span>👤</span>
                        <span>{round.instructor}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <span>📍</span>
                        <span>{round.type === 'Class' ? `${round.location} (ห้อง ${round.room})` : 'Online Session'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ position: 'sticky', top: '120px' }}>
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
              
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.2rem', color: '#3b82f6', margin: 0 }}>
                  {price > 0 ? `฿${price.toLocaleString()}` : 'ฟรี'}
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ค่าธรรมเนียมการอบรม</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>เงื่อนไข:</span>
                  <span style={{ fontWeight: '600' }}>{cls.enrollmentLogic === 'Single' ? 'ลงทะเบียนได้ 1 รอบ' : 'ไม่จำกัดรอบ'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>การอนุมัติ:</span>
                  <span style={{ fontWeight: '600' }}>{cls.enrollmentSettings?.approvalRequired ? 'ต้องได้รับอนุมัติ' : 'อนุมัติทันที'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>สถานะรับสมัคร:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{cls.enrollmentSettings?.status === 'Open' ? 'เปิดรับสมัคร' : 'ปิด'}</span>
                </div>
              </div>

              {isEnrolled ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--success)', fontSize: '3rem', marginBottom: '16px' }}>✓</div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>ลงทะเบียนแล้ว</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คุณได้ลงทะเบียนในคลาสเรียนนี้เรียบร้อยแล้ว</p>
                </div>
              ) : (
                <>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px', background: '#3b82f6' }}
                    onClick={handleEnroll}
                    disabled={!selectedRound}
                  >
                    ลงทะเบียนเข้าเรียน
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                    {!selectedRound ? 'กรุณาเลือกรอบการอบรมด้านซ้าย' : 'พร้อมสำหรับการลงทะเบียน'}
                  </p>
                </>
              )}

              {cls.attachments?.length > 0 && (
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>เอกสารประกอบ</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cls.attachments.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textDecoration: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', border: '1px solid var(--border)' }}>
                        📎 {file.title || 'ดาวน์โหลดเอกสาร'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </LearnerLayout>
  );
};

export default ClassDetail;
