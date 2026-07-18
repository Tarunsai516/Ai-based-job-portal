import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CandidateCard from '../../components/cards/CandidateCard';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { applicationService } from '../../services/applicationService';

export default function ApplicantsList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    applicationService.getAll()
      .then(data => {
        // Map applications to candidate-like objects for display
        const apps = Array.isArray(data) ? data : [];
        const mapped = apps.map(app => ({
          id: app.candidateId || app.id,
          name: app.candidateName || app.name || 'Candidate',
          title: app.jobTitle || '',
          skills: app.skills || [],
          matchScore: app.matchScore,
          status: app.status,
          email: app.candidateEmail || '',
          location: app.location || '',
          avatar: '👤',
          applicationId: app.id,
        }));
        // Deduplicate by candidateId
        const seen = new Set();
        const unique = mapped.filter(c => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
        setCandidates(unique);
        setLoading(false);
      })
      .catch(() => {
        setCandidates([]);
        setLoading(false);
      });
  }, []);

  const filtered = candidates.filter(c =>
    (c.name || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (c.title || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (c.skills || []).some(s => s.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Candidates & Applicants</h1>
            <p className="text-xs text-gray-500 mt-0.5">Review applicant profiles and AI compatibility scores.</p>
          </div>
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search by candidate name, skills, or title..."
            showFilterBtn={false}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-3">
                <div className="flex space-x-3">
                  <div className="h-14 w-14 bg-gray-100 rounded-full" />
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1,2,3].map(j => <div key={j} className="h-5 w-16 bg-gray-100 rounded-full" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold text-gray-500 px-1">
              Showing {filtered.length} applicant{filtered.length !== 1 ? 's' : ''}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title={searchVal ? 'No candidates match your search' : 'No applicants yet'}
                message={searchVal ? 'Try searching for different skills or names.' : 'Post a job to start receiving applications from candidates.'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(cand => (
                  <CandidateCard key={cand.id} candidate={cand} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
