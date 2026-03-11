import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import API from '../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await API.get(`/learner/course/${id}`);
        setCourse(data);
        if (data.sections?.[0]?.lessons?.[0]) {
          setActiveLesson(data.sections[0].lessons[0]);
        }
      } catch (error) { console.error(error); }
    };
    fetchCourse();
  }, [id]);

  const handleComplete = async () => {
    try {
      await API.post(`/learner/complete-course/${id}`);
      alert('Course completed! Next course in pathway unlocked.');
    } catch (error) { alert('Error marking course as completed'); }
  };

  if (!course) return <LearnerLayout><p>Loading...</p></LearnerLayout>;

  return (
    <LearnerLayout>
      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>{course.title}</h1>
            <button onClick={handleComplete} className="btn" style={{ backgroundColor: '#10b981', color: 'white' }}>✓ Mark as Completed</button>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', backgroundColor: '#000', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            {activeLesson?.videoUrl ? (
              <iframe width="100%" height="100%" src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} title="video" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <p>Select a lesson to start learning</p>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <h2>{activeLesson?.title || 'Course Overview'}</h2>
            <p>{activeLesson?.content || course.description}</p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Course Content</h3>
          {course.sections?.map(section => (
            <div key={section._id} style={{ marginBottom: '15px' }}>
              <h4 style={{ backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '6px' }}>{section.title}</h4>
              <div style={{ paddingLeft: '10px' }}>
                {section.lessons?.map(lesson => (
                  <div 
                    key={lesson._id} 
                    onClick={() => setActiveLesson(lesson)}
                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: activeLesson?._id === lesson._id ? 'var(--primary)' : 'inherit', fontWeight: activeLesson?._id === lesson._id ? 'bold' : 'normal' }}
                  >
                    {lesson.type === 'video' ? '📺' : '📄'} {lesson.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default CourseDetail;
