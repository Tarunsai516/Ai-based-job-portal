import React from 'react';
import { HiLocationMarker, HiUsers, HiLink } from 'react-icons/hi';

export default function CompanyCard({ company, jobCount = 0 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl border border-gray-150">
            {company.logo || '🏢'}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{company.name}</h3>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">
              {company.industry}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            <HiLocationMarker className="h-4 w-4 text-gray-400" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HiUsers className="h-4 w-4 text-gray-400" />
            <span>{company.employees} employees</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-600 leading-relaxed line-clamp-3">
          {company.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <HiLink className="mr-1 h-4 w-4" /> Website
        </a>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {jobCount} Open Jobs
        </span>
      </div>
    </div>
  );
}
