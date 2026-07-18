import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { adminService } from '../../services/adminService';
import { HiOutlineTrash, HiOutlineClipboardList } from 'react-icons/hi';

export default function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    setLoading(true);
    adminService.getApplications()
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setApplications([]);
        setLoading(false);
      });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApp) return;
    try {
      await adminService.deleteApplication(selectedApp.id);
      setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
      setToast({ message: 'Successfully deleted application.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete application. Please try again.', type: 'error' });
    } finally {
      setSelectedApp(null);
      setIsDeleteOpen(false);
    }
  };

  const filtered = applications.filter(a =>
    (a.jobTitle || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (a.companyName || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (a.candidateName || a.name || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (a.status || '').toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedApp(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Application?"
        message="Are you sure you want to permanently delete this application? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Applications</h1>
            <p className="text-xs text-gray-500 mt-0.5">Moderate active job application submissions platform-wide.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search applications by candidate, job, company, or status..."
            showFilterBtn={false}
          />
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-4 flex justify-between items-center animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-250 rounded w-1/4" />
                  <div className="h-2.5 bg-gray-150 rounded w-1/3" />
                </div>
                <div className="h-8 w-16 bg-gray-150 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Applications Found"
            message={searchVal ? "Try adjusting your search criteria." : "No applications exist on the platform."}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-100">
              {filtered.map(app => (
                <div key={app.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 bg-gray-50 rounded-lg border border-gray-100"><HiOutlineClipboardList /></span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-850">
                        {app.candidateName || app.name || 'Candidate'} &rarr; {app.jobTitle}
                      </h4>
                      <p className="text-xs text-gray-400">Company: {app.companyName} &bull; Applied: {app.appliedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      app.status === 'Interviewing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {app.status || 'Applied'}
                    </span>

                    <button
                      onClick={() => { setSelectedApp(app); setIsDeleteOpen(true); }}
                      className="p-2 border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Application"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
