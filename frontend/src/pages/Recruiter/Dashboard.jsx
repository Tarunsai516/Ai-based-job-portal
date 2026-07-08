import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { recruiterAnalytics, candidates } from '../../data/mockData';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineBadgeCheck, HiOutlineCalendar, HiSparkles, HiTrendingUp } from 'react-icons/hi';

export default function RecruiterDashboard() {
  const stats = [
    {
      label: 'Jobs Posted',
      value: recruiterAnalytics.jobsPosted,
      icon: HiOutlineBriefcase,
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    {
      label: 'Applications Received',
      value: recruiterAnalytics.applicationsReceived,
      icon: HiOutlineUserGroup,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      label: 'Shortlisted',
      value: recruiterAnalytics.shortlistedCandidates,
      icon: HiOutlineBadgeCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-100'
    },
    {
      label: 'Interviews Scheduled',
      value: recruiterAnalytics.interviewsScheduled,
      icon: HiOutlineCalendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Title Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-none">Recruitment Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">Review active talent requests and matching metrics.</p>
          </div>
          <Link
            to="/recruiter/post-job"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Post a Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex items-center space-x-4">
                <div className={`p-3 rounded-lg border ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-805 mt-0.5">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Recent Applications table */}
          <div className="lg:col-span-2 bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-905 flex items-center space-x-1">
                <HiTrendingUp className="h-5 w-5 text-blue-600" />
                <span>Recent Applications</span>
              </h3>
              <Link to="/recruiter/applicants" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-150 text-xs">
                <thead>
                  <tr className="text-left font-bold text-gray-400 bg-gray-50/50">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Applied Position</th>
                    <th className="p-3">Match</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recruiterAnalytics.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-semibold text-gray-900">{app.name}</td>
                      <td className="p-3 text-gray-500">{app.jobTitle}</td>
                      <td className="p-3">
                        <span className={`font-bold ${app.matchScore >= 85 ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {app.matchScore}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/recruiter/candidates/${app.id === 'rap1' ? 'can1' : 'can2'}`}
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
          </div>

          {/* Top Matching Candidates list */}
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-905 flex items-center space-x-1">
              <HiSparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
              <span>Top AI Matches</span>
            </h3>

            <div className="space-y-4">
              {candidates.map((cand) => (
                <div key={cand.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl select-none">{cand.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-805 leading-none">{cand.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{cand.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{cand.matchScore}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
