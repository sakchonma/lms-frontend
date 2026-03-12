import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [allPathways, setAllPathways] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resAll, resMe, resPaths, resClasses, resInv] = await Promise.all([
        API.get('/learner/catalog').catch(() => ({ data: [] })),
        API.get('/auth/me').catch(() => ({ data: {} })),
        API.get('/learner/all-pathways').catch(() => ({ data: [] })),
        API.get('/learner/classes').catch(() => ({ data: [] })),
        API.get('/learner/inventory').catch(() => ({ data: [] }))
      ]);
      setAllCourses(Array.isArray(resAll.data) ? resAll.data : []);
      setUserData(resMe.data);
      setAllPathways(resPaths.data || []);
      setAllClasses(resClasses.data || []);
      setInventory(resInv.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEquip = async (itemId) => {
    try {
      const res = await API.post('/learner/equip', { itemId });
      setUserData(res.data.user);
    } catch (error) {
      alert('Error equipping item');
    }
  };

  const getCourseStatus = (courseId) => {
    if (!courseId || !userData) return 'available';
    const cIdStr = courseId.toString();
    if (userData.myCourses?.some(c => (c._id || (typeof c === 'string' ? c : c.courseId))?.toString() === cIdStr)) return 'enrolled';
    if (userData.pendingCourses?.some(c => (c._id || (typeof c === 'string' ? c : c.courseId))?.toString() === cIdStr)) return 'pending';
    return 'available';
  };

  if (loading || !userData) return (
    <LearnerLayout>
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '0.2em', marginBottom: '10px' }}>SYSTEM BOOTING</div>
        <div style={{ width: '300px' }} className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: '60%' }}></div>
        </div>
      </div>
    </LearnerLayout>
  );

  const currentAvatar = userData.equippedAvatar || userData.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky';
  const currentFrame = userData.equippedFrame || '';

  const enrolledCourses = allCourses.filter(c => getCourseStatus(c._id) === 'enrolled');
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }} className="scanline">
        
        {/* PLAYER HUD - Updated to 2 columns */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <div className="card" onClick={() => setShowProfileModal(true)} style={{ padding: '20px', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                {currentFrame && <img src={currentFrame} alt="" style={{ position: 'absolute', inset: '-8px', width: '76px', height: '76px', zIndex: 2 }} />}
                <img src={currentAvatar} alt="Avatar" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900', zIndex: 3 }}>
                  LVL {userData.level}
                </div>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{userData.firstName}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800' }}>{userData.rank}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.7rem' }}>
              <span style={{ fontWeight: '900', color: 'white' }}>ENERGY / XP</span>
              <span style={{ color: 'var(--primary)' }}>{userData.xp % 1000}/1000 XP</span>
            </div>
            <div className="xp-bar-container" style={{ height: '8px' }}>
              <div className="xp-bar-fill" style={{ width: `${(userData.xp % 1000) / 10}%` }}></div>
            </div>
          </div>
        </div>

        {/* PROFILE MODAL */}
        {showProfileModal && (
          <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '30px', background: 'var(--surface)', border: '1px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>EQUIPMENT ARSENAL</h2>
                <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {inventory.map(item => (
                  <div key={item._id} className="card" onClick={() => handleEquip(item._id)} style={{ padding: '10px', textAlign: 'center', borderColor: (userData.equippedAvatar === item.image || userData.equippedFrame === item.image) ? 'var(--primary)' : 'var(--border)' }}>
                    <img src={item.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.6rem', fontWeight: '800', color: 'white' }}>{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <div className="card" style={{ 
          height: '350px', 
          marginBottom: '60px', 
          position: 'relative', 
          overflow: 'hidden',
          backgroundImage: 'url(https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          padding: '0 60px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,6,8,0.9) 0%, transparent 100%)' }}></div>
          <div style={{ position: 'relative', maxWidth: '500px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', marginBottom: '20px', display: 'inline-block' }}>NEW PROTOCOL AVAILABLE</span>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1', color: 'white' }}>THE <span style={{ color: 'var(--primary)' }}>NEURAL</span> NEXUS</h1>
            <button className="btn btn-primary" onClick={() => navigate('/learner/catalog')}>INITIATE PROTOCOL</button>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        {allPathways.length > 0 && (
          <section>
            <SectionHeader title="My Pathways" linkTo="/learner/pathway-catalog" emoji="⚡" />
            <ResponsiveGrid>
              {allPathways.slice(0, 4).map(path => (
                <div key={path._id} className="card" onClick={() => navigate(`/learner/pathway/${path._id}`)}>
                  <div style={{ height: '150px', position: 'relative' }}>
                    <img src={path.image || 'https://placehold.co/600x400/14151a/00ff88?text=QUEST'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface), transparent)' }}></div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '800', color: 'white' }}>{path.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)' }}>+1500 XP</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'white' }}>LAUNCH →</span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </section>
        )}

        {allClasses.length > 0 && (
          <section>
            <SectionHeader title="My Classrooms" linkTo="/learner/class-catalog" emoji="🏟️" color="#3b82f6" />
            <ResponsiveGrid>
              {allClasses.slice(0, 4).map(cls => (
                <div key={cls._id} className="card" onClick={() => navigate(`/learner/class/${cls._id}`)}>
                  <div style={{ height: '140px' }}>
                    <img src={cls.image || 'https://placehold.co/600x400/1e293b/3b82f6?text=ARENA'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>{cls.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>👤 MASTER {cls.instructor}</span>
                      <span style={{ color: '#3b82f6', fontWeight: '900' }}>ENTER</span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </section>
        )}

        {/* ENROLLED MISSIONS */}
        {enrolledCourses.length > 0 && (
          <section>
            <SectionHeader title="My Courses" linkTo="/learner/my-courses" emoji="🎯" color="var(--primary)" />
            <ResponsiveGrid>
              {enrolledCourses.slice(0, 4).map(course => (
                <div key={course._id} className="card" onClick={() => navigate(`/learner/course/${course._id}`)}>
                  <div style={{ height: '140px' }}>
                    <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=SOLO'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>{course.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '900' }}>RESUME PROTOCOL →</span>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </section>
        )}

        {/* AVAILABLE MISSIONS */}
        <section>
          <SectionHeader title="Available Protocols" linkTo="/learner/catalog" emoji="🎮" />
          <ResponsiveGrid>
            {availableCourses.slice(0, 8).map(course => (
              <div key={course._id} className="card" onClick={() => navigate(`/learner/course/${course._id}`)}>
                <div style={{ height: '160px' }}>
                  <img src={course.image || 'https://placehold.co/600x400/14151a/00ff88?text=SOLO'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>{course.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RANK: {course.level}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)' }}>INITIALIZE →</span>
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
