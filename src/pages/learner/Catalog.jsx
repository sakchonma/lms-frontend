import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState({ myCourses: [], pendingCourses: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resAll, resMe] = await Promise.all([
        API.get('/learner/catalog').catch(() => ({ data: [] })),
        API.get('/auth/me').catch(() => ({ data: { myCourses: [], pendingCourses: [] } }))
      ]);
      setCourses(resAll.data || []);
      setUserData(resMe.data || { myCourses: [], pendingCourses: [] });
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getCourseStatus = (courseId) => {
    const cIdStr = courseId?.toString();
    if (userData.myCourses?.some(c => (c._id || c).toString() === cIdStr)) return 'enrolled';
    if (userData.pendingCourses?.some(c => (c._id || c).toString() === cIdStr)) return 'pending';
    return 'available';
  };

  if (loading) return (
    <LearnerLayout>
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.2em' }}>ACCESSING REGISTRY...</div>
      </div>
    </LearnerLayout>
  );

  return (
    <LearnerLayout>
      <div style={{ padding: '40px 20px' }} className="scanline">
        <div style={{ marginBottom: '60px', borderLeft: '4px solid var(--primary)', paddingLeft: '25px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            ARMORY <span style={{ color: 'var(--primary)', textShadow: '0 0 20px var(--primary-glow)' }}>REGISTRY</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '10px' }}>Download new protocols to enhance your neural capability.</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          {courses.map(course => {
            const status = getCourseStatus(course._id);

            return (
              <div key={course._id} className="card" onClick={() => navigate(`/learner/course/${course._id}`)}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=PROTOCOL'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface), transparent)' }}></div>
                  <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                    {status === 'enrolled' ? (
                      <span style={{ background: 'var(--success)', color: 'white', padding: '4px 10px', fontSize: '0.6rem', fontWeight: '900', borderRadius: '2px' }}>SYNCED</span>
                    ) : status === 'pending' ? (
                      <span style={{ background: 'var(--warning)', color: 'white', padding: '4px 10px', fontSize: '0.6rem', fontWeight: '900', borderRadius: '2px' }}>CONNECTING</span>
                    ) : (
                      <span style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', fontSize: '0.6rem', fontWeight: '900', borderRadius: '2px' }}>DOWNLOADABLE</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase' }}>{course.category || 'CORE DATA'}</span>
                  <h4 style={{ margin: '10px 0 20px 0', fontSize: '1rem', height: '2.8rem', overflow: 'hidden', color: 'white' }}>{course.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>RANK: {course.level || 'BGN'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900' }}>INITIALIZE →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Catalog;
