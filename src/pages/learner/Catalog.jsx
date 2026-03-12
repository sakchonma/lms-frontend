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

  if (loading) return <LearnerLayout><p>Loading catalog...</p></LearnerLayout>;

  return (
    <LearnerLayout>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(0,255,136,0.1)' }}>COURSE <span style={{ color: 'var(--primary)' }}>CATALOG</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Choose your next mission and master the tech stack.</p>
      </div>
      
      <div className="grid" style={{ marginTop: '40px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {courses.map(course => {
          const status = getCourseStatus(course._id);

          return (
            <div key={course._id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/learner/course/${course._id}`)}>
              <div style={{ position: 'relative', height: '160px' }}>
                <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=LMS'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                  {status === 'enrolled' ? (
                    <span className="badge badge-success">✓ Enrolled</span>
                  ) : status === 'pending' ? (
                    <span className="badge badge-warning">⏳ Pending</span>
                  ) : null}
                </div>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h4>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{course.level || 'Beginner'}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900' }}>PLAY →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LearnerLayout>
  );
};

export default Catalog;
