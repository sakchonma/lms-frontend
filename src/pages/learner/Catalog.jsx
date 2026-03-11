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
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (id) => {
    try {
      const { data } = await API.post(`/learner/enroll/${id}`);
      alert(data.message);
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const getCourseStatus = (courseId) => {
    if (!courseId) return 'available';
    const cIdStr = courseId.toString();
    const isEnrolled = userData.myCourses?.some(c => (c._id || c).toString() === cIdStr);
    if (isEnrolled) return 'enrolled';
    const isPending = userData.pendingCourses?.some(c => (c._id || c).toString() === cIdStr);
    if (isPending) return 'pending';
    return 'available';
  };

  if (loading) return <LearnerLayout><p>Loading...</p></LearnerLayout>;

  return (
    <LearnerLayout>
      <h1>Course Catalog</h1>
      <p style={{ color: 'var(--secondary)' }}>Explore and enroll in new courses</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginTop: '30px' }}>
        {courses.map(course => {
          const status = getCourseStatus(course._id);
          return (
            <div key={course._id} className="card">
              <img 
                src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} 
                alt={course.title} 
                style={{ width: '100%', borderRadius: '8px', height: '160px', objectFit: 'cover' }} 
              />
              <h3 style={{ margin: '15px 0 10px' }}>{course.title}</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', minHeight: '40px' }}>{course.description}</p>
              
              <div style={{ marginTop: '15px' }}>
                {status === 'enrolled' ? (
                  <button onClick={() => navigate(`/learner/course/${course._id}`)} className="btn" style={{ width: '100%', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>✓ Start Learning</button>
                ) : status === 'pending' ? (
                  <button disabled className="btn" style={{ width: '100%', backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', cursor: 'not-allowed' }}>⏳ Pending Approval</button>
                ) : (
                  <button onClick={() => handleEnroll(course._id)} className="btn btn-primary" style={{ width: '100%' }}>Enroll Now</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </LearnerLayout>
  );
};

export default Catalog;
