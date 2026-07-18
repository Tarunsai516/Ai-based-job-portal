import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import {
  HiOutlineDocumentText, HiOutlineClipboardList,
  HiOutlineChatAlt2, HiOutlineSparkles,
  HiOutlineBriefcase, HiOutlineCheckCircle,
  HiOutlineArrowRight, HiOutlineClock, HiLocationMarker, HiCurrencyDollar
} from 'react-icons/hi';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const candidateId = user?.id || '1';

    try {
      const [analyticsData, jobsData, appsData, profileData] = await Promise.all([
        analyticsService.getSeeker(candidateId).catch(() => null),
        jobService.getAll().catch(() => []),
        applicationService.getByCandidateId(candidateId).catch(() => []),
        candidateService.getById(candidateId).catch(() => null)
      ]);

      setAnalytics(analyticsData);
      setCandidateProfile(profileData);

      const apps = Array.isArray(appsData) ? appsData : [];
      setApplications(apps);
      setAppliedJobIds(apps.map(a => a.jobId?.toString()));

      const allJobs = Array.isArray(jobsData) ? jobsData : [];
      
      // Calculate dynamic AI Match score for each job based on candidate's skills
      const candidateSkills = (profileData?.skills || ['React', 'JavaScript', 'Tailwind CSS']).map(s => s.toLowerCase());
      
      const scoredJobs = allJobs.map(job => {
        const reqSkills = (job.skills || []).map(s => s.toLowerCase());
        let score = 75; // baseline match
        if (reqSkills.length > 0) {
          const matchCount = reqSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs))).length;
          score = Math.min(98, Math.max(65, Math.round(70 + (matchCount / reqSkills.length) * 28)));
        }
        return { ...job, matchScore: score };
      });

      // Sort by highest matchScore
      scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(scoredJobs.slice(0, 4));

    } catch (err) {
      console.error('Failed loading candidate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    const stringId = job.id?.toString();
    if (appliedJobIds.includes(stringId)) return;

    try {
      await applicationService.apply({
        jobId: stringId,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'Applied',
        candidateId: user?.id || '1',
        candidateName: user?.name || 'Candidate',
        matchScore: job.matchScore || 85
      });

      setAppliedJobIds(prev => [...prev, stringId]);
      setToast({
        message: `Successfully applied to ${job.title} at ${job.companyName}!`,
        type: 'success'
      });
      // Refresh analytics
      fetchDashboardData();
    } catch {
      setToast({ message: 'Failed to submit application. Try again.', type: 'error' });
    }
  };

  const completionPercent = analytics?.profileCompletion || (candidateProfile?.skills?.length ? 85 : 40);

  const stats = [
    {
      label: 'Profile Completion',
      value: `${completionPercent}%`,
      icon: HiOutlineDocumentText,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Applications Sent',
      value: analytics?.applicationsSent ?? applications.length,
      icon: HiOutlineClipboardList,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Interview Invites',
      value: analytics?.interviewInvitations ?? applications.filter(a => a.status === 'Interviewing').length,
      icon: HiOutlineChatAlt2,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      label: 'Shortlisted',
      value: analytics?.savedJobs ?? applications.filter(a => a.status === 'Shortlisted').length,
      icon: HiOutlineSparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-8">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              Welcome Back, {user?.name || candidateProfile?.name || 'Job Seeker'}! 👋
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {candidateProfile?.title ? `${candidateProfile.title} · ` : ''}Here is your live career matching overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/resume/upload"
              className="px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Analyze Resume
            </Link>
            <Link
              to="/jobs"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Explore Jobs
            </Link>
          </div>
        </div>

        {/* Profile Completion Progress Widget (If < 100%) */}
        {completionPercent < 100 && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <HiOutlineSparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold">Boost Your AI Skill Compatibility Index</h3>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
                Your profile is <span className="font-extrabold text-white">{completionPercent}% complete</span>. Add your resume or skill tags to increase your compatibility match scores with top recruiters.
              </p>
              <div className="w-full bg-blue-950/60 rounded-full h-2 mt-2 border border-blue-700/50">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <Link
              to="/profile/edit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex-shrink-0 flex items-center space-x-1"
            >
              <span>Complete Profile</span>
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Live Stats Grid */}
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* AI Recommended Opportunities */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <HiOutlineSparkles className="text-blue-600 h-5 w-5 animate-pulse" />
                <span>AI Recommended Opportunities</span>
              </h2>
              <Link to="/recommended-jobs" className="text-xs font-semibold text-blue-600 hover:underline">
                View All Matches &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm animate-pulse space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState
                title="No Openings Available"
                message="No job postings are live right now. Check back soon!"
              />
            ) : (
              <div className="space-y-4">
                {recommendations.map((job) => {
                  const isApplied = appliedJobIds.includes(job.id?.toString());
                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-gray-200 hover:border-blue-300 p-6 rounded-xl shadow-sm transition-all duration-200 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <span className="text-3xl p-2.5 bg-gray-50 border border-gray-150 rounded-xl select-none">
                            {job.companyLogo || '🏢'}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{job.companyName}</h4>
                            <Link to={`/jobs/${job.id}`} className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              {job.title}
                            </Link>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center"><HiLocationMarker className="mr-1 h-3.5 w-3.5" />{job.location}</span>
                              {job.salary && <span className="flex items-center"><HiCurrencyDollar className="mr-1 h-3.5 w-3.5" />{job.salary}</span>}
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-100">{job.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Match Badge */}
                        <div className="text-right">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
                            <HiOutlineSparkles className="h-3.5 w-3.5" />
                            <span>{job.matchScore}% Match</span>
                          </span>
                        </div>
                      </div>

                      {/* Skill Tags */}
                      {(job.skills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.map((skill) => (
                            <span key={skill} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <Link to={`/jobs/${job.id}`} className="text-xs font-semibold text-gray-500 hover:text-blue-600">
                          Job Details &rarr;
                        </Link>
                        <button
                          onClick={() => handleApply(job)}
                          disabled={isApplied}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
                            isApplied
                              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isApplied ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Application Tracker & Recent Activity */}
          <div className="space-y-6">

            {/* Applications Progress Card */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                  <HiOutlineBriefcase className="h-4 w-4 text-emerald-600" />
                  <span>My Submitted Applications</span>
                </h2>
                <Link to="/applied-jobs" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-1">📬</span>
                  <p className="text-xs text-gray-400">You haven't applied to any jobs yet.</p>
                  <Link to="/jobs" className="mt-2 inline-block text-xs text-blue-600 font-bold hover:underline">
                    Browse jobs and apply &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 bg-gray-50/50 transition-colors flex justify-between items-center"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-gray-800 truncate">{app.jobTitle}</p>
                        <p className="text-[10px] text-gray-500">{app.companyName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                        app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        app.status === 'Interviewing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {app.status || 'Applied'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            {analytics?.recentActivity?.length > 0 && (
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                  <HiOutlineClock className="h-4 w-4 text-blue-600" />
                  <span>Recent Activity</span>
                </h3>
                <div className="space-y-3">
                  {analytics.recentActivity.map((act, idx) => (
                    <div key={act.id || idx} className="flex items-start space-x-3 text-xs">
                      <HiOutlineCheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-750">{act.text}</p>
                        <span className="text-[10px] text-gray-400">{act.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
