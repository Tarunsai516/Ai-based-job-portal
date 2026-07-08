import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidates } from '../../data/mockData';
import { HiDocumentText, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';

export default function MyResume() {
  const profile = candidates[0];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-905">My Resume</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your active CV and view AI parsed sections.</p>
          </div>
          <Link
            to="/resume/upload"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Upload New
          </Link>
        </div>

        {/* Active CV Box */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="p-3 bg-red-50 text-red-650 rounded-xl border border-red-100 select-none text-2xl font-bold">PDF</span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{profile.resumeUrl}</h3>
                <p className="text-[10px] text-gray-450 mt-0.5">Last updated: 3 days ago &bull; 1.2 MB</p>
              </div>
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-205 text-gray-650 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors">
                <HiOutlineEye className="mr-1 h-4 w-4" /> Preview
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-205 text-gray-650 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors">
                <HiOutlineDownload className="mr-1 h-4 w-4" /> Download
              </button>
            </div>
          </div>

          {/* Parsed Details Summary */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Parsed Candidate Bio</h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-55 p-4 rounded-lg border border-gray-100">
              {profile.summary}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-gray-700">
              <div>
                <span className="font-bold text-gray-800 block mb-1">Education Credentials</span>
                <p>{profile.education}</p>
              </div>
              <div>
                <span className="font-bold text-gray-800 block mb-1">Work History</span>
                <p>{profile.experience} as Software/Frontend Engineer</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
