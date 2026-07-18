import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home/Home';
import About from '../pages/Home/About';
import Contact from '../pages/Home/Contact';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import NotFound from '../pages/Home/NotFound';

// Seeker Pages
import CandidateDashboard from '../pages/Candidate/Dashboard';
import Profile from '../pages/Profile/Profile';
import EditProfile from '../pages/Profile/EditProfile';
import ResumeUpload from '../pages/Candidate/ResumeUpload';
import MyResume from '../pages/Candidate/MyResume';
import JobListings from '../pages/Jobs/JobListings';
import JobDetails from '../pages/Jobs/JobDetails';
import RecommendedJobs from '../pages/Candidate/RecommendedJobs';
import AppliedJobs from '../pages/Candidate/AppliedJobs';
import ApplicationStatus from '../pages/Candidate/ApplicationStatus';
import CandidateNotifications from '../pages/Candidate/Notifications';
import Settings from '../pages/Settings/Settings';

// Recruiter Pages
import RecruiterDashboard from '../pages/Recruiter/Dashboard';
import PostJob from '../pages/Recruiter/PostJob';
import ManageJobs from '../pages/Recruiter/ManageJobs';
import EditJob from '../pages/Recruiter/EditJob';
import ApplicantsList from '../pages/Recruiter/ApplicantsList';
import CandidateDetails from '../pages/Recruiter/CandidateDetails';
import AnalyticsDashboard from '../pages/Recruiter/AnalyticsDashboard';
import CompanyProfile from '../pages/Recruiter/CompanyProfile';
import RecruiterNotifications from '../pages/Recruiter/Notifications';
import RecruiterSettings from '../pages/Recruiter/Settings';

import ProtectedRoute from '../components/layout/ProtectedRoute';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageUsers from '../pages/Admin/ManageUsers';
import AdminManageJobs from '../pages/Admin/ManageJobs';
import ManageApplications from '../pages/Admin/ManageApplications';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Seeker / Candidate Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/upload"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <ResumeUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume/my"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <MyResume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <JobListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommended-jobs"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <RecommendedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applied-jobs"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <AppliedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/application-status"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <ApplicationStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <CandidateNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/post-job"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/manage-jobs"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <ManageJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/edit-job/:id"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <EditJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applicants"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <ApplicantsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/candidates/:id"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <CandidateDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/analytics"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/company"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/notifications"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/settings"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterSettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminManageJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplications />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
