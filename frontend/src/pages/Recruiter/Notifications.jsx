import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { notifications as initialNotifications } from '../../data/mockData';
import { HiOutlineBell, HiOutlineClock } from 'react-icons/hi';

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications.filter((n) => n.role === 'recruiter')
  );

  const markRead = (id) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-905">Recruiter Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track candidate application submissions and system status updates.</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2 shadow-sm">
            <span className="text-4xl block">🔔</span>
            <h3 className="text-sm font-bold text-gray-800">No new alerts</h3>
            <p className="text-xs text-gray-500">We'll alert you as soon as new candidate profiles match your postings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`bg-white border p-4 rounded-xl shadow-sm transition-all duration-300 relative flex items-start space-x-3 cursor-pointer ${
                  !n.read ? 'border-blue-300 bg-blue-50/20' : 'border-gray-200'
                }`}
              >
                <div className="mt-0.5">
                  <HiOutlineBell className={`h-5 w-5 ${!n.read ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-805">{n.title}</h4>
                  <p className="text-xs text-gray-655 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center">
                    <HiOutlineClock className="mr-1 h-3.5 w-3.5" /> {n.time}
                  </span>
                </div>
                {!n.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
