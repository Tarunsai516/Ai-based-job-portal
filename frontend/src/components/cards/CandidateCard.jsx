import React from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiSparkles } from 'react-icons/hi';

export default function CandidateCard({ candidate }) {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold border border-blue-200">
              {candidate.avatar || '👤'}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{candidate.name}</h3>
              <p className="text-xs font-semibold text-gray-500">{candidate.title}</p>
            </div>
          </div>
          
          {/* AI Match Score Badge */}
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-bold ${getScoreColor(candidate.matchScore)}`}>
            <HiSparkles className="h-3.5 w-3.5" />
            <span>{candidate.matchScore}% Match</span>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="mt-4 flex space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <HiLocationMarker className="h-4 w-4 text-gray-400" />
            <span>{candidate.location}</span>
          </div>
          <div>
            Exp: <span className="font-semibold text-gray-700">{candidate.experience}</span>
          </div>
        </div>

        {/* Candidate Summary */}
        <p className="mt-3 text-xs text-gray-600 leading-relaxed line-clamp-2">
          {candidate.summary}
        </p>

        {/* Top Matching Skills */}
        <div className="mt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Top Skills</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {(candidate.skills || []).map((skill) => (
              <span key={skill} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-md font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        {candidate.missingSkills && candidate.missingSkills.length > 0 && (
          <div className="mt-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Missing Skills</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {candidate.missingSkills.map((skill) => (
                <span key={skill} className="bg-red-50 text-red-700 border border-red-100 text-[10px] px-2 py-0.5 rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          to={`/recruiter/candidates/${candidate.id}`}
          className="block w-full text-center py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          Evaluate Candidate & Match Score
        </Link>
      </div>
    </div>
  );
}
