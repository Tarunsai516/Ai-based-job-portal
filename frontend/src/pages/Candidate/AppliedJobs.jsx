import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineClock } from 'react-icons/hi';

const statusColor = (status) => {
  switch (status) {
    case 'Shortlisted': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Interviewing': return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Rejected': return 'bg-red-50 text-red-700 border border-red-200';
    case 'Applied':
    default: return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
};

export default function AppliedJobs() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const candidateId = user?.id || 1;
    applicationService.getByCandidateId(candidateId)
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setApplications([]);
        setLoading(false);
      });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your submitted job applications and interview progress.</p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {[1,2,3].map(i => (
              <div key={i} className="p-6 flex justify-between items-center animate-pulse">
                <div className="flex space-x-3">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg" />
                  <div className="space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-36" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                    <div className="h-2 bg-gray-100 rounded w-20" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Applications Yet"
            message="You haven't applied to any jobs. Browse available openings and apply to track them here."
            actionText="Browse Jobs"
            onAction={() => window.location.replace('/jobs')}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-100">
              {applications.map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 bg-gray-50 border border-gray-100 rounded-lg select-none">🏢</span>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase">{app.companyName}</h3>
                      <Link to={`/jobs/${app.jobId}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {app.jobTitle}
                      </Link>
                      <div className="flex items-center text-[10px] text-gray-400 mt-1">
                        <HiOutlineClock className="mr-1 h-3.5 w-3.5" />
                        <span>Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    {app.matchScore != null && (
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">AI Match</span>
                        <span className="text-xs font-extrabold text-blue-600">{app.matchScore}%</span>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <Link
                      to="/application-status"
                      className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Track Status
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
