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

  if (loading) return (
    <LearnerLayout>
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.2em' }}>ACCESSING SKILL TREES...</div>
      </div>
    </LearnerLayout>
  );

  return (
    <LearnerLayout>
      <div style={{ padding: '40px 20px' }} className="scanline">
        <div style={{ marginBottom: '60px', borderLeft: '4px solid var(--primary)', paddingLeft: '25px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            SKILL TREE <span style={{ color: 'var(--primary)', textShadow: '0 0 20px var(--primary-glow)' }}>REGISTRY</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '10px' }}>Select an epic quest line to master multiple neural protocols.</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          {pathways.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '100px 40px', textAlign: 'center', background: 'rgba(15,17,21,0.4)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>NO SKILL TREES DISCOVERED IN THIS SECTOR.</p>
            </div>
          ) : (
            pathways.map(path => (
              <div key={path._id} className="card" onClick={() => navigate(`/learner/pathway/${path._id}`)}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img 
                    src={path.image || 'https://placehold.co/600x400/14151a/00ff88?text=QUEST'} 
                    alt={path.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface), transparent)' }}></div>
                  <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                    <span style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', fontSize: '0.6rem', fontWeight: '900', borderRadius: '2px' }}>EPIC QUEST</span>
                  </div>
                </div>
                <div style={{ padding: '25px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase' }}>{path.category || 'GENERAL'}</span>
                  <h4 style={{ margin: '10px 0 15px 0', fontSize: '1.1rem', height: '1.4rem', overflow: 'hidden', color: 'white', fontWeight: '800' }}>{path.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '25px', height: '3.6rem', overflow: 'hidden', lineHeight: '1.2' }}>
                    {path.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '800' }}>REWARD</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'white' }}>+1500 XP</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '800' }}>RANK</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'white' }}>{path.level || 'BGN'}</span>
                      </div>
                    </div>
                    <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.6rem' }}>INITIALIZE →</button>
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

export default PathwayCatalog;
