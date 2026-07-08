import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CandidateCard from '../../components/cards/CandidateCard';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { candidates as initialCandidates } from '../../data/mockData';

export default function ApplicantsList() {
  const [candidates] = useState(initialCandidates);
  const [searchVal, setSearchVal] = useState('');

  const filteredCandidates = candidates.filter((cand) =>
    cand.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    cand.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    cand.skills.some((s) => s.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Search */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-905">Candidates & Applicants</h1>
            <p className="text-xs text-gray-500 mt-0.5">Filter, evaluate, and view AI matching compatibility lists for candidate profiles.</p>
          </div>
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search by candidate name, skills, or professional title..."
            showFilterBtn={false}
          />
        </div>

        {/* List Grid */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-gray-500 px-1">
            Showing {filteredCandidates.length} applicants
          </div>

          {filteredCandidates.length === 0 ? (
            <EmptyState
              title="No applicants found"
              message="Try searching for alternate skills or candidate names."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((cand) => (
                <CandidateCard key={cand.id} candidate={cand} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
