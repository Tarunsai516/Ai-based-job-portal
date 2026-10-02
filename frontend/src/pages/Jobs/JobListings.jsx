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
import { HiOutlineCheckCircle, HiOutlineBriefcase, HiOutlineSparkles } from 'react-icons/hi';

const STATUS_COLORS = {
  Applied:      'bg-blue-50 text-blue-700 border-blue-100',
  Shortlisted:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  Interviewing: 'bg-purple-50 text-purple-700 border-purple-100',
  Rejected:     'bg-red-50 text-red-600 border-red-100',
  Offered:      'bg-amber-50 text-amber-700 border-amber-100',
};

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [matchScores, setMatchScores] = useState(new Map());
  const [appliedJobs, setAppliedJobs] = useState([]);      // array of job ID strings
  const [applications, setApplications] = useState([]);    // full application objects
  const [searchVal, setSearchVal] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'applied'

  // Filters State
  const [filters, setFilters] = useState({
    types: [],
    experience: [],
    location: '',
    aiOnly: false
  });

  useEffect(() => {
    // 1. Always fetch jobs immediately regardless of auth / profile status
    jobService.getAll()
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to fetch jobs:', err));

    if (!user) return;

    // 2. Load candidate profile, applications, and AI recommendations gracefully
    candidateService.getMyProfile()
      .then((profile) => {
        if (!profile?.id) return;
        return Promise.all([
          applicationService.getByCandidateId(profile.id).catch(() => []),
          recommendationService.getForCandidate(profile.id, 0, 50).catch(() => ({ content: [] }))
        ]).then(([apps, recommendationPage]) => {
          setApplications(Array.isArray(apps) ? apps : []);
          setAppliedJobs((Array.isArray(apps) ? apps : []).map(a => String(a.jobId)));
          setMatchScores(new Map(
            (recommendationPage?.content || []).map(match => [String(match.jobId), match])
          ));
        });
      })
      .catch((err) => console.warn('Could not load profile or recommendations for seeker:', err));
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

  // ── Filter by search + sidebar filters ──────────────────────────────────────
  const filteredJobs = jobs.filter((job) => {
    const title = (job.title || '').toLowerCase();
    const company = (job.companyName || '').toLowerCase();
    const skills = Array.isArray(job.skills) ? job.skills : [];
    const searchLower = searchVal.toLowerCase();

    const matchesSearch =
      title.includes(searchLower) ||
      company.includes(searchLower) ||
      skills.some((s) => (s || '').toLowerCase().includes(searchLower));

    const matchesLocation =
      !filters.location ||
      (job.location || '').toLowerCase().includes(filters.location.toLowerCase());

    const matchesType =
      filters.types.length === 0 || filters.types.includes(job.type);

    let matchesExp = true;
    if (filters.experience.length > 0) {
      const expLower = (job.experience || '').toLowerCase();
      matchesExp = filters.experience.some((level) => {
        if (level === 'Senior') return expLower.includes('5+') || expLower.includes('6+');
        if (level === 'Mid')    return expLower.includes('3+') || expLower.includes('4+');
        if (level === 'Entry')  return expLower.includes('1+') || expLower.includes('2+');
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

  // ── Tab split ────────────────────────────────────────────────────────────────
  const openJobs    = jobsWithScores.filter(j => !appliedJobs.includes(String(j.id)));
  const appliedList = jobsWithScores.filter(j =>  appliedJobs.includes(String(j.id)));

  const displayedJobs = activeTab === 'open'    ? openJobs
                      : activeTab === 'applied' ? appliedList
                      : jobsWithScores;

  // Map job ID → application for status display
  const appByJobId = new Map(applications.map(a => [String(a.jobId), a]));

  const tabs = [
    { id: 'all',     label: 'All Jobs',    icon: HiOutlineSparkles,    count: jobsWithScores.length },
    { id: 'open',    label: 'Not Applied', icon: HiOutlineBriefcase,   count: openJobs.length },
    { id: 'applied', label: 'Applied',     icon: HiOutlineCheckCircle, count: appliedList.length },
  ];

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
        <div className="space-y-5">
          <div>
            <p className="eyebrow">Opportunity search</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Find your next good fit.</h1>
            <p className="text-sm text-slate-500 mt-2">Search live roles and use your TalentSync match signal to decide where to spend your time.</p>
          </div>
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onToggleFilters={() => setShowMobileFilters(!showMobileFilters)}
          />
        </div>

        {/* Tab Switcher (only for logged-in seekers) */}
        {user?.role?.toLowerCase() === 'seeker' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto sm:inline-flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    active
                      ? tab.id === 'applied' ? 'bg-emerald-100 text-emerald-700'
                      : tab.id === 'open'    ? 'bg-blue-100 text-blue-700'
                      :                        'bg-slate-100 text-slate-600'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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
              <span className="text-slate-500">
                {displayedJobs.length} {activeTab === 'applied' ? 'submitted applications' : activeTab === 'open' ? 'new opportunities' : 'opportunities'}
              </span>
              {activeTab === 'applied' && appliedList.length > 0 && (
                <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <HiOutlineCheckCircle className="h-3.5 w-3.5" /> Tracking {appliedList.length} active applications
                </span>
              )}
            </div>

            {/* Applied tab: show applications with status */}
            {activeTab === 'applied' && (
              <>
                {appliedList.length === 0 ? (
                  <EmptyState
                    title="No applications yet"
                    message="You haven't applied to any jobs. Browse opportunities and hit Apply to get started."
                    actionText="Browse All Jobs"
                    onAction={() => setActiveTab('all')}
                  />
                ) : (
                  <div className="space-y-3">
                    {appliedList.map((job) => {
                      const app = appByJobId.get(String(job.id));
                      const status = app?.status || 'Applied';
                      const statusColor = STATUS_COLORS[status] || STATUS_COLORS['Applied'];
                      return (
                        <div
                          key={job.id}
                          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-300 p-5 rounded-xl shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <span className="text-2xl p-2 bg-gray-50 border border-gray-100 rounded-xl select-none flex-shrink-0">
                                {job.companyLogo || '🏢'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{job.companyName}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">{job.title}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                  <span>{job.location}</span>
                                  {job.type && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">{job.type}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 space-y-1">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusColor}`}>
                                {status}
                              </span>
                              {job.matchScore && (
                                <p className="text-[10px] text-emerald-600 font-bold">{job.matchScore}% match</p>
                              )}
                            </div>
                          </div>
                          {app?.appliedAt && (
                            <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                              Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* All / Not Applied tabs: regular job cards */}
            {activeTab !== 'applied' && (
              <>
                {displayedJobs.length === 0 ? (
                  activeTab === 'open' ? (
                    <EmptyState
                      title="You've applied to everything!"
                      message="There are no open roles left that you haven't applied to. Check back as new jobs are posted."
                      actionText="View Applied Jobs"
                      onAction={() => setActiveTab('applied')}
                    />
                  ) : (
                    <EmptyState
                      title="No active listings match your filters"
                      message="Try adjusting your sliders, removing the AI toggle, or searching for other tech keywords."
                      actionText="Reset Filters"
                      onAction={() =>
                        setFilters({ types: [], experience: [], location: '', aiOnly: false })
                      }
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                        isApplied={appliedJobs.includes(job.id?.toString())}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
