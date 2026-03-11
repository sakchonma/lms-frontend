import React, { useEffect, useState } from 'react';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Pathways = () => {
  const [pathways, setPathways] = useState([]);
  const navigate = useNavigate();

  const fetchPathways = async () => {
    try {
      const { data } = await API.get('/learner/pathways');
      setPathways(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchPathways(); }, []);

  return (
    <LearnerLayout>
      <h1>My Learning Pathways</h1>
      <p style={{ color: 'var(--secondary)' }}>Complete courses in sequence to unlock the next level.</p>
      
      {pathways.map(pathway => (
        <div key={pathway._id} className="card" style={{ marginTop: '30px' }}>
          <h2>{pathway.title}</h2>
          <p>{pathway.description}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {pathway.courses.map((item, index) => (
              <div 
                key={item.courseId._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  backgroundColor: item.isLocked ? '#f1f5f9' : '#fff',
                  opacity: item.isLocked ? 0.7 : 1
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: item.isCompleted ? '#10b981' : (item.isLocked ? '#94a3b8' : 'var(--primary)'), color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '20px', fontWeight: 'bold' }}>
                  {item.isCompleted ? '✓' : index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{item.courseId.title}</h4>
                  <small style={{ color: item.isCompleted ? '#10b981' : (item.isLocked ? '#ef4444' : '#64748b') }}>
                    {item.isCompleted ? 'Completed' : (item.isLocked ? 'Prerequisite Required' : 'Available')}
                  </small>
                </div>

                <button 
                  disabled={item.isLocked}
                  onClick={() => navigate(`/learner/course/${item.courseId._id}`)}
                  className="btn"
                  style={{ backgroundColor: item.isLocked ? '#cbd5e1' : 'var(--primary)', color: 'white' }}
                >
                  {item.isLocked ? '🔒 Locked' : (item.isCompleted ? 'Review' : 'Start Learning')}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </LearnerLayout>
  );
};

export default Pathways;
