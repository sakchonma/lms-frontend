import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [allPathways, setAllPathways] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [userData, setUserData] = useState({ 
    myCourses: [], 
    pendingCourses: [], 
    level: 1, 
    xp: 0, 
    rank: 'ROOKIE',
    points: 0 
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resAll, resMe, resPaths, resClasses] = await Promise.all([
        API.get('/learner/catalog').catch(() => ({ data: [] })),
        API.get('/auth/me').catch(() => ({ data: {} })),
        API.get('/learner/all-pathways').catch(() => ({ data: [] })),
        API.get('/learner/classes').catch(() => ({ data: [] }))
      ]);
      setAllCourses(Array.isArray(resAll.data) ? resAll.data : []);
      setUserData({
        ...resMe.data,
        level: resMe.data.level || 1,
        xp: resMe.data.xp || 45, // Demo value
        rank: resMe.data.rank || 'NOVICE',
        points: resMe.data.points || 1250
      });
      setAllPathways(resPaths.data || []);
      setAllClasses(resClasses.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getCourseStatus = (courseId) => {
    if (!courseId) return 'available';
    const cIdStr = courseId.toString();
    if (userData.myCourses?.some(c => (c._id || (typeof c === 'string' ? c : c.courseId))?.toString() === cIdStr)) return 'enrolled';
    if (userData.pendingCourses?.some(c => (c._id || (typeof c === 'string' ? c : c.courseId))?.toString() === cIdStr)) return 'pending';
    return 'available';
  };

  if (loading) return <LearnerLayout><div style={{padding:'40px', color: 'var(--primary)', textAlign: 'center'}}>INITIALIZING SYSTEM...</div></LearnerLayout>;

  const enrolledCourses = allCourses.filter(c => getCourseStatus(c._id) === 'enrolled');
  const pendingCourses = allCourses.filter(c => getCourseStatus(c._id) === 'pending');
  const availableCourses = allCourses.filter(c => getCourseStatus(c._id) === 'available');

  const SectionHeader = ({ title, linkTo, emoji, color = 'var(--primary)' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color }}>{emoji}</span> {title}
      </h2>
      <Link to={linkTo} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.7rem', fontWeight: '700' }}>
        VIEW ALL
      </Link>
    </div>
  );

  const ResponsiveGrid = ({ children }) => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
      gap: '20px', 
      width: '100%',
      marginBottom: '60px'
    }}>
      {children}
    </div>
  );

  return (
    <LearnerLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* TOP STATUS BAR */}
        <div className="card" style={{ 
          padding: '20px 30px', 
          marginBottom: '40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #0f1115 0%, #1a1d23 100%)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={userData.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} 
                alt="Avatar" 
                style={{ width: '60px', height: '60px', borderRadius: '12px', border: '2px solid var(--primary)' }} 
              />
              <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900' }}>
                LVL {userData.level}
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>{userData.firstName} {userData.lastName}</h3>
              <p style={{ margin: '4px 0 8px 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', letterSpacing: '0.1em' }}>{userData.rank}</p>
              <div style={{ width: '200px' }}>
                <div className="xp-bar-container">
                  <div className="xp-bar-fill" style={{ width: `${userData.xp}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  <span>{userData.xp}/100 XP</span>
                  <span>NEXT LVL</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL POINTS</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>{userData.points.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>ACHIEVEMENTS</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>12/45</p>
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="card" style={{ 
          height: '350px', 
          marginBottom: '60px', 
          position: 'relative', 
          overflow: 'hidden',
          background: 'url(https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070) center/cover',
          display: 'flex',
          alignItems: 'center',
          padding: '0 60px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,6,8,0.9) 0%, transparent 100%)' }}></div>
          <div style={{ position: 'relative', maxWidth: '500px' }}>
            <span style={{ background: 'var(--primary)', color: 'black', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', marginBottom: '20px', display: 'inline-block' }}>NEW MISSION AVAILABLE</span>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1', letterSpacing: '-0.02em' }}>THE <span style={{ color: 'var(--primary)' }}>BLOCKCHAIN</span> PROTOCOL</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '30px', lineHeight: '1.6' }}>Master the core architecture of decentralized systems. Level up your engineering skills today.</p>
            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '0.9rem', fontWeight: '900' }} onClick={() => navigate('/learner/catalog')}>ENTER ARENA</button>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        {allPathways.length > 0 && (
          <section>
            <SectionHeader title="Elite Pathways" linkTo="/learner/pathway-catalog" emoji="⚡" />
            <ResponsiveGrid>
              {allPathways.slice(0, 4).map(path => (
                <div key={path._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/learner/pathway/${path._id}`)}>
                  <div style={{ position: 'relative', height: '150px' }}>
                    <img src={path.image || 'https://placehold.co/600x400/14151a/00ff88?text=QUEST'} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt="" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--card-bg), transparent)' }}></div>
                    <div style={{ position: 'absolute', bottom: '15px', left: '15px' }}>
                      <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '0.6rem' }}>{path.level || 'EXPERT'}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '800' }}>{path.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 20px 0', height: '2.25rem', overflow: 'hidden' }}>{path.description}</p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)' }}>+500 XP</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'white' }}>START QUEST →</span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </section>
        )}

        {allClasses.length > 0 && (
          <section>
            <SectionHeader title="Live Arenas" linkTo="/learner/class-catalog" emoji="🏟️" color="#3b82f6" />
            <ResponsiveGrid>
              {allClasses.slice(0, 4).map(cls => (
                <div key={cls._id} className="card" style={{ overflow: 'hidden', borderLeft: '4px solid #3b82f6' }} onClick={() => navigate(`/learner/class/${cls._id}`)}>
                  <div style={{ position: 'relative', height: '140px' }}>
                    <img src={cls.image || 'https://placehold.co/600x400/1e293b/3b82f6?text=ARENA'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '800' }}>{cls.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>👤 {cls.instructor}</span>
                      <span style={{ color: '#3b82f6', fontWeight: '900' }}>JOIN NOW</span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </section>
        )}

        <section>
          <SectionHeader title="Solo Quests" linkTo="/learner/catalog" emoji="🎮" />
          <ResponsiveGrid>
            {availableCourses.slice(0, 4).map(course => (
              <div key={course._id} className="card" style={{ overflow: 'hidden' }} onClick={() => navigate(`/learner/course/${course._id}`)}>
                <div style={{ position: 'relative', height: '160px' }}>
                  <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=SOLO'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '800' }}>{course.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{course.level}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)' }}>PLAY →</span>
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        </section>

      </div>
    </LearnerLayout>
  );
};

export default Home;
