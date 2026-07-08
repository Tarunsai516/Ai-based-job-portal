import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { candidates } from '../../data/mockData';
import { HiOutlineChevronLeft, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiCheckCircle, HiOutlineDownload } from 'react-icons/hi';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState('Pending'); // 'Pending' | 'Shortlisted' | 'Interview Scheduled'

  const candidate = candidates.find((c) => c.id === id) || candidates[0];

  const handleShortlist = () => {
    setStatus('Shortlisted');
    setToast({
      message: `${candidate.name} has been successfully Shortlisted!`,
      type: 'success'
    });
  };

  const handleInterview = () => {
    setStatus('Interview Scheduled');
    setToast({
      message: `Interview session scheduled with ${candidate.name}! Invitation email sent.`,
      type: 'success'
    });
  };

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        
        {/* Back link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <HiOutlineChevronLeft className="mr-1 h-4 w-4" /> Back to Applicants
          </button>
        </div>

        {/* Candidate Summary Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl p-3 bg-gray-50 border border-gray-150 rounded-xl select-none">
              {candidate.avatar}
            </span>
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-905 leading-none">{candidate.name}</h1>
              <p className="text-xs font-semibold text-gray-500">{candidate.title}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center"><HiOutlineLocationMarker className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.location}</span>
                <span className="flex items-center"><HiOutlineMail className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.email}</span>
                <span className="flex items-center"><HiOutlinePhone className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={handleShortlist}
              disabled={status !== 'Pending'}
              className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-colors border ${
                status !== 'Pending'
                  ? 'bg-gray-105 border-gray-200 text-gray-450 cursor-not-allowed'
                  : 'bg-white border-blue-200 hover:bg-blue-50 text-blue-600'
              }`}
            >
              {status === 'Pending' ? 'Shortlist' : 'Shortlisted'}
            </button>
            <button
              onClick={handleInterview}
              disabled={status === 'Interview Scheduled'}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-colors ${
                status === 'Interview Scheduled'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {status === 'Interview Scheduled' ? 'Interview Scheduled' : 'Schedule Interview'}
            </button>
          </div>
        </div>

        {/* Evaluation and Match details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* AI Match circular indicator + parameters */}
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-xl shadow-sm space-y-6 flex flex-col items-center">
            <h3 className="font-bold text-gray-905 text-sm text-center w-full pb-4 border-b border-gray-100">AI Compatibility Index</h3>
            
            {/* Circular score */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-gray-100 fill-none" strokeWidth="8" />
                <circle cx="64" cy="64" r="54" className="stroke-emerald-500 fill-none" strokeWidth="8" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * candidate.matchScore) / 100} />
              </svg>
              <span className="text-2xl font-black text-emerald-600">{candidate.matchScore}%</span>
            </div>

            {/* Parameter Progress Bars */}
            <div className="w-full space-y-4 pt-4 border-t border-gray-100 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Skills Compatibility</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Experience Alignment</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Education Relevance</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main profile evaluation details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Candidate summary bio & CV download */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-905 text-sm">Professional Summary</h3>
                <button className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline">
                  <HiOutlineDownload className="mr-1 h-4 w-4" /> Download Resume
                </button>
              </div>
              <p className="text-xs text-gray-650 leading-relaxed">{candidate.summary}</p>
            </div>

            {/* Comparative lists for matching vs missing skills */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center">
                  <HiCheckCircle className="h-4 w-4 mr-1" /> Matching Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3 flex items-center">
                  <span className="h-4 w-4 rounded-full bg-red-100 text-red-650 flex items-center justify-center font-bold text-[10px] mr-1">&times;</span>
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.missingSkills.map((skill) => (
                    <span key={skill} className="bg-red-50 text-red-750 border border-red-100 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
