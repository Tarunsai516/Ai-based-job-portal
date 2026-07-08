import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidates } from '../../data/mockData';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiPencil } from 'react-icons/hi';

export default function Profile() {
  // Get mock seeker profile (Alex Johnson)
  const profile = candidates[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative">
          <Link
            to="/profile/edit"
            className="absolute top-6 right-6 inline-flex items-center space-x-1 px-3 py-1.5 border border-gray-205 rounded-lg text-xs font-semibold text-gray-650 hover:bg-gray-50 transition-colors"
          >
            <HiPencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-4xl select-none">
              {profile.avatar}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-909 leading-none">{profile.name}</h1>
              <p className="text-xs font-semibold text-gray-500">{profile.title}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-2">
                <span className="flex items-center"><HiOutlineLocationMarker className="mr-1 h-4 w-4" /> {profile.location}</span>
                <span className="flex items-center"><HiOutlineMail className="mr-1 h-4 w-4" /> {profile.email}</span>
                <span className="flex items-center"><HiOutlinePhone className="mr-1 h-4 w-4" /> {profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details (About Me, Skills, etc.) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          
          {/* Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">About Me</h2>
            <p className="text-xs text-gray-650 leading-relaxed">{profile.summary}</p>
          </div>

          {/* Skills */}
          <div className="space-y-2 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-lg font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Experience & Education</h2>
            <div className="space-y-3">
              <div className="text-xs text-gray-700">
                <span className="font-bold text-gray-800">Total Years of Experience:</span> {profile.experience}
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-bold text-gray-800">Highest Education Degree:</span> {profile.education}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
