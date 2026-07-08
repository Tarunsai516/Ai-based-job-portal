import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import { jobs as initialJobs } from '../../data/mockData';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi';

export default function ManageJobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDeleteConfirm = () => {
    if (!selectedJob) return;
    setJobs(jobs.filter((j) => j.id !== selectedJob.id));
    setToast({
      message: `Successfully removed job posting: "${selectedJob.title}"`,
      type: 'success',
    });
    setSelectedJob(null);
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

      {/* Delete Modal */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Posting?"
        message={`Are you sure you want to permanently delete the job vacancy: "${selectedJob?.title}"? Applicants will no longer be able to submit credentials.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-905">Manage Jobs</h1>
            <p className="text-xs text-gray-500 mt-0.5">Observe, modify, or archive your listed career opportunities.</p>
          </div>
          <Link
            to="/recruiter/post-job"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Post a Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2 shadow-sm">
            <span className="text-4xl block">💼</span>
            <h3 className="text-sm font-bold text-gray-800">No jobs posted yet</h3>
            <p className="text-xs text-gray-500">Post a new position to start collecting applicant match scores.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-150">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 bg-gray-50 border border-gray-100 rounded-lg select-none">
                      {job.companyLogo}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase">{job.companyName}</h3>
                      <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {job.title}
                      </Link>
                      <div className="flex items-center space-x-4 text-[10px] text-gray-450 mt-1">
                        <span>{job.location} &bull; {job.type}</span>
                        <span>Salary: {job.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right hidden sm:block mr-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Posted time</span>
                      <span className="text-xs font-semibold text-gray-650 block">{job.postedTime}</span>
                    </div>

                    <Link
                      to={`/recruiter/edit-job/${job.id}`}
                      className="p-2 border border-gray-205 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
                      title="Edit Job"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 border border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
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
