import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

const ClassCatalog = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await API.get('/learner/classes');
        setClasses(Array.isArray(data) ? data : []);
      } catch (error) { 
        console.error(error); 
        setClasses([]);
      } finally { 
        setLoading(false); 
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <LearnerLayout><div style={{padding:'20px', color: 'white'}}>Loading classes...</div></LearnerLayout>;

  return (
    <LearnerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(59,130,246,0.1)' }}>
            LIVE <span style={{ color: '#3b82f6' }}>CLASSES</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            Join our live workshops and interactive sessions led by experts.
          </p>
        </div>

        {classes.length > 0 ? (
          <div className="grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px',
            marginTop: '40px'
          }}>
            {classes.map(cls => (
              <div 
                key={cls._id} 
                className="card" 
                style={{ 
                  cursor: 'pointer', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease',
                  height: '100%',
                  borderLeft: '4px solid #3b82f6',
                  display: 'flex',
                  flexDirection: 'column'
                }} 
                onClick={() => navigate(`/learner/class/${cls._id}`)}
              >
                <div style={{ position: 'relative', height: '160px' }}>
                  <img 
                    src={cls.image || 'https://placehold.co/600x400/1e293b/3b82f6?text=CLASS'} 
                    alt={cls.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge" style={{ fontSize: '0.6rem', background: '#3b82f6', color: 'white' }}>
                      {cls.category || 'Workshop'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '700' }}>
                    {cls.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👤 {cls.instructor || 'TBA'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>
                        📅 {cls.rounds?.[0]?.start ? new Date(cls.rounds[0].start).toLocaleDateString() : 'Upcoming'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {cls.rounds?.length || 0} Rounds Available
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '900' }}>VIEW →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No live classes available at the moment.</p>
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default ClassCatalog;
