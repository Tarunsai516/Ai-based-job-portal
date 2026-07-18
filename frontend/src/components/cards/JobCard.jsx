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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 relative flex flex-col justify-between">
      
      {/* Header Info */}
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl border border-gray-150">
              {job.companyLogo || '🏢'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500">{job.companyName}</h4>
              <Link to={`/jobs/${job.id}`} className="text-base font-bold text-gray-905 hover:text-blue-600 transition-colors line-clamp-1">
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
        <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(job.skills || []).map((skill) => (
            <span key={skill} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex space-x-3 border-t border-gray-100 pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
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
