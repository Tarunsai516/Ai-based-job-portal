import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBookmark, HiBookmark, HiLocationMarker, HiCurrencyDollar, HiBriefcase } from 'react-icons/hi';

export default function JobCard({ job, onApply, isApplied = false }) {
  const [saved, setSaved] = useState(false);

  const badgeColors = {
    Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
    Onsite: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div className="surface p-5 hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-200 relative flex flex-col justify-between">
      
      {/* Header Info */}
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl border border-slate-200">
              {job.companyLogo || '🏢'}
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{job.companyName}</h4>
              <Link to={`/jobs/${job.id}`} className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1">
                {job.title}
              </Link>
            </div>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
          >
            {saved ? (
              <HiBookmark className="h-5 w-5 text-blue-600" />
            ) : (
              <HiOutlineBookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Badges & Meta Info */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
          {job.matchScore != null && (
            <span className="px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 font-bold">
              {Math.round(job.matchScore)}% match
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full border font-medium ${badgeColors[job.type] || 'bg-gray-50 text-gray-600'}`}>
            {job.type}
          </span>
          <div className="flex items-center space-x-1 py-0.5">
            <HiLocationMarker className="h-4 w-4 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1 py-0.5">
            <HiCurrencyDollar className="h-4 w-4 text-gray-400" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center space-x-1 py-0.5">
            <HiBriefcase className="h-4 w-4 text-gray-400" />
            <span>{job.experience}</span>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(job.skills || []).map((skill) => (
            <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-5 flex space-x-3 border-t border-slate-100 pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={() => onApply(job)}
          disabled={isApplied}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
            isApplied
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
          }`}
        >
          {isApplied ? 'Applied' : 'Apply Now'}
        </button>
      </div>

    </div>
  );
}
