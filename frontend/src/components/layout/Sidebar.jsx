import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiHome,
  HiBriefcase, 
  HiDocumentText, 
  HiUser, 
  HiCog, 
  HiSparkles,
  HiClipboardList,
  HiOfficeBuilding,
  HiUpload,
  HiOutlineTicket,
  HiUsers,
  HiCalendar
} from 'react-icons/hi';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const seekerLinks = [
    { to: '/dashboard', label: 'Overview', icon: HiHome },
    { to: '/jobs', label: 'Find jobs', icon: HiBriefcase },
    { to: '/applied-jobs', label: 'Applications', icon: HiClipboardList },
    { to: '/profile', label: 'Profile & AI insights', icon: HiUser },
  ];

  const recruiterLinks = [
    { to: '/recruiter', label: 'Overview', icon: HiHome },
    { to: '/recruiter/manage-jobs', label: 'Jobs', icon: HiBriefcase },
    { to: '/recruiter/applicants', label: 'Candidates', icon: HiUsers },
    { to: '/recruiter/analytics', label: 'Interviews & insights', icon: HiCalendar },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: HiHome },
    { to: '/admin/users', label: 'Manage Users', icon: HiUser },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: HiBriefcase },
    { to: '/admin/applications', label: 'Applications', icon: HiClipboardList },
    { to: '/admin/support', label: 'Support Tickets', icon: HiOutlineTicket },
  ];

  const links = user.role === 'admin' ? adminLinks : (user.role === 'recruiter' ? recruiterLinks : seekerLinks);

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] px-3 py-5 transition-colors duration-300">
      <div className="px-3 pb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
        Workspace
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
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
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
