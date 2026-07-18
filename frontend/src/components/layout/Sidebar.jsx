import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiChartBar, 
  HiBriefcase, 
  HiDocumentText, 
  HiUser, 
  HiCog, 
  HiSparkles,
  HiClipboardList,
  HiOfficeBuilding,
  HiUpload
} from 'react-icons/hi';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const seekerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HiChartBar },
    { to: '/jobs', label: 'Find Jobs', icon: HiBriefcase },
    { to: '/recommended-jobs', label: 'AI Recommended', icon: HiSparkles },
    { to: '/resume/upload', label: 'Resume Upload', icon: HiUpload },
    { to: '/resume/my', label: 'My Resume', icon: HiDocumentText },
    { to: '/applied-jobs', label: 'Applied Jobs', icon: HiClipboardList },
    { to: '/profile', label: 'My Profile', icon: HiUser },
    { to: '/settings', label: 'Settings', icon: HiCog },
  ];

  const recruiterLinks = [
    { to: '/recruiter', label: 'Dashboard', icon: HiChartBar },
    { to: '/recruiter/post-job', label: 'Post Job', icon: HiUpload },
    { to: '/recruiter/manage-jobs', label: 'Manage Jobs', icon: HiBriefcase },
    { to: '/recruiter/applicants', label: 'Applicants List', icon: HiClipboardList },
    { to: '/recruiter/analytics', label: 'Analytics', icon: HiChartBar },
    { to: '/recruiter/company', label: 'Company Profile', icon: HiOfficeBuilding },
    { to: '/recruiter/settings', label: 'Settings', icon: HiCog },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: HiChartBar },
    { to: '/admin/users', label: 'Manage Users', icon: HiUser },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: HiBriefcase },
    { to: '/admin/applications', label: 'Manage Applications', icon: HiClipboardList },
  ];

  const links = user.role === 'admin' ? adminLinks : (user.role === 'recruiter' ? recruiterLinks : seekerLinks);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Navigation
      </div>
      <div className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/recruiter' || link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
