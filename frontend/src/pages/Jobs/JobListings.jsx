import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/cards/JobCard';
import SearchBar from '../../components/common/SearchBar';
import FilterSidebar from '../../components/common/FilterSidebar';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { jobs as initialJobs, applications as initialApplications } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(initialJobs);
  const [appliedJobs, setAppliedJobs] = useState(
    initialApplications.map((app) => app.jobId)
  );
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

  const handleApply = (job) => {
    if (appliedJobs.includes(job.id)) return;
    setAppliedJobs([...appliedJobs, job.id]);
    setToast({
      message: `Successfully applied to ${job.title} at ${job.companyName}!`,
      type: 'success'
    });
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

    // AI Only match (Seeker skills matching: e.g. React or JavaScript)
    let matchesAI = true;
    if (filters.aiOnly && user) {
      // Mock seeker skills: ['React', 'JavaScript', 'Tailwind CSS']
      const seekerSkills = ['React', 'JavaScript', 'Tailwind CSS'];
      const commonSkills = job.skills.filter((s) => seekerSkills.includes(s));
      // Require at least 3 matching skills for AI match
      matchesAI = commonSkills.length >= 2;
    }

    return matchesSearch && matchesLocation && matchesType && matchesExp && matchesAI;
  });

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
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    isApplied={appliedJobs.includes(job.id)}
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
