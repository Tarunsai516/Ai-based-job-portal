import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiPencil } from 'react-icons/hi';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const candidateId = user?.id || 1;
    candidateService.getById(candidateId)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: derive basic profile from auth user
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          title: '',
          location: '',
          phone: '',
          summary: '',
          skills: [],
          experience: '',
          education: '',
          avatar: '👤',
          matchScore: 0
        });
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex space-x-4">
              <div className="h-20 w-20 rounded-full bg-gray-200" />
              <div className="space-y-2 flex-1 pt-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-4">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Profile Card Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative">
          <Link
            to="/profile/edit"
            className="absolute top-6 right-6 inline-flex items-center space-x-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <HiPencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-4xl select-none">
              {profile?.avatar || '👤'}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-900 leading-none">{profile?.name || user?.name || 'Your Name'}</h1>
              <p className="text-xs font-semibold text-gray-500">{profile?.title || 'No title set — edit your profile'}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-2">
                {profile?.location && <span className="flex items-center"><HiOutlineLocationMarker className="mr-1 h-4 w-4" /> {profile.location}</span>}
                <span className="flex items-center"><HiOutlineMail className="mr-1 h-4 w-4" /> {profile?.email || user?.email}</span>
                {profile?.phone && <span className="flex items-center"><HiOutlinePhone className="mr-1 h-4 w-4" /> {profile.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">

          {/* Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">About Me</h2>
            {profile?.summary
              ? <p className="text-xs text-gray-600 leading-relaxed">{profile.summary}</p>
              : <p className="text-xs text-gray-400 italic">No summary added yet. <Link to="/profile/edit" className="text-blue-600 hover:underline">Add one now →</Link></p>
            }
          </div>

          {/* Skills */}
          <div className="space-y-2 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Technical Skills</h2>
            {profile?.skills?.length > 0
              ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-lg font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              )
              : <p className="text-xs text-gray-400 italic">No skills added. <Link to="/profile/edit" className="text-blue-600 hover:underline">Add skills →</Link></p>
            }
          </div>

          {/* Experience & Education */}
          <div className="space-y-2 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Experience & Education</h2>
            <div className="space-y-3">
              <div className="text-xs text-gray-700">
                <span className="font-bold text-gray-800">Total Years of Experience:</span>{' '}
                {profile?.experience || <span className="text-gray-400 italic">Not specified</span>}
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-bold text-gray-800">Highest Education Degree:</span>{' '}
                {profile?.education || <span className="text-gray-400 italic">Not specified</span>}
              </div>
            </div>
          </div>

          {/* Resume status */}
          {profile?.resumeUrl && (
            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Resume</h2>
              <p className="text-xs text-emerald-600 font-semibold">✓ Resume uploaded: {profile.resumeUrl}</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
