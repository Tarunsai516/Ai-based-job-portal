import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold tracking-tight">TalentSync</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Matching top candidates with modern tech companies using advanced AI algorithms and smart compatibility indexing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><FaTwitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><FaLinkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><FaGithub className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Seeker Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Candidates</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/recommended-jobs" className="hover:text-white transition-colors">AI Recommendations</Link></li>
              <li><Link to="/resume/upload" className="hover:text-white transition-colors">Resume Scoring</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Candidate Dashboard</Link></li>
            </ul>
          </div>

          {/* Recruiter Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Employers</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/recruiter/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/recruiter/applicants" className="hover:text-white transition-colors">Applicant Matching</Link></li>
              <li><Link to="/recruiter/analytics" className="hover:text-white transition-colors">Analytics & Insights</Link></li>
              <li><Link to="/recruiter" className="hover:text-white transition-colors">Recruiter Board</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portal</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TalentSync Inc. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Built with React 19, Tailwind CSS & Spring Boot.</p>
        </div>
      </div>
    </footer>
  );
}
