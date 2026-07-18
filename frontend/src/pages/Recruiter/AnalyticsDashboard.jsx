import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { applicationService } from '../../services/applicationService';
import { HiOutlineArrowUp, HiOutlineTrendingUp } from 'react-icons/hi';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getRecruiter().catch(() => null),
      applicationService.getAll().catch(() => []),
    ]).then(([analyticsData, appsData]) => {
      setAnalytics(analyticsData);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setLoading(false);
    });
  }, []);

  // Derive real metrics from application data
  const totalApps = applications.length;
  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewing = applications.filter(a => a.status === 'Interviewing').length;
  const conversionRate = totalApps > 0 ? ((interviewing / totalApps) * 100).toFixed(1) : 0;
  const avgMatch = totalApps > 0
    ? (applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / totalApps).toFixed(1)
    : 0;

  // Group applications by job title for department breakdown
  const byJob = applications.reduce((acc, app) => {
    const key = app.jobTitle || 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const jobStats = Object.entries(byJob).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = jobStats.length > 0 ? Math.max(...jobStats.map(([, c]) => c)) : 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruiting Insights & Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Live metrics from your active job listings and applicant pipeline.</p>
        </div>

        {/* Top Metric Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-pulse space-y-3">
                <div className="h-2 bg-gray-100 rounded w-2/3" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-2 bg-gray-100 rounded w-full" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Applicant Conversion Rate</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-gray-800">{conversionRate}%</span>
                  {conversionRate > 0 && (
                    <span className="text-xs font-semibold text-emerald-500 flex items-center">
                      <HiOutlineArrowUp className="h-3.5 w-3.5 mr-0.5" /> Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {interviewing} of {totalApps} applicants progressed to interviews.
                </p>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Avg. AI Match Score</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-blue-600">{avgMatch}%</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  System-wide candidate skill suitability average.
                </p>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Applications</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-gray-800">{totalApps}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {shortlisted} shortlisted · {interviewing} in interview stage
                </p>
              </div>
            </>
          )}
        </div>

        {/* Applications by Job Breakdown */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1">
            <HiOutlineTrendingUp className="h-5 w-5 text-blue-600" />
            <span>Applications by Job Position</span>
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="space-y-1 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : jobStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">No application data yet. Post jobs and wait for candidates to apply.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {jobStats.map(([jobTitle, count]) => (
                <div key={jobTitle} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-600">
                    <span className="truncate max-w-[60%]">{jobTitle}</span>
                    <span>{count} Application{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
