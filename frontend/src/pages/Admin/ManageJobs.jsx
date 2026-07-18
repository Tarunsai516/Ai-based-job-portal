import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { adminService } from '../../services/adminService';
import { HiOutlineTrash, HiOutlineBriefcase } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    adminService.getJobs()
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setJobs([]);
        setLoading(false);
      });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;
    try {
      await adminService.deleteJob(selectedJob.id);
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      setToast({ message: `Successfully deleted job "${selectedJob.title}"`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete job. Please try again.', type: 'error' });
    } finally {
      setSelectedJob(null);
      setIsDeleteOpen(false);
    }
  };

  const filtered = jobs.filter(j =>
    (j.title || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (j.companyName || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedJob(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Platform Job?"
        message={`Are you sure you want to permanently delete "${selectedJob?.title}" by "${selectedJob?.companyName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Job Listings</h1>
            <p className="text-xs text-gray-500 mt-0.5">Moderate active job vacancies across all employers.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search jobs by title, company, or location..."
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
            title="No Jobs Found"
            message={searchVal ? "Try adjusting your search criteria." : "No job postings exist on the platform."}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-100">
              {filtered.map(job => (
                <div key={job.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 bg-gray-50 rounded-lg border border-gray-100"><HiOutlineBriefcase /></span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-850">{job.title}</h4>
                      <p className="text-xs text-gray-400">{job.companyName} &bull; {job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600">
                      {job.type}
                    </span>

                    <button
                      onClick={() => { setSelectedJob(job); setIsDeleteOpen(true); }}
                      className="p-2 border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
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
