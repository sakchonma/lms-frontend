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
      
      if (resCourse.data) {
        setCourse(resCourse.data);
        const isApproved = resMe.data?.myCourses?.some(c => (c._id || c) === id);
        if (isApproved && resCourse.data.sections?.[0]?.lessons?.[0]) {
          setActiveLesson(resCourse.data.sections[0].lessons[0]);
        }
      }
      setUserData(resMe.data);
    } catch (error) { 
      console.error('--- FETCH ERROR ---', error);
      alert('Cannot access protocol data. Please try again.');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleEnrollSingle = async () => {
    try {
      const { data } = await API.post(`/learner/course/${id}/enroll`);
      alert(data.message);
      fetchData();
    } catch (error) { alert('Error enrolling in protocol'); }
  };

  const handleComplete = async () => {
    try {
      await API.post(`/learner/course/${id}/complete`);
      alert('Congratulations! You completed this protocol.');
      fetchData();
    } catch (error) { alert('Error completing protocol'); }
  };

  const renderPlayer = () => {
    if (!isEnrolled || !activeLesson || !activeLesson.url) {
      return (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isEnrolled ? '📺' : '🔒'}</div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>{isEnrolled ? 'READY TO SYNC?' : 'PROTOCOL LOCKED'}</h3>
          <p style={{ maxWidth: '300px', margin: '0 auto' }}>{isEnrolled ? 'Select a data node from the list below to begin.' : 'Initiate this protocol to access all data nodes.'}</p>
        </div>
      );
    }

    const url = activeLesson.url;
    if (url.includes('youtube.com') || url.includes('youtu.be') || activeLesson.type === 'YouTube') {
      let embedId = '';
      if (url.includes('v=')) embedId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) embedId = url.split('youtu.be/')[1];
      return (
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${embedId}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title={activeLesson.title}></iframe>
      );
    }

    if (activeLesson.type === 'Document') {
      return <iframe src={url} width="100%" height="100%" title={activeLesson.title}></iframe>;
    }

    return (
      <video controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={url}>
        Your browser does not support the video tag.
      </video>
    );
  };

  if (loading) return (
    <LearnerLayout>
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.2em' }}>ACCESSING PROTOCOL...</div>
      </div>
    </LearnerLayout>
  );
  
  if (!course) return <LearnerLayout><p>PROTOCOL NOT FOUND</p></LearnerLayout>;

  const isEnrolled = userData?.myCourses?.some(c => (c._id || c) === id);
  const isPending = userData?.pendingCourses?.some(c => (c._id || c) === id);
  const price = course.price || 0;

  return (
    <LearnerLayout>
      <div style={{ padding: '40px 20px' }} className="scanline">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '20px', fontWeight: '900' }}>← BACK TO REGISTRY</button>
              <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 10px 0', color: 'white' }}>{course.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 10px', fontSize: '0.7rem', fontWeight: '900' }}>RANK: {course.level || 'BGN'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LAST SYNC: {new Date(course.updatedAt || course.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="card" style={{ aspectRatio: '16/9', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {renderPlayer()}
            </div>

            <div className="card" style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                {activeLesson ? activeLesson.title : 'MISSION INTEL'}
              </h2>
              <p style={{ lineHeight: '1.8', color: 'white', fontSize: '1.05rem', marginBottom: '30px' }}>
                {activeLesson ? activeLesson.content : course.description}
              </p>

              {course.adminContact && (
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid var(--primary)', marginBottom: '30px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>
                    <strong style={{ color: 'var(--primary)' }}>COMMAND CONTACT:</strong> {course.adminContact}
                  </p>
                </div>
              )}

              {course.attachments?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '15px' }}>DOWNLOADABLE ASSETS</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {course.attachments.map((file, idx) => (
                      <a key={idx} href={file.url} target="_blank" rel="noreferrer" style={{ padding: '15px', background: 'white', border: '1px solid white', borderRadius: '4px', textDecoration: 'none', color: 'black', fontWeight: '900', fontSize: '0.85rem' }}>
                        FILE_NODE_{idx + 1}: {file.title || 'DATA_PACK'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <section>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '4px', height: '20px', background: 'var(--primary)' }}></div>
                PROTOCOL STRUCTURE
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {course.sections?.map((section, sIdx) => (
                  <div key={section._id} className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)' }}>SECTOR {sIdx + 1}: {section.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{section.lessons?.length || 0} NODES</span>
                    </div>
                    {section.lessons?.map((lesson, lIdx) => (
                      <div key={lesson._id} onClick={() => isEnrolled && setActiveLesson(lesson)} style={{ padding: '15px 25px', borderBottom: '1px solid var(--border)', cursor: isEnrolled ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '20px', transition: '0.2s', background: activeLesson?._id === lesson._id ? 'rgba(0,255,136,0.05)' : 'transparent' }}>
                        <span style={{ width: '25px', height: '25px', borderRadius: '50%', background: activeLesson?._id === lesson._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: activeLesson?._id === lesson._id ? 'black' : 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: '900' }}>{lIdx + 1}</span>
                        <span style={{ flex: 1, color: activeLesson?._id === lesson._id ? 'var(--primary)' : 'white' }}>{lesson.title}</span>
                        <span style={{ fontSize: '1.2rem' }}>{isEnrolled ? (lesson.type === 'Video' ? '📺' : '📄') : '🔒'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '30px', border: '1px solid var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}>
              {!isEnrolled && (
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '900' }}>ACCESS COST</p>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>
                    {price > 0 ? `฿${price.toLocaleString()}` : 'FREE'}
                  </h2>
                </div>
              )}

              <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>QUOTA</span>
                  <span style={{ color: 'white', fontWeight: '900' }}>UNLIMITED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>STATUS</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '900' }}>ONLINE</span>
                </div>
              </div>

              {!isEnrolled ? (
                <div style={{ textAlign: 'center' }}>
                  {isPending ? (
                    <button disabled className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--warning)', color: 'var(--warning)' }}>CONNECTING...</button>
                  ) : (
                    <button onClick={handleEnrollSingle} className="btn btn-primary" style={{ width: '100%' }}>INITIATE PROTOCOL</button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '15px' }}>✓</div>
                  <h4 style={{ color: 'white', margin: '0 0 20px 0' }}>PROTOCOL SYNCED</h4>
                  <button onClick={handleComplete} className="btn btn-outline" style={{ width: '100%' }}>COMPLETE MISSION</button>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </LearnerLayout>
  );
};

export default CourseDetail;
