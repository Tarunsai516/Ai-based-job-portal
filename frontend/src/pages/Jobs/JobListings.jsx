import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/cards/JobCard';
import SearchBar from '../../components/common/SearchBar';
import FilterSidebar from '../../components/common/FilterSidebar';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [matchScores, setMatchScores] = useState(new Map());
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    types: [],
    experience: [],
    location: '',
    aiOnly: false
  });

  useEffect(() => {
    if (!user) {
      jobService.getAll().then(setJobs).catch((err) => console.error(err));
      return;
    }

    candidateService.getMyProfile()
      .then(profile => Promise.all([
        jobService.getAll(),
        applicationService.getByCandidateId(profile.id),
        recommendationService.getForCandidate(profile.id, 0, 50).catch(() => ({ content: [] }))
      ]))
      .then(([jobData, apps, recommendationPage]) => {
        setJobs(jobData);
        setAppliedJobs(apps.map(a => String(a.jobId)));
        setMatchScores(new Map(
          (recommendationPage?.content || []).map(match => [String(match.jobId), match])
        ));
      })
      .catch((err) => console.error(err));
  }, [user]);

  const handleApply = async (job) => {
    const stringJobId = job.id.toString();
    if (appliedJobs.includes(stringJobId)) return;
    
    try {
      await applicationService.apply({
        jobId: stringJobId,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'Applied',
        candidateId: user?.id,
        candidateName: user.name,
        recruiterId: job.recruiterId,
        recruiterEmail: job.recruiterEmail,
        matchScore: 88
      });
      setAppliedJobs([...appliedJobs, stringJobId]);
      setToast({
        message: `Successfully applied to ${job.title} at ${job.companyName}!`,
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: 'Could not submit application. Try again.',
        type: 'error'
      });
    }
  };

  // Filtering Logic
  const filteredJobs = jobs.filter((job) => {
    // Search Query match
    const matchesSearch =
      job.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchVal.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchVal.toLowerCase()));

    // Location match
    const matchesLocation =
      !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    // Type match
    const matchesType =
      filters.types.length === 0 || filters.types.includes(job.type);

    // Experience Level match
    let matchesExp = true;
    if (filters.experience.length > 0) {
      const expLower = job.experience.toLowerCase();
      matchesExp = filters.experience.some((level) => {
        if (level === 'Senior') return expLower.includes('5+') || expLower.includes('6+');
        if (level === 'Mid') return expLower.includes('3+') || expLower.includes('4+');
        if (level === 'Entry') return expLower.includes('1+') || expLower.includes('2+');
        return true;
      });
    }

    const match = matchScores.get(String(job.id));
    const matchesAI = !filters.aiOnly || Boolean(match && match.overallScore >= 50);

    return matchesSearch && matchesLocation && matchesType && matchesExp && matchesAI;
  });

  const jobsWithScores = filteredJobs.map(job => ({
    ...job,
    matchScore: matchScores.get(String(job.id))?.overallScore,
    matchExplanation: matchScores.get(String(job.id))?.explanation,
  }));

  return (
    <DashboardLayout>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        
        {/* Search Header */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Explore Careers</h1>
            <p className="text-xs text-gray-500 mt-0.5">Find jobs matching your tech stack, location preferences, and career expectations.</p>
          </div>
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onToggleFilters={() => setShowMobileFilters(!showMobileFilters)}
          />
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Filters - Left panel for desktop */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Mobile Drawer Backdrop and Box */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden flex justify-end">
              <div className="w-80 bg-white h-full p-6 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Job List Cards - Right panel */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 px-1">
              <span>Showing {filteredJobs.length} results</span>
            </div>

            {filteredJobs.length === 0 ? (
              <EmptyState
                title="No active listings match your filters"
                message="Try adjusting your sliders, removing the AI toggle, or searching for other tech keywords."
                actionText="Reset Filters"
                onAction={() =>
                  setFilters({ types: [], experience: [], location: '', aiOnly: false })
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobsWithScores.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    isApplied={appliedJobs.includes(job.id?.toString())}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
