import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { jobs, companies } from '../../data/mockData';
import { HiSearch, HiSparkles, HiCheckCircle, HiTrendingUp, HiUserGroup, HiShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect to login or jobs list (will redirect to /login if guest, since jobs is protected, or jobs page if logged in)
    // To make it friendly, redirect to /login or /jobs with query parameter
    navigate(`/login?q=${encodeURIComponent(searchVal)}`);
  };

  // Get first 3 jobs as featured
  const featuredJobs = jobs.slice(0, 3);
  const featuredCompanies = companies.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-white py-20 border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100"
            >
              <HiSparkles className="h-4 w-4 animate-bounce" />
              <span>Next-Generation AI Matching is Live</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-none"
            >
              Find Your Next <span className="text-blue-600">Dream Job</span> <br className="hidden sm:inline" />
              Powered by Recruiting AI
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed"
            >
              Skip the manual search. Our platform parses your skills, experience, and values to match you with top tech employers instantly.
            </motion.p>

            {/* Global Search Bar */}
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="mt-8 flex flex-col sm:flex-row items-center bg-white p-2 rounded-xl border border-gray-200 shadow-md max-w-2xl mx-auto w-full gap-2"
            >
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Job title, skills, or keywords..."
                  className="block w-full pl-10 pr-3 py-3 rounded-lg border-0 placeholder-gray-400 text-sm focus:outline-none focus:ring-0 text-gray-900 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                Search Jobs
              </button>
            </motion.form>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* AI Banner */}
      <section className="bg-gray-900 py-12 text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <HiSparkles className="h-5 w-5 text-emerald-400" />
              <span>For Recruiters: Smart Compatibility Indexing</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-xl">
              Upload job descriptions and find candidates mapped directly by match scores. Our pipeline filters out non-relevant resumes automatically.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            Start Recruiting
          </Link>
        </div>
      </section>

      {/* Main Content Info */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Featured Jobs */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Featured Job Openings</h2>
            <p className="text-xs text-gray-500 mt-1">Explore some of our trending positions matching active seeker profiles.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{job.companyLogo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase">{job.companyName}</h4>
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{job.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  to="/login"
                  className="mt-6 block text-center py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View details & apply
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg inline-block">
              <HiTrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-905">AI Talent Matching</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We match resumes directly against required job variables, outputting compatibility percentages to bypass screening friction.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
              <HiUserGroup className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-905">Verified Candidates Only</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Recruiters see active candidate profiles, and candidates directly communicate with assigned recruiters listed on jobs.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg inline-block">
              <HiShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-905">Secure Resume Parsing</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload PDF or DOCX files securely. Our parsing agents extract skills and experience automatically without sharing sensitive private data.
            </p>
          </div>
        </section>

        {/* Top Companies */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Partner Companies</h2>
            <p className="text-xs text-gray-500 mt-1">Leading startups and enterprise platforms hiring directly on our portal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCompanies.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center">
                <span className="text-4xl block mb-2">{c.logo}</span>
                <h3 className="text-sm font-bold text-gray-800">{c.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.industry}</p>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-blue-600 rounded-2xl py-12 px-6 sm:px-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
            <p className="text-base sm:text-lg italic font-light leading-relaxed">
              "We slashed our candidate vetting hours by over 70% using this TalentSync. Mapped candidate matching scores give us instant insight into who fits the description before scheduling calls."
            </p>
            <div>
              <p className="font-bold text-sm">Marcus Vance</p>
              <p className="text-[10px] text-blue-200">Director of Recruiting, TechVibe Solutions</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
