import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

const PathwayDetail = () => {
  const { id } = useParams();
  const [pathway, setPathway] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pathwayRes, userRes] = await Promise.all([
          API.get('/learner/all-pathways'),
          API.get('/auth/me').catch(() => ({ data: null }))
        ]);
        
        const found = pathwayRes.data.find(p => p._id === id);
        setPathway(found);
        setUserData(userRes?.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const getEnrollmentStatus = () => {
    if (!userData || !pathway) return 'available';
    
    // 1. Check if user is enrolled in the pathway directly
    if (userData.myPathways?.some(p => (p._id || p).toString() === id)) return 'enrolled';

    // 2. Check if user is already enrolled in any course of this pathway
    const pathwayCourseIds = [];
    pathway.sections.forEach(s => s.items.forEach(i => {
      if (i.itemType === 'Course') pathwayCourseIds.push(i.refId?._id?.toString() || i.refId?.toString());
    }));

    // If user has any course from this pathway in myCourses, they are "enrolled"
    if (userData.myCourses?.some(c => pathwayCourseIds.includes((c._id || c).toString()))) return 'enrolled';
    
    // 3. Check if pathway is in pendingPathways
    if (userData.pendingPathways?.some(p => (p._id || p).toString() === id)) return 'pending';
    
    return 'available';
  };

  const enrollmentStatus = getEnrollmentStatus();

  const handleEnrollPathway = async () => {
    if (enrollmentStatus !== 'available') return;
    try {
      const { data } = await API.post(`/learner/enroll-pathway/${id}`);
      alert(data.message);
      // Refresh user data to update button state
      const { data: newUser } = await API.get('/auth/me');
      setUserData(newUser);
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  if (loading) return <LearnerLayout><p>Loading...</p></LearnerLayout>;
  if (!pathway) return <LearnerLayout><p>Pathway not found.</p></LearnerLayout>;

  return (
    <LearnerLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            marginBottom: '32px', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {pathway.isMandatory && <span className="badge badge-warning" style={{ backgroundColor: 'var(--conicle-red)', color: 'white' }}>หลักสูตรภาคบังคับ</span>}
              <span className="badge badge-info">{pathway.level || 'Beginner'}</span>
              {pathway.category && <span className="badge badge-outline">{pathway.category}</span>}
              {pathway.tags?.map((tag, idx) => (
                <span key={idx} className="badge badge-outline" style={{ fontSize: '0.7rem' }}>#{tag}</span>
              ))}
            </div>

            <h1 style={{ fontSize: '3rem', letterSpacing: '-0.04em', marginBottom: '16px', lineHeight: '1' }}>{pathway.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '40px' }}>{pathway.description}</p>
            
            {pathway.termsAndConditions && (
              <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>เงื่อนไขและข้อกำหนดในการเรียน</h4>
                <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{pathway.termsAndConditions}</p>
              </div>
            )}

            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', letterSpacing: '-0.02em' }}>
              Learning Sequence ({pathway.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0)} Items)
            </h3>
            
            <div style={{ position: 'relative' }}>
              {pathway.sections?.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '48px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--primary-light)', 
                        color: 'var(--primary)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontWeight: '800',
                        fontSize: '0.9rem'
                      }}>
                        {sIdx + 1}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{section.title}</h4>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {section.durationType === 'Days' ? `ระยะเวลา: ${section.duration} วัน` : 
                       `ช่วงวันที่: ${new Date(section.startDate).toLocaleDateString()} - ${new Date(section.endDate).toLocaleDateString()}`}
                    </span>
                  </div>

                  {section.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '48px', marginBottom: '16px' }}>{section.description}</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '48px', borderLeft: '2px solid var(--border)', marginLeft: '15px' }}>
                    {section.items?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, iIdx) => (
                      <div key={item.refId?._id || iIdx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'var(--surface)' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--bg)', 
                          color: 'var(--text-muted)', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          fontSize: '0.9rem',
                          fontWeight: '700'
                        }}>
                          {iIdx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{item.refId?.title || 'Untitled Item'}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>{item.itemType}</span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border)' }}></span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.isMandatory ? 'Required' : 'Optional'}</span>
                          </div>
                        </div>
                        {item.itemType === 'Course' && item.refId?._id && (
                          <button onClick={() => navigate(`/learner/course/${item.refId._id}`)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Details</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!pathway.sections || pathway.sections.length === 0) && (
                <div className="card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>No curriculum has been added to this pathway yet.</p>
                </div>
              )}
            </div>
          </div>

          <aside style={{ position: 'sticky', top: '120px' }}>
            <div className="card" style={{ padding: '32px', backgroundColor: 'var(--surface)', border: '2px solid var(--primary-light)' }}>
              <h4 style={{ marginBottom: '16px' }}>Enrollment</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Start your journey through this curated roadmap. All materials are included upon enrollment.
              </p>
              
              <button 
                onClick={handleEnrollPathway} 
                className={`btn ${enrollmentStatus === 'available' ? 'btn-primary' : ''}`}
                disabled={enrollmentStatus !== 'available'}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  fontSize: '1rem',
                  backgroundColor: enrollmentStatus === 'pending' ? 'var(--warning)' : (enrollmentStatus === 'enrolled' ? 'var(--success)' : undefined),
                  cursor: enrollmentStatus === 'available' ? 'pointer' : 'not-allowed',
                }}
              >
                {enrollmentStatus === 'pending' ? '⏳ Request Pending' : 
                 enrollmentStatus === 'enrolled' ? '✓ Enrolled' : 
                 'Start Learning'}
              </button>

              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                  <span style={{ fontWeight: '700' }}>
                    {pathway.durationSettings?.type === 'Days' ? `${pathway.durationSettings?.numberOfDays} วัน` : 
                     `${new Date(pathway.durationSettings?.startDate).toLocaleDateString()} - ${new Date(pathway.durationSettings?.endDate).toLocaleDateString()}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Difficulty</span>
                  <span style={{ fontWeight: '700' }}>{pathway.level || 'Beginner'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Courses</span>
                  <span style={{ fontWeight: '700' }}>{pathway.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0)}</span>
                </div>
                {pathway.adminContact && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#0369a1', margin: '0 0 5px 0', fontWeight: 'bold' }}>ติดต่อผู้ดูแลหลักสูตร</p>
                    <p style={{ fontSize: '0.85rem', color: '#0c4a6e', margin: 0 }}>{pathway.adminContact}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default PathwayDetail;
