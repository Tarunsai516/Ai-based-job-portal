import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineClock } from 'react-icons/hi';

export default function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const recruiterId = user?.id ? String(user.id) : '';
    const recruiterEmail = user?.email || '';
    jobService.getAll('', '', '', recruiterId, recruiterEmail)
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        setJobs(all);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;
    try {
      await jobService.delete(selectedJob.id);
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      setToast({ message: `Job "${selectedJob.title}" deleted successfully.`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete job. Please try again.', type: 'error' });
    } finally {
      setSelectedJob(null);
      setIsDeleteOpen(false);
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedJob(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Posting?"
        message={`Are you sure you want to permanently delete "${selectedJob?.title}"? Candidates won't be able to apply anymore.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
            <p className="text-xs text-gray-500 mt-0.5">View, edit, or remove your posted job listings.</p>
          </div>
          <Link
            to="/recruiter/post-job"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            + Post a Job
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {[1,2,3].map(i => (
              <div key={i} className="p-6 flex justify-between items-center animate-pulse">
                <div className="flex space-x-3">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg" />
                  <div className="space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-40" />
                    <div className="h-2 bg-gray-100 rounded w-28" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                  <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No Jobs Posted Yet"
            message="Start by posting your first job vacancy. TalentSync AI will match candidates instantly."
            actionText="Post a Job"
            onAction={() => window.location.replace('/recruiter/post-job')}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 bg-gray-50 border border-gray-100 rounded-lg select-none">
                      {job.companyLogo || '🏢'}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase">{job.companyName}</h3>
                      <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {job.title}
                      </Link>
                      <div className="flex items-center space-x-4 text-[10px] text-gray-400 mt-1">
                        <span>{job.location} &bull; {job.type}</span>
                        {job.salary && <span>Salary: {job.salary}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    {job.postedTime && (
                      <div className="text-right hidden sm:block mr-2">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center space-x-1">
                          <HiOutlineClock className="h-3 w-3" />
                          <span>Posted</span>
                        </span>
                        <span className="text-xs font-semibold text-gray-600 block">
                          {typeof job.postedTime === 'string' ? job.postedTime : new Date(job.postedTime).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <Link
                      to={`/recruiter/edit-job/${job.id}`}
                      className="p-2 border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
                      title="Edit Job"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => { setSelectedJob(job); setIsDeleteOpen(true); }}
                      className="p-2 border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
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
