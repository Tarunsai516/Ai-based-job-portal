import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <span className="text-6xl animate-bounce">🔍</span>
        <h1 className="text-5xl font-extrabold text-blue-600 mt-4">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mt-2">Page Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
          The link you followed may be broken, or the page may have been removed. Let's get you back on track!
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          Return Home
        </Link>
      </main>

      <Footer />
    </div>
  );
}
