import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { recruiterAnalytics } from '../../data/mockData';
import { HiOutlineArrowUp, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineTrendingUp } from 'react-icons/hi';

export default function AnalyticsDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">Recruiting Insights & Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Observe job post engagement, conversion metrics, and candidate volume stats.</p>
        </div>

        {/* Analytics Top widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Applicant Conversions</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-gray-805">14.8%</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center"><HiOutlineArrowUp className="h-3.5 w-3.5 mr-0.5" /> +2.4%</span>
            </div>
            <p className="text-[10px] text-gray-450 leading-relaxed">Percentage of applications progressing to scheduled interviews.</p>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Average Candidate Match Score</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-blue-600">84.2%</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center"><HiOutlineArrowUp className="h-3.5 w-3.5 mr-0.5" /> +1.2%</span>
            </div>
            <p className="text-[10px] text-gray-450 leading-relaxed">System-wide candidate skill suitability index average.</p>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Time-to-Hire Rate</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-gray-805">18 Days</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">-3 Days</span>
            </div>
            <p className="text-[10px] text-gray-450 leading-relaxed">Average days elapsed from posting a job to candidate shortlisting.</p>
          </div>
        </div>

        {/* Department/Field breakdown list */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-905 flex items-center space-x-1">
            <HiOutlineTrendingUp className="h-5 w-5 text-blue-600" />
            <span>Applications by Department</span>
          </h3>
          
          <div className="space-y-4 pt-2">
            {recruiterAnalytics.hiringStats.map((stat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>{stat.label}</span>
                  <span>{stat.count} Hires</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stat.count / 13) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
