import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services/adminService';
import { HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineClipboardList, HiOutlinePlusCircle, HiOutlineClock } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      label: 'Total Platform Users',
      value: analytics?.totalUsers ?? 0,
      icon: HiOutlineUserGroup,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      description: `${analytics?.totalSeekers ?? 0} Seekers · ${analytics?.totalRecruiters ?? 0} Recruiters`
    },
    {
      label: 'Active Job Listings',
      value: analytics?.totalJobs ?? 0,
      icon: HiOutlineBriefcase,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      description: 'Platform total active roles'
    },
    {
      label: 'Total Applications',
      value: analytics?.totalApplications ?? 0,
      icon: HiOutlineClipboardList,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      description: 'Submitted candidate profiles'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-none">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Platform management overview, user analytics, and active vacancy controls.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            : stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg border ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-805 mt-0.5">{stat.value}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold border-t border-gray-100 pt-2">
                      {stat.description}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Dynamic Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Users */}
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <HiOutlineUserGroup className="h-5 w-5 text-blue-600" />
                <span>Recent Platform Signups</span>
              </h3>
              <Link to="/admin/users" className="text-xs font-semibold text-blue-600 hover:underline">
                Manage Users
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : !analytics?.recentUsers || analytics.recentUsers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent users.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {analytics.recentUsers.map((usr) => (
                  <div key={usr.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-850">{usr.name}</p>
                      <p className="text-gray-500">{usr.email}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      usr.role === 'recruiter' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      usr.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {usr.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <HiOutlineBriefcase className="h-5 w-5 text-emerald-600" />
                <span>Recent Job Listings</span>
              </h3>
              <Link to="/admin/jobs" className="text-xs font-semibold text-emerald-600 hover:underline">
                Manage Jobs
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : !analytics?.recentJobs || analytics.recentJobs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent jobs.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {analytics.recentJobs.map((job) => (
                  <div key={job.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-850">{job.title}</p>
                      <p className="text-gray-500">{job.companyName} &bull; {job.location}</p>
                    </div>
                    <span className="text-gray-400 text-[10px] flex items-center space-x-1">
                      <HiOutlineClock className="h-3 w-3" />
                      <span>{job.postedTime}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
