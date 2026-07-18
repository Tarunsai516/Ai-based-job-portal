import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import {
  HiOutlineBriefcase, HiOutlineUserGroup,
  HiOutlineBadgeCheck, HiOutlineCalendar,
  HiSparkles, HiTrendingUp, HiOutlinePlusCircle,
  HiOutlineEye, HiOutlinePencil, HiLocationMarker
} from 'react-icons/hi';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const recruiterId = user?.id ? String(user.id) : '';
    const recruiterEmail = user?.email || '';

    try {
      const [analyticsData, jobsData, appsData, candidatesData] = await Promise.all([
        analyticsService.getRecruiter(recruiterId).catch(() => null),
        jobService.getAll('', '', '', recruiterId, recruiterEmail).catch(() => []),
        applicationService.getByRecruiterId(recruiterId).catch(() => applicationService.getAll().catch(() => [])),
        candidateService.getAll().catch(() => [])
      ]);

      setAnalytics(analyticsData);

      const allJobs = Array.isArray(jobsData) ? jobsData : [];
      setJobs(allJobs);

      const allApps = Array.isArray(appsData) ? appsData : [];
      setApplications(allApps);

      const allCandidates = Array.isArray(candidatesData) ? candidatesData : [];

      // Combine scored candidates from candidate profiles + application matchScores
      let candidateList = [];
      if (allApps.length > 0) {
        candidateList = [...allApps]
          .filter(a => a.matchScore != null)
          .sort((a, b) => b.matchScore - a.matchScore);
      }
      
      if (candidateList.length === 0 && allCandidates.length > 0) {
        candidateList = [...allCandidates]
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      setTopCandidates(candidateList.slice(0, 5));
    } catch (err) {
      console.error('Failed loading recruiter dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      // Update application status in real-time UI
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setToast({
        message: `Application status updated to "${newStatus}"!`,
        type: 'success'
      });
    } catch {
      setToast({ message: 'Failed to update status.', type: 'error' });
    }
  };

  const recentApps = applications.slice(0, 5);
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewingCount = applications.filter(a => a.status === 'Interviewing').length;

  const stats = [
    {
      label: 'Jobs Posted',
      value: analytics?.jobsPosted ?? jobs.length,
      icon: HiOutlineBriefcase,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Applications Received',
      value: analytics?.applicationsReceived ?? applications.length,
      icon: HiOutlineUserGroup,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Shortlisted',
      value: analytics?.shortlistedCandidates ?? shortlistedCount,
      icon: HiOutlineBadgeCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      label: 'Interviews Scheduled',
      value: analytics?.interviewsScheduled ?? interviewingCount,
      icon: HiOutlineCalendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-8">

        {/* Dynamic Recruiter Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-none">
              Recruitment Dashboard 👋
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {user?.companyName ? `${user.companyName} · ` : ''}Manage active job openings, applicant pipeline, and AI match scores.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/recruiter/manage-jobs"
              className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Manage Jobs
            </Link>
            <Link
              to="/recruiter/post-job"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
            >
              <HiOutlinePlusCircle className="h-4 w-4" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>

        {/* Live Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            : stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className={`p-3 rounded-lg border ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-black text-gray-800 mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Column: Recent Applications & Active Jobs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Applications Table */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                  <HiTrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Recent Applicant Pipeline</span>
                </h3>
                <Link to="/recruiter/applicants" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All ({applications.length}) &rarr;
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : recentApps.length === 0 ? (
                <EmptyState
                  title="No Applications Yet"
                  message="No candidates have submitted applications for your posted jobs yet."
                  actionText="Post a New Job"
                  onAction={() => window.location.replace('/recruiter/post-job')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-xs">
                    <thead>
                      <tr className="text-left font-bold text-gray-400 bg-gray-50/50">
                        <th className="p-3">Candidate</th>
                        <th className="p-3">Applied For</th>
                        <th className="p-3">AI Match</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {recentApps.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 font-semibold text-gray-900">
                            {app.candidateName || app.name || 'Candidate'}
                          </td>
                          <td className="p-3 text-gray-500 truncate max-w-[160px]">{app.jobTitle}</td>
                          <td className="p-3">
                            <span className={`font-bold ${(app.matchScore || 0) >= 85 ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {app.matchScore != null ? `${app.matchScore}%` : '—'}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={app.status || 'Applied'}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.status === 'Interviewing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              to={`/recruiter/candidates/${app.candidateId || app.id || 1}`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Evaluate
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Job Openings Overview */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <HiOutlineBriefcase className="h-5 w-5 text-emerald-600" />
                  <span>Active Job Listings ({jobs.length})</span>
                </h3>
                <Link to="/recruiter/manage-jobs" className="text-xs font-semibold text-blue-600 hover:underline">
                  Manage All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-400">No jobs posted yet. Create your first listing to start receiving candidates.</p>
                  <Link to="/recruiter/post-job" className="mt-2 inline-block text-xs text-blue-600 font-bold hover:underline">
                    + Post a Job Now
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {jobs.slice(0, 4).map((job) => {
                    const jobAppsCount = applications.filter(a => a.jobId === job.id?.toString()).length;
                    return (
                      <div key={job.id} className="py-3 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                        <div className="space-y-0.5">
                          <Link to={`/jobs/${job.id}`} className="text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            {job.title}
                          </Link>
                          <div className="flex items-center space-x-3 text-[10px] text-gray-400">
                            <span className="flex items-center"><HiLocationMarker className="mr-0.5 h-3 w-3" />{job.location}</span>
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">{job.type}</span>
                            {job.salary && <span>{job.salary}</span>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {jobAppsCount} Applicant{jobAppsCount !== 1 ? 's' : ''}
                          </span>
                          <Link
                            to={`/recruiter/edit-job/${job.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Job"
                          >
                            <HiOutlinePencil className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Top AI Candidates Sidebar */}
          <div className="space-y-6">

            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                  <HiSparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                  <span>Top AI Candidate Matches</span>
                </h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : topCandidates.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No scored candidates yet.</p>
              ) : (
                <div className="space-y-3">
                  {topCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-blue-200 transition-colors flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <span className="text-2xl select-none flex-shrink-0">
                          {cand.avatar || '👤'}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-850 truncate">
                            {cand.candidateName || cand.name || 'Candidate'}
                          </h4>
                          <p className="text-[10px] text-gray-500 truncate">{cand.jobTitle || cand.title || 'Tech Specialist'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {cand.matchScore}%
                        </span>
                        <Link
                          to={`/recruiter/candidates/${cand.candidateId || cand.id || 1}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Evaluate Candidate"
                        >
                          <HiOutlineEye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-xl shadow-md space-y-4">
              <h3 className="text-sm font-bold flex items-center space-x-2">
                <HiSparkles className="h-5 w-5 text-emerald-400" />
                <span>Recruiter Quick Tools</span>
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Post new openings, review candidate resumes, and view hiring analytics.
              </p>
              <div className="space-y-2 pt-2">
                <Link
                  to="/recruiter/post-job"
                  className="block w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
                >
                  + Post a Job Position
                </Link>
                <Link
                  to="/recruiter/analytics"
                  className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10"
                >
                  View Hiring Analytics
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
