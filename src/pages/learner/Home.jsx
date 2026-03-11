import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [allPathways, setAllPathways] = useState([]);
  const [userData, setUserData] = useState({ myCourses: [], pendingCourses: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resAll, resMe, resPaths] = await Promise.all([
        API.get('/learner/catalog').catch(() => ({ data: [] })),
        API.get('/auth/me').catch(() => ({ data: { myCourses: [], pendingCourses: [] } })),
        API.get('/learner/all-pathways').catch(() => ({ data: [] }))
      ]);
      
      setAllCourses(Array.isArray(resAll.data) ? resAll.data : []);
      setUserData(resMe.data || { myCourses: [], pendingCourses: [] });
      setAllPathways(resPaths.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnrollCourse = async (id) => {
    try {
      const { data } = await API.post(`/learner/enroll/${id}`);
      alert(data.message);
      fetchData(); 
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const handleEnrollPathway = async (id) => {
    try {
      const { data } = await API.post(`/learner/enroll-pathway/${id}`);
      alert(data.message);
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const getCourseStatus = (courseId) => {
    if (!courseId) return 'available';
    const cIdStr = courseId.toString();
    if (userData.myCourses?.some(c => (c._id || c).toString() === cIdStr)) return 'enrolled';
    if (userData.pendingCourses?.some(c => (c._id || c).toString() === cIdStr)) return 'pending';
    return 'available';
  };

  if (loading) return <LearnerLayout><div style={{padding:'20px'}}>Loading dashboard...</div></LearnerLayout>;

  const enrolledCourses = allCourses.filter(c => getCourseStatus(c._id) === 'enrolled');
  const pendingCourses = allCourses.filter(c => getCourseStatus(c._id) === 'pending');
  const availableCourses = allCourses.filter(c => getCourseStatus(c._id) === 'available');

  return (
    <LearnerLayout>
      <h1>Learning Dashboard</h1>

      {/* Section: Learning Pathways */}
      {allPathways.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2>🚀 Recommended Learning Pathways</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {allPathways.map(path => (
              <div key={path._id} className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{path.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{path.description}</p>
                <div style={{ margin: '15px 0', fontSize: '0.8rem' }}>
                  <strong>Includes {path.courses?.length} courses:</strong>
                  <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {path.courses?.map((c, i) => (
                      <span key={i} style={{ padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                        {c.courseId?.title || '...'}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleEnrollPathway(path._id)}
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', backgroundColor: '#4f46e5' }}
                >
                  Enroll Entire Pathway
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Section: My Courses */}
      {enrolledCourses.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2>✍️ My Courses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {enrolledCourses.map(course => (
              <div key={course._id} className="card">
                <img src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} alt={course.title} style={{ width: '100%', borderRadius: '8px', height: '140px', objectFit: 'cover' }} onClick={() => navigate(`/learner/course/${course._id}`)} />
                <h4 style={{ margin: '10px 0' }}>{course.title}</h4>
                <button onClick={() => navigate(`/learner/course/${course._id}`)} className="btn" style={{ width: '100%', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>✓ Start Learning</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section: Pending */}
      {pendingCourses.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#854d0e' }}>⏳ Waiting for Admin Approval</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {pendingCourses.map(course => (
              <div key={course._id} className="card" style={{ opacity: 0.8 }}>
                <img src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} alt={course.title} style={{ width: '100%', borderRadius: '8px', height: '140px', objectFit: 'cover' }} />
                <h4 style={{ margin: '10px 0' }}>{course.title}</h4>
                <button disabled className="btn" style={{ width: '100%', backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', cursor: 'not-allowed' }}>Pending Approval</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section: Discover */}
      <section>
        <h2>🌐 Discover More Courses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {availableCourses.map(course => (
            <div key={course._id} className="card">
              <img src={course.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'} alt={course.title} style={{ width: '100%', borderRadius: '8px', height: '140px', objectFit: 'cover' }} />
              <h4 style={{ margin: '10px 0' }}>{course.title}</h4>
              <button onClick={() => handleEnrollCourse(course._id)} className="btn btn-primary" style={{ width: '100%' }}>Request to Enroll</button>
            </div>
          ))}
        </div>
      </section>
    </LearnerLayout>
  );
};

export default Home;
