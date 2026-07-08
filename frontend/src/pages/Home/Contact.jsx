import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Toast from '../../components/common/Toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding } from 'react-icons/hi';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setTimeout(() => {
      setToast({
        message: 'Thank you! Your message has been received. Our team will get back to you shortly.',
        type: 'success',
      });
      setLoading(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="flex-grow max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start w-full">
        
        {/* Info Column */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Contact Us</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Have questions about candidate indexing, corporate plans, or portal settings? Drop us a line. We generally respond to inquiries within 1 business day.
          </p>

          <div className="space-y-4 pt-6">
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <HiOutlineMail className="h-5 w-5 text-blue-600" />
              <span>support@talentsync.example.com</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <HiOutlinePhone className="h-5 w-5 text-blue-600" />
              <span>+1 (800) 555-0199</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <HiOutlineOfficeBuilding className="h-5 w-5 text-blue-600" />
              <span>100 Pine Street, San Francisco, CA 94111</span>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-white border border-gray-205 p-8 rounded-xl shadow-sm">
          <form className="space-y-6" onSubmit={handleContactSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              {loading ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}
