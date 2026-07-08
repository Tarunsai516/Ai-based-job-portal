import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobs } from '../../data/mockData';
import { HiLocationMarker, HiCurrencyDollar, HiBriefcase, HiMail, HiChevronLeft, HiShare } from 'react-icons/hi';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [applied, setApplied] = useState(false);

  // Find job details
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">The job post you requested does not exist or has expired.</p>
          <Link to="/jobs" className="mt-4 inline-block text-sm text-blue-600 font-semibold hover:underline">
            Back to Job Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = () => {
    if (applied) return;
    setApplied(true);
    setToast({
      message: `Application submitted successfully for ${job.title}!`,
      type: 'success'
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({
      message: 'Job link copied to clipboard!',
      type: 'info'
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
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <HiChevronLeft className="mr-1 h-4 w-4" /> Back to Listings
          </button>
        </div>

        {/* Job Header Info */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl p-3 bg-gray-50 rounded-xl border border-gray-150 select-none">
              {job.companyLogo || '🏢'}
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{job.companyName}</h4>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-none">{job.title}</h1>
              
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{job.type}</span>
                <span className="flex items-center"><HiLocationMarker className="mr-1 h-4 w-4" /> {job.location}</span>
                <span className="flex items-center"><HiCurrencyDollar className="mr-1 h-4 w-4" /> {job.salary}</span>
                <span className="flex items-center"><HiBriefcase className="mr-1 h-4 w-4" /> {job.experience}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 md:flex-none inline-flex items-center justify-center p-2.5 border border-gray-205 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg shadow-sm transition-all focus:outline-none"
              title="Share Job"
            >
              <HiShare className="h-5 w-5" />
            </button>
            <button
              onClick={handleApply}
              disabled={applied}
              className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
                applied
                  ? 'bg-gray-100 text-gray-400 border border-gray-250 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {applied ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        </div>

        {/* Job Body content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 md:p-8 border border-gray-200 rounded-xl shadow-sm">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-905">Job Description</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Key Responsibilities</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Requirements & Qualifications</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.qualifications.map((qual, index) => (
                    <li key={index}>{qual}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Benefits & Perks</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar Info (Skills, Recruiter Details) */}
          <div className="space-y-6">
            
            {/* Required Skills card */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-905 text-sm">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-lg font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter contact card */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-905 text-sm">Recruiter Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {job.recruiterName ? job.recruiterName.charAt(0) : 'R'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{job.recruiterName || 'HR Manager'}</p>
                    <p className="text-[10px] text-gray-500">Talent Acquisition Partner</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t border-gray-50">
                  <HiMail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${job.recruiterEmail}`} className="hover:underline text-blue-600 font-semibold">{job.recruiterEmail || 'hr@company.com'}</a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
