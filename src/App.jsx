import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminCourses from './pages/admin/Courses';
import LearnerHome from './pages/learner/Home';
import LearnerCatalog from './pages/learner/Catalog';
import LearnerMyCourses from './pages/learner/MyCourses';

import AdminClasses from './pages/admin/Classes';
import AdminPathways from './pages/admin/Pathways';
import LearnerCourseDetail from './pages/learner/CourseDetail';
import LearnerPathways from './pages/learner/Pathways';
import LearnerPathwayCatalog from './pages/learner/PathwayCatalog';
import LearnerPathwayDetail from './pages/learner/PathwayDetail';
import LearnerClassCatalog from './pages/learner/ClassCatalog';
import LearnerClassDetail from './pages/learner/ClassDetail';
import LearnerMyClasses from './pages/learner/MyClasses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="pathways" element={<AdminPathways />} />
        </Route>

        {/* Learner Routes */}
        <Route path="/learner">
          <Route path="home" element={<LearnerHome />} />
          <Route path="catalog" element={<LearnerCatalog />} />
          <Route path="my-courses" element={<LearnerMyCourses />} />
          <Route path="course/:id" element={<LearnerCourseDetail />} />
          <Route path="pathway/:id" element={<LearnerPathwayDetail />} />
          <Route path="pathways" element={<LearnerPathways />} />
          <Route path="pathway-catalog" element={<LearnerPathwayCatalog />} />
          <Route path="class-catalog" element={<LearnerClassCatalog />} />
          <Route path="my-classes" element={<LearnerMyClasses />} />
          <Route path="class/:id" element={<LearnerClassDetail />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
