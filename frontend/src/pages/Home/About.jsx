import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiOutlineSparkles, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">About TalentSync</h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Reimagining professional recruitment through advanced matching metrics, semantic analysis, and transparent credentials vetting.
          </p>
        </div>

        {/* Content Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-xs text-gray-650 leading-relaxed">
            Traditional recruiting is broken. Job seekers spend countless hours tailoring resumes for keyword checkers, while recruiters read through hundreds of unqualified submissions. 
            TalentSync was built to solve this. By indexing candidates against structural job demands, we present recruiters with verified match scores. Candidates get clear, actionable visibility into missing skills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg inline-block">
                <HiOutlineSparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Advanced Matchers</h3>
              <p className="text-[11px] text-gray-505">Semantic skill vectors calculate score matches above 90% compatibility.</p>
            </div>
            
            <div className="space-y-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
                <HiOutlineBriefcase className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Streamlined Listings</h3>
              <p className="text-[11px] text-gray-505">Clear role categorizations (Remote, Onsite, Hybrid) and salary markers.</p>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg inline-block">
                <HiOutlineUserGroup className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Role Autonomy</h3>
              <p className="text-[11px] text-gray-505">Dedicated workflows built uniquely for candidates and recruiting partners.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
