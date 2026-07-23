import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';

export default function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [toast, setToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setToast({
      message: 'Account preferences updated successfully!',
      type: 'success',
    });
  };

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your notification delivery and visibility preferences.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Communication Alerts</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Email Notifications</p>
                <p className="text-[10px] text-gray-550 mt-0.5">Receive notifications about AI matches and shortlist events.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">SMS Notifications</p>
                <p className="text-[10px] text-gray-550 mt-0.5">Receive text reminders for interview schedules.</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={() => setSmsAlerts(!smsAlerts)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Visibility</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Public profile details</p>
                <p className="text-[10px] text-gray-550 mt-0.5">Allow recruiters to discover your profile in candidate searches.</p>
              </div>
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={() => setProfilePublic(!profilePublic)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Database & MySQL Workbench Configuration */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Database Engine & MySQL Workbench</h3>
                <p className="text-[11px] text-gray-600 mt-1">Backend configured for MySQL 8.0+ / MySQL Workbench connection.</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                MySQL Target
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 font-mono text-[11px]">
                <span className="font-semibold text-slate-500">JDBC URL:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded">jdbc:mysql://localhost:3306/talentsync</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-mono text-[11px]">
                <span className="font-semibold text-slate-500">Database Name:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded">talentsync</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-mono text-[11px]">
                <span className="font-semibold text-slate-500">Workbench SQL Setup Script:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">backend/src/main/resources/setup_mysql.sql</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              Save Preferences
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
