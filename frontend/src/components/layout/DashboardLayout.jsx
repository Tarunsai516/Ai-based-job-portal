import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="app-shell flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
