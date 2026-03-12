import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PathwayCatalog = () => {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPathways = async () => {
      try {
        const { data } = await API.get('/learner/all-pathways');
        setPathways(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPathways();
  }, []);

  if (loading) return <LearnerLayout><p>Loading pathways...</p></LearnerLayout>;

  return (
    <LearnerLayout>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(0,255,136,0.1)' }}>PATHWAY <span style={{ color: 'var(--primary)' }}>CATALOG</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Curated roadmaps to take you from beginner to expert.</p>
      </div>
      
      <div className="grid" style={{ marginTop: '40px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {pathways.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pathways available at the moment.</p>
        ) : (
          pathways.map(path => (
            <div 
              key={path._id} 
              className="card" 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column',
                borderTop: '4px solid var(--primary)'
              }} 
              onClick={() => navigate(`/learner/pathway/${path._id}`)}
            >
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{path.level || 'Expert'}</span>
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'white', lineHeight: '1.4' }}>{path.title}</h3>
                <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                  {path.description}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--secondary)' }}>
                    <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)' }}>GO →</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </LearnerLayout>
  );
};

export default PathwayCatalog;
