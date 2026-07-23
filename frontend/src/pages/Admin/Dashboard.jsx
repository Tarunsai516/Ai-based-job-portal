import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services/adminService';
import { HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineClipboardList, HiOutlinePlusCircle, HiOutlineClock, HiOutlineDatabase, HiOutlineServer, HiOutlineCheckCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminService.getAnalytics(),
      adminService.getDatabaseInfo()
    ]).then(([analyticsRes, dbRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (dbRes.status === 'fulfilled') setDbInfo(dbRes.value);
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

        {/* Database & MySQL Workbench Connection Monitor */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                <HiOutlineDatabase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Database Engine & MySQL Workbench Integration</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Active Target: MySQL
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Connected database runtime, MySQL Workbench parameters, and driver details.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                dbInfo?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <HiOutlineCheckCircle className="h-4 w-4" />
                <span>{dbInfo?.status || 'MySQL Ready'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Database Engine</p>
              <p className="text-sm font-bold text-slate-200 mt-1 truncate">{dbInfo?.databaseType || 'MySQL Workbench / MySQL'}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Database Name / Host</p>
              <p className="text-sm font-bold text-slate-200 mt-1 truncate">{dbInfo?.databaseName || 'talentsync'} @ {dbInfo?.host || 'localhost:3306'}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">JDBC Driver</p>
              <p className="text-sm font-bold text-slate-200 mt-1 truncate">{dbInfo?.driverName || 'com.mysql.cj.jdbc.Driver'}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">MySQL Workbench GUI</p>
              <p className="text-sm font-bold text-emerald-400 mt-1 truncate">Compatible (schema: talentsync)</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
