import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { seekerAnalytics, jobs } from '../../data/mockData';
import { HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineChatAlt2, HiOutlineSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function CandidateDashboard() {
  const stats = [
    {
      label: 'Profile Completion',
      value: `${seekerAnalytics.profileCompletion}%`,
      icon: HiOutlineDocumentText,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Applications Sent',
      value: seekerAnalytics.applicationsSent,
      icon: HiOutlineClipboardList,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Interview Invites',
      value: seekerAnalytics.interviewInvitations,
      icon: HiOutlineChatAlt2,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      label: 'Saved Jobs',
      value: seekerAnalytics.savedJobs,
      icon: HiOutlineSparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  // Mock recommendations (first 2 jobs matching React/JS)
  const recommendations = jobs.slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-none">Welcome Back, Alex!</h1>
          <p className="text-xs text-gray-500 mt-1">Here is a summary of your matching jobs and job applications.</p>
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
                  <p className="text-2xl font-black text-gray-800 mt-0.5">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Splitting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Area: Recommended Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                <HiOutlineSparkles className="text-blue-600 h-5 w-5 animate-pulse" />
                <span>AI Recommended Jobs</span>
              </h2>
              <Link to="/recommended-jobs" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 bg-gray-50 rounded-lg border border-gray-150">{job.companyLogo}</span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-950">{job.title}</h3>
                      <p className="text-xs text-gray-500">{job.companyName} &bull; {job.location}</p>
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area: Recent Activity */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-905">Recent Activity</h2>
              <div className="space-y-4">
                {seekerAnalytics.recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs leading-relaxed border-l-2 border-blue-500 pl-3">
                    <div>
                      <p className="text-gray-700 font-medium">{act.text}</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{act.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
