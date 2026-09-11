import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/cards/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function RecommendedJobs() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidateId, setCandidateId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    candidateService.getMyProfile().then(profile => {
      const resolvedCandidateId = String(profile.id);
      setCandidateId(resolvedCandidateId);
      return Promise.all([
        recommendationService.getForCandidate(resolvedCandidateId).catch(() => ({ content: [] })),
        jobService.getAll().catch(() => []),
        applicationService.getByCandidateId(resolvedCandidateId).catch(() => [])
      ]);
    }).then(([matchPage, allJobs, myApps]) => {
      const jobsById = new Map((Array.isArray(allJobs) ? allJobs : []).map(job => [String(job.id), job]));
      const matchedJobs = (matchPage?.content || [])
        .map(match => {
          const job = jobsById.get(String(match.jobId));
          return job ? { ...job, matchScore: match.overallScore, matchExplanation: match.explanation } : null;
        })
        .filter(Boolean);
      setJobs(matchedJobs);
      setAppliedJobIds((Array.isArray(myApps) ? myApps : []).map(a => String(a.jobId)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleApply = async (job) => {
    if (appliedJobIds.includes(String(job.id))) return;
    try {
      await applicationService.apply({
        jobId: job.id,
        candidateId,
        jobTitle: job.title,
        companyName: job.companyName,
      });
      setAppliedJobIds(prev => [...prev, String(job.id)]);
      setToast({ message: `Applied to ${job.title} at ${job.companyName}!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to apply. Please try again.', type: 'error' });
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <HiOutlineSparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            <h1 className="text-xl font-bold text-gray-900">AI Recommended Jobs</h1>
          </div>
          <p className="text-xs text-gray-500">
            Jobs matched based on your profile skills and experience. The more complete your profile, the better the matches.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-4">
                <div className="flex space-x-3">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1,2,3].map(j => <div key={j} className="h-5 w-14 bg-gray-100 rounded-full" />)}
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No Jobs Available Yet"
            message="Recruiters haven't posted any positions yet. Complete your profile and check back soon."
            actionText="Update Profile"
            onAction={() => window.location.replace('/profile/edit')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  onApply={handleApply}
                  isApplied={appliedJobIds.includes(String(job.id))}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
