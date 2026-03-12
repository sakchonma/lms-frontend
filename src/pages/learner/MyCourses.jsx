import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await API.get('/learner/my-courses');
        setCourses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return (
    <LearnerLayout>
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.2em' }}>SYNCHRONIZING DATA VAULT...</div>
      </div>
    </LearnerLayout>
  );

  return (
    <LearnerLayout>
      <div style={{ padding: '40px 20px' }} className="scanline">
        <div style={{ marginBottom: '60px', borderLeft: '4px solid var(--primary)', paddingLeft: '25px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            KNOWLEDGE <span style={{ color: 'var(--primary)', textShadow: '0 0 20px var(--primary-glow)' }}>VAULT</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '10px' }}>Your active neural protocols and ongoing simulation data.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          {courses.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '100px 40px', textAlign: 'center', background: 'rgba(15,17,21,0.4)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '30px' }}>YOUR DATA VAULT IS CURRENTLY EMPTY.</p>
              <button onClick={() => navigate('/learner/catalog')} className="btn btn-primary" style={{ padding: '12px 40px' }}>ACCESS REGISTRY</button>
            </div>
          ) : (
            courses.map(course => (
              <div key={course._id} className="card" onClick={() => navigate(`/learner/course/${course._id}`)}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=PROTOCOL'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface), transparent)' }}></div>
                </div>
                <div style={{ padding: '25px' }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'white', height: '2.8rem', overflow: 'hidden' }}>{course.title}</h4>
                  
                  <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.1em' }}>SYNC PROGRESS</span>
                      <span style={{ fontWeight: '900', color: 'var(--primary)' }}>0%</span>
                    </div>
                    <div className="xp-bar-container" style={{ height: '6px' }}>
                      <div className="xp-bar-fill" style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>LEVEL: {course.level || 'EXPERT'}</span>
                    <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.6rem' }}>RESUME SYNC</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default MyCourses;
