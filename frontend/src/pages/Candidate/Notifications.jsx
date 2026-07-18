import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineClock } from 'react-icons/hi';

export default function CandidateNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getByRole('seeker')
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setNotifications([]);
        setLoading(false);
      });
  }, [user]);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const clearAll = () => setNotifications([]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">Stay updated on application status and new job matches.</p>
          </div>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse flex space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2 shadow-sm">
            <span className="text-4xl block">🔔</span>
            <h3 className="text-sm font-bold text-gray-800">You're all caught up!</h3>
            <p className="text-xs text-gray-500">We'll alert you when recruiters respond or new jobs match your profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`bg-white border p-4 rounded-xl shadow-sm transition-all duration-300 flex items-start space-x-3 cursor-pointer ${
                  !n.read ? 'border-blue-300 bg-blue-50/20' : 'border-gray-200'
                }`}
              >
                <HiOutlineBell className={`h-5 w-5 mt-0.5 ${!n.read ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center">
                    <HiOutlineClock className="mr-1 h-3.5 w-3.5" />
                    {n.time || n.createdAt}
                  </span>
                </div>
                {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
