import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';

export default function RecruiterSettings() {
  const [candidateAlerts, setCandidateAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [toast, setToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setToast({
      message: 'Recruiter settings saved successfully!',
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
          <h1 className="text-xl font-bold text-gray-905">Recruiter Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage talent alerts and candidate matching digest summaries.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Recruiter Alerts</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Immediate Candidate Submissions</p>
                <p className="text-[10px] text-gray-550 mt-0.5">Receive immediate notification updates when high-match candidates apply.</p>
              </div>
              <input
                type="checkbox"
                checked={candidateAlerts}
                onChange={() => setCandidateAlerts(!candidateAlerts)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Weekly Talent Digest</p>
                <p className="text-[10px] text-gray-550 mt-0.5">Receive a weekly email compiling active candidate matches.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={() => setWeeklyDigest(!weeklyDigest)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              Save Settings
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
