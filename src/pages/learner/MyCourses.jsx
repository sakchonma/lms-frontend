import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await API.get('/learner/my-courses');
        setCourses(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <LearnerLayout>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(0,255,136,0.1)' }}>ACTIVE <span style={{ color: 'var(--primary)' }}>MISSIONS</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Resume your progress and complete your training.</p>
      </div>

      <div className="grid" style={{ marginTop: '40px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {courses.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>No active missions found in your log.</p>
            <button onClick={() => navigate('/learner/catalog')} className="btn btn-primary">SEARCH CATALOG</button>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/learner/course/${course._id}`)}>
              <div style={{ position: 'relative', height: '160px' }}>
                <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=LMS'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="badge badge-success">✓ Enrolled</span>
                </div>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h4>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '800' }}>PROGRESS</span>
                      <span style={{ fontWeight: '900', color: 'var(--primary)' }}>0%</span>
                    </div>
                    <div style={{ height: '3px', backgroundColor: 'var(--secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{course.level || 'Expert'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900' }}>RESUME →</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </LearnerLayout>
  );
};

export default MyCourses;
