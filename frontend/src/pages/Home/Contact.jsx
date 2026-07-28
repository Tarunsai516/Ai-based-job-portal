import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineChatAlt2,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineLockClosed,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const SUBJECT_OPTIONS = [
  'Account Issue',
  'Job Listing Problem',
  'Application Issue',
  'Technical Bug',
  'Billing & Payments',
  'Feature Request',
  'Other',
];

const statusStyles = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusLabels = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export default function Contact() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Tickets state (for logged-in users)
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  // Guest-only fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadMyTickets();
    }
  }, [user]);

  const loadMyTickets = async () => {
    if (!user) return;
    setTicketsLoading(true);
    try {
      const data = await supportService.getUserTickets(user.id);
      setTickets(data);
    } catch {
      // silent fail — tickets section just stays empty
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      if (!subject || !message) return;
      setLoading(true);
      try {
        await supportService.createTicket({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          subject,
          message,
        });
        setToast({
          message: 'Support ticket submitted! Our admin team will review it shortly.',
          type: 'success',
        });
        setSubject('');
        setMessage('');
        loadMyTickets();
      } catch {
        setToast({
          message: 'Failed to submit ticket. Please try again.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Guest form: just show confirmation (no backend save)
      if (!guestName || !guestEmail || !message) return;
      setLoading(true);
      setTimeout(() => {
        setToast({
          message: 'Thank you! Your message has been received. Our team will get back to you shortly.',
          type: 'success',
        });
        setLoading(false);
        setGuestName('');
        setGuestEmail('');
        setMessage('');
      }, 1000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      <main className="flex-grow max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Info Column */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Contact Support
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Have an issue or need help? Submit a support ticket and our admin team
              will review and respond to your request. You can track all your
              submitted tickets below.
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

            {/* Login prompt for guests */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mt-6">
                <HiOutlineLockClosed className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800">
                    Want to track your support requests?
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <Link to="/login" className="font-bold underline hover:text-blue-800">
                      Log in
                    </Link>{' '}
                    to submit tracked tickets and view admin responses.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Column */}
          <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineTicket className="h-5 w-5 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900">
                {user ? 'Submit a Support Ticket' : 'Send us a Message'}
              </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {user ? (
                <>
                  {/* Logged in — show auto-filled info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{user.name}</p>
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                    </div>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      user.role === 'recruiter'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Issue Category
                    </label>
                    <select
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select a category...</option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Guest Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  {user ? 'Describe your issue' : 'Message'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    user
                      ? 'Please describe your issue in detail so our team can help you quickly...'
                      : 'How can we help you?'
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Submitting...'
                  : user
                  ? 'Submit Support Ticket'
                  : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* My Support Tickets — shown only for logged-in users */}
        {user && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineChatAlt2 className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-extrabold text-gray-900">My Support Tickets</h2>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>

            {ticketsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm animate-pulse"
                  >
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <HiOutlineTicket className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-500">No tickets yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Use the form above to submit your first support ticket.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Header */}
                      <div
                        className="p-5 flex items-start justify-between cursor-pointer"
                        onClick={() =>
                          setExpandedTicketId(isExpanded ? null : ticket.id)
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {ticket.subject}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                statusStyles[ticket.status]
                              }`}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            <HiOutlineClock className="h-3.5 w-3.5" />
                            <span>{formatDate(ticket.createdAt)}</span>
                            {ticket.adminReply && (
                              <span className="ml-2 flex items-center gap-1 text-purple-500 font-semibold">
                                <HiOutlineChatAlt2 className="h-3.5 w-3.5" />
                                Admin replied
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-gray-400">
                          {isExpanded ? (
                            <HiOutlineChevronUp className="h-5 w-5" />
                          ) : (
                            <HiOutlineChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4">
                          {/* User's message */}
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                              Your Message
                            </p>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {ticket.message}
                            </div>
                          </div>

                          {/* Admin Reply */}
                          {ticket.adminReply ? (
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-2">
                                Admin Response
                              </p>
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-xs text-purple-800 leading-relaxed whitespace-pre-wrap">
                                {ticket.adminReply}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-700 flex items-center gap-2">
                              <HiOutlineClock className="h-4 w-4 flex-shrink-0" />
                              <span>
                                Awaiting admin response. We typically respond within 1 business day.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
