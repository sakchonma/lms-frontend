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
      <h1>My Learning</h1>
      <p style={{ color: 'var(--secondary)' }}>Track your progress and continue learning</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginTop: '30px' }}>
        {courses.length === 0 ? (
          <p>You are not enrolled in any courses yet.</p>
        ) : (
          courses.map(course => (
            <div key={course._id} className="card">
              <img 
                src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} 
                alt={course.title} 
                style={{ width: '100%', borderRadius: '8px', height: '160px', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'; }}
              />
              <h3 style={{ margin: '15px 0 10px' }}>{course.title}</h3>
              <button 
                onClick={() => navigate(`/learner/course/${course._id}`)}
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '15px', backgroundColor: '#10b981' }}
              >
                Continue Learning
              </button>
            </div>
          ))
        )}
      </div>
    </LearnerLayout>
  );
};

export default MyCourses;
