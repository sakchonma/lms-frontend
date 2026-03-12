import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Pathways = () => {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPathways = async () => {
    try {
      const { data } = await API.get('/learner/pathways');
      setPathways(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error(error); 
      setPathways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPathways(); 
  }, []);

  const PathwayCard = ({ path }) => (
    <div 
      key={path._id} 
      className="card" 
      style={{ 
        cursor: 'pointer', 
        borderTop: '4px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        height: '100%'
      }} 
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => navigate(`/learner/pathway/${path._id}`)}
    >
      <div style={{ position: 'relative', height: '160px' }}>
        <img 
          src={path.image || 'https://placehold.co/600x400/14151a/00ff88?text=PATHWAY'} 
          alt={path.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{path.level || 'Expert'}</span>
        </div>
      </div>
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'white', lineHeight: '1.4', fontWeight: '800' }}>{path.title}</h3>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)', 
          marginBottom: '20px', 
          height: '4.8em', 
          overflow: 'hidden', 
          display: '-webkit-box', 
          WebkitLineClamp: '3', 
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.6'
        }}>
          {path.description}
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)' }}>EXPLORE PATHWAY →</span>
        </div>
      </div>
    </div>
  );

  return (
    <LearnerLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: '900' }}>
            MY <span style={{ color: 'var(--primary)' }}>PATHWAYS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Your enrolled learning journeys and progress.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'white' }}>Loading your pathways...</div>
        ) : pathways.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {pathways.map(path => <PathwayCard key={path._id} path={path} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't enrolled in any pathways yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/learner/pathway-catalog')}>Browse Pathway Catalog</button>
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default Pathways;
