import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { applications as initialApplications, jobs } from '../../data/mockData';
import { HiOutlineBriefcase, HiOutlineClock } from 'react-icons/hi';

export default function AppliedJobs() {
  const [applications] = useState(initialApplications);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'Interviewing': return 'bg-purple-50 text-purple-700 border-purple-250';
      case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-250';
      default: return 'bg-gray-50 text-gray-750 border-gray-250';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">My Applications</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your submitted job applications, interview timelines, and compatibility index.</p>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="You haven't applied to any jobs yet"
            message="Find career opportunities matching your profile on the Job Board."
            actionText="Find Jobs"
            onAction={() => window.location.replace('/jobs')}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-150">
              {applications.map((app) => {
                const matchedJob = jobs.find((j) => j.id === app.jobId);
                return (
                  <div key={app.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl p-2 bg-gray-50 border border-gray-100 rounded-lg select-none">
                        {matchedJob ? matchedJob.companyLogo : '🏢'}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase">
                          {app.companyName}
                        </h3>
                        <Link to={`/jobs/${app.jobId}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {app.jobTitle}
                        </Link>
                        <div className="flex items-center text-[10px] text-gray-400 mt-1">
                          <HiOutlineClock className="mr-1 h-3.5 w-3.5" />
                          <span>Applied on: {app.appliedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Match Compatibility</span>
                        <span className="text-xs font-extrabold text-blue-600">{app.matchScore}%</span>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>

                      <Link
                        to="/application-status"
                        className="px-3.5 py-1.5 border border-gray-205 text-gray-650 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        Track Status
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
