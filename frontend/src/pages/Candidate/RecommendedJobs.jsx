import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/cards/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { jobs as initialJobs, applications as initialApplications } from '../../data/mockData';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function RecommendedJobs() {
  const [toast, setToast] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(
    initialApplications.map((app) => app.jobId)
  );

  // Mock filtering jobs matching > 80% (React / JavaScript roles)
  const recommendedJobs = initialJobs.filter((job) =>
    job.skills.includes('React') || job.skills.includes('JavaScript')
  );

  const handleApply = (job) => {
    if (appliedJobs.includes(job.id)) return;
    setAppliedJobs([...appliedJobs, job.id]);
    setToast({
      message: `Successfully applied to ${job.title} at ${job.companyName}!`,
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

      <div className="space-y-6">
        
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <HiOutlineSparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            <h1 className="text-xl font-bold text-gray-905">AI Recommended Matches</h1>
          </div>
          <p className="text-xs text-gray-500">Jobs matched dynamically based on your uploaded CV skills and experience.</p>
        </div>

        {recommendedJobs.length === 0 ? (
          <EmptyState
            title="No matches found"
            message="Upload a different resume or manually add skills in Edit Profile to get AI recommendations."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="relative">
                {/* Visual Match Score Tag on Card */}
                <div className="absolute top-4 right-14 z-10 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                  <span>92% match</span>
                </div>
                <JobCard
                  job={job}
                  onApply={handleApply}
                  isApplied={appliedJobs.includes(job.id)}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
