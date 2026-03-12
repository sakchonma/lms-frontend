import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resCourse, resMe] = await Promise.all([
        API.get(`/learner/course/${id}`),
        API.get('/auth/me').catch(() => ({ data: null }))
      ]);
      
      setCourse(resCourse.data);
      setUserData(resMe.data);
      
      const isApproved = resMe.data?.myCourses?.some(c => (c._id || c) === id);
      if (isApproved && resCourse.data.sections?.[0]?.lessons?.[0]) {
        setActiveLesson(resCourse.data.sections[0].lessons[0]);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleEnrollPathway = async (pathId) => {
    try {
      const { data } = await API.post(`/learner/enroll-pathway/${pathId}`);
      alert(data.message);
      fetchData();
    } catch (error) { alert('Error'); }
  };

  const handleEnrollSingle = async () => {
    try {
      const { data } = await API.post(`/learner/enroll/${id}`);
      alert(data.message);
      fetchData();
    } catch (error) { alert('Error'); }
  };

  const handleComplete = async () => {
    try {
      await API.post(`/learner/complete-course/${id}`);
      alert('ยินดีด้วย! คุณเรียนจบหลักสูตรนี้แล้ว');
      fetchData();
    } catch (error) { alert('Error'); }
  };

  const renderPlayer = () => {
    if (!isEnrolled || !activeLesson || !activeLesson.url) {
      return (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isEnrolled ? '📺' : '🔒'}</div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>{isEnrolled ? 'พร้อมเรียนหรือยัง?' : 'เนื้อหาถูกล็อค'}</h3>
          <p style={{ maxWidth: '300px', margin: '0 auto' }}>{isEnrolled ? 'เลือกบทเรียนจากรายการด้านล่างเพื่อเริ่มเรียนได้ทันที' : 'กรุณาลงทะเบียนเรียนคอร์สนี้เพื่อเข้าถึงเนื้อหาทั้งหมด'}</p>
        </div>
      );
    }

    const url = activeLesson.url;
    
    // YouTube Check
    if (url.includes('youtube.com') || url.includes('youtu.be') || activeLesson.type === 'YouTube') {
      let embedId = '';
      if (url.includes('v=')) embedId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) embedId = url.split('youtu.be/')[1];
      else embedId = url; // Fallback
      
      return (
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${embedId}?autoplay=1`} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen 
          title={activeLesson.title}
        ></iframe>
      );
    }

    // Audio Check
    if (activeLesson.type === 'Audio') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#1e293b', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎵</div>
          <audio controls autoPlay src={url} style={{ width: '80%' }}>
            Your browser does not support the audio tag.
          </audio>
          <p style={{ marginTop: '20px', color: '#94a3b8' }}>{activeLesson.title}</p>
        </div>
      );
    }

    // Document/PDF Check
    if (activeLesson.type === 'Document') {
      return (
        <iframe src={url} width="100%" height="100%" title={activeLesson.title}></iframe>
      );
    }

    // MP4/Direct Video Check
    return (
      <video 
        controls 
        autoPlay 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        src={url}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  const handleLessonClick = (lesson) => {
    if (!isEnrolled) return;
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <LearnerLayout><p>กำลังโหลด...</p></LearnerLayout>;
  if (!course) return <LearnerLayout><p>ไม่พบข้อมูลคอร์ส</p></LearnerLayout>;

  const isEnrolled = userData?.myCourses?.some(c => (c._id || c) === id);
  const isPending = userData?.pendingCourses?.some(c => (c._id || c) === id);
  const paths = course.belongsToPathways || [];

  // Enrollment Logic
  const enrollmentSettings = course.enrollmentSettings || {};
  const { status, start, end } = enrollmentSettings.period || {};
  const quota = enrollmentSettings.quota || 0;
  const price = course.price || 0;

  const now = new Date();
  let canEnroll = true;
  let enrollMessage = '';

  if (enrollmentSettings.period?.status === 'Closed') {
    canEnroll = false;
    enrollMessage = 'ปิดรับสมัครแล้ว';
  } else if (enrollmentSettings.period?.status === 'Scheduled') {
    if (start && now < new Date(start)) {
      canEnroll = false;
      enrollMessage = `เปิดรับสมัคร: ${new Date(start).toLocaleDateString('th-TH')}`;
    } else if (end && now > new Date(end)) {
      canEnroll = false;
      enrollMessage = 'หมดเขตรับสมัครแล้ว';
    }
  }

  // Note: Actual seat counting would require backend support (counting enrolled users).
  // For now, we display the quota if set.

  return (
    <LearnerLayout>
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
            <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', marginBottom: '8px' }}>{course.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-info">{course.level || 'Beginner'}</span>
              {course.isMandatory && <span className="badge" style={{ backgroundColor: 'var(--conicle-red)', color: 'white' }}>REQUIRED</span>}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>อัปเดตล่าสุดเมื่อ {new Date(course.updatedAt || course.created_at).toLocaleDateString('th-TH')}</span>
            </div>
          </div>
          
          <div className="card" style={{ 
            padding: '0', 
            overflow: 'hidden', 
            backgroundColor: '#000', 
            aspectRatio: '16/9',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '16px'
          }}>
            {renderPlayer()}
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              {activeLesson ? activeLesson.title : 'รายละเอียดคอร์ส'}
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {activeLesson ? activeLesson.content : course.description}
            </p>

            {course.adminContact && (
              <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong>ติดต่อผู้ดูแล:</strong> {course.adminContact}
                </p>
              </div>
            )}

            {course.attachments?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>ไฟล์แนบประกอบหลักสูตร</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {course.attachments.map((file, idx) => (
                    <a key={idx} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--conicle-red)', fontWeight: '600' }}>
                      📎 {file.title || 'เอกสารประกอบ'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <section>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>เนื้อหาหลักสูตร</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {course.sections?.map((section, sIdx) => (
                <div key={section._id} className="card" style={{ padding: 0 }}>
                  <div style={{ 
                    padding: '16px 24px', 
                    backgroundColor: '#f8fafc', 
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      ส่วนที่ {sIdx + 1}: {section.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--conicle-red)' }}>{section.lessons?.length || 0} บทเรียน</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {section.lessons?.map((lesson, lIdx) => (
                      <div 
                        key={lesson._id} 
                        onClick={() => handleLessonClick(lesson)}
                        style={{ 
                          padding: '16px 24px', 
                          cursor: isEnrolled ? 'pointer' : 'not-allowed', 
                          borderBottom: lIdx === section.lessons.length - 1 ? 'none' : '1px solid var(--border)',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.2s',
                          backgroundColor: activeLesson?._id === lesson._id ? 'rgba(240, 45, 52, 0.05)' : 'transparent',
                          color: activeLesson?._id === lesson._id ? 'var(--conicle-red)' : (isEnrolled ? 'var(--conicle-text)' : 'var(--text-muted)')
                        }}
                      >
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: activeLesson?._id === lesson._id ? 'var(--conicle-red)' : '#f1f5f9',
                          color: activeLesson?._id === lesson._id ? 'black' : 'var(--text-muted)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {lIdx + 1}
                        </span>
                        <span style={{ flex: 1, fontWeight: activeLesson?._id === lesson._id ? '700' : '400' }}>{lesson.title}</span>
                        <span style={{ fontSize: '1rem' }}>{isEnrolled ? (lesson.type === 'Video' || lesson.type === 'YouTube' ? '📺' : '📄') : '🔒'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ position: 'sticky', top: '120px' }}>
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--conicle-red)', margin: 0 }}>
                {price > 0 ? `฿${price.toLocaleString()}` : 'ฟรี'}
              </h2>
              {price > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ราคาสุทธิ</span>}
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>สถานะการเข้าถึง</h3>
            
            <div style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--conicle-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>ระยะเวลาสมัคร:</span>
                <span style={{ fontWeight: '600' }}>
                  {enrollmentSettings.period?.status === 'Open' ? 'เปิดตลอด' : 
                   enrollmentSettings.period?.status === 'Closed' ? 'ปิดรับสมัคร' : 
                   `${new Date(start).toLocaleDateString('th-TH')} - ${new Date(end).toLocaleDateString('th-TH')}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>จำนวนรับ:</span>
                <span style={{ fontWeight: '600' }}>{quota > 0 ? `${quota} ที่นั่ง` : 'ไม่จำกัด'}</span>
              </div>
            </div>
            
            {!isEnrolled ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {paths.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>เป็นส่วนหนึ่งของเส้นทางการเรียนรู้:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {paths.map(p => (
                        <div key={p._id} className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>{p.title}</h4>
                          {isPending ? (
                            <div className="badge badge-warning" style={{ width: '100%', textAlign: 'center' }}>⏳ รอการอนุมัติ</div>
                          ) : (
                            <button onClick={() => handleEnrollPathway(p._id)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }} disabled={!canEnroll}>
                              {canEnroll ? 'สมัครเรียนเส้นทางนี้' : enrollMessage}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ textAlign: 'center', paddingTop: paths.length > 0 ? '24px' : '0', borderTop: paths.length > 0 ? '1px solid var(--border)' : 'none' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>ขอสิทธิ์เข้าเรียนคอร์สนี้:</p>
                  {isPending ? (
                    <button disabled className="btn" style={{ width: '100%', backgroundColor: 'var(--warning)', color: '#92400e' }}>⏳ ส่งคำขอแล้ว</button>
                  ) : (
                    <button onClick={handleEnrollSingle} className="btn btn-primary" style={{ width: '100%' }} disabled={!canEnroll}>
                      {canEnroll ? 'ส่งคำขอลงทะเบียน' : enrollMessage}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--success)', fontSize: '3rem', marginBottom: '16px' }}>✓</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>ลงทะเบียนแล้ว</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>คุณสามารถเข้าถึงเนื้อหาทั้งหมดได้ทันที</p>
                <button onClick={handleComplete} className="btn" style={{ width: '100%', backgroundColor: 'var(--success)', color: 'white' }}>ทำเครื่องหมายว่าเรียนจบแล้ว</button>
              </div>
            )}
            
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>สถานะ</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>กำลังเรียน</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>ผู้สอน</span>
                <span style={{ fontWeight: '700' }}>{course.instructor || 'Academy Team'}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </LearnerLayout>
  );
};

export default CourseDetail;
