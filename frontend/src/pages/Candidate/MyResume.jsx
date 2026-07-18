import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { HiDocumentText, HiOutlineDownload, HiOutlineEye, HiCloudUpload } from 'react-icons/hi';

export default function MyResume() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const candidateId = user?.id || 1;
    candidateService.getById(candidateId)
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => { setProfile(null); setLoading(false); });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Resume</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your active CV and view AI-parsed sections.</p>
          </div>
          <Link
            to="/resume/upload"
            className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <HiCloudUpload className="h-4 w-4" />
            <span>{profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-pulse space-y-4">
            <div className="flex space-x-3">
              <div className="h-14 w-14 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ) : !profile?.resumeUrl ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center space-y-4">
            <HiDocumentText className="h-14 w-14 text-gray-200 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-gray-700">No Resume Uploaded</h3>
              <p className="text-xs text-gray-400 mt-1">Upload a PDF or DOCX resume to let TalentSync AI parse your skills and suggest roles.</p>
            </div>
            <Link
              to="/resume/upload"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Upload Your Resume
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
            {/* File Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-black select-none">PDF</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 break-all">{profile.resumeUrl}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">AI parsed · Auto-matched to job listings</p>
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  <HiOutlineEye className="mr-1 h-4 w-4" /> Preview
                </a>
                <a
                  href={profile.resumeUrl}
                  download
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  <HiOutlineDownload className="mr-1 h-4 w-4" /> Download
                </a>
              </div>
            </div>

            {/* Parsed Summary */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Parsed Profile Summary</h4>

              {profile.summary && (
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {profile.summary}
                </p>
              )}

              <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-gray-700">
                <div>
                  <span className="font-bold text-gray-800 block mb-1">Education</span>
                  <p>{profile.education || <span className="text-gray-400 italic">Not specified</span>}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-800 block mb-1">Experience</span>
                  <p>{profile.experience || <span className="text-gray-400 italic">Not specified</span>}</p>
                </div>
              </div>

              {profile.skills?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Extracted Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(skill => (
                      <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
