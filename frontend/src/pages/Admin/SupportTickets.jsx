import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supportService } from '../../services/supportService';
import Toast from '../../components/common/Toast';
import {
  HiOutlineTicket,
  HiOutlineChatAlt2,
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineReply,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineMail,
} from 'react-icons/hi';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

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

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setToast({ message: 'Failed to load support tickets.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await supportService.updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      setToast({ message: `Ticket status updated to ${statusLabels[newStatus]}.`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to update status.', type: 'error' });
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      const updated = await supportService.replyToTicket(ticketId, replyText.trim());
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updated : t))
      );
      setReplyText('');
      setReplyingId(null);
      setToast({ message: 'Reply sent to user.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to send reply.', type: 'error' });
    }
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

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

  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-none flex items-center gap-2">
            <HiOutlineTicket className="h-7 w-7 text-purple-600" />
            Support Tickets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View and respond to user support requests from seekers and recruiters.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['ALL', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <HiOutlineFilter className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              {s === 'ALL' ? 'All' : statusLabels[s]}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <HiOutlineChatAlt2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No tickets found.</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter !== 'ALL'
                ? `No ${statusLabels[filter].toLowerCase()} tickets at the moment.`
                : 'No support tickets have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket) => {
              const isExpanded = expandedId === ticket.id;
              const isReplying = replyingId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Ticket Header */}
                  <div
                    className="p-5 flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : ticket.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <HiOutlineUser className="h-3.5 w-3.5" />
                          {ticket.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineMail className="h-3.5 w-3.5" />
                          {ticket.userEmail}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                            ticket.userRole === 'recruiter'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {ticket.userRole}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="h-3.5 w-3.5" />
                          {formatDate(ticket.createdAt)}
                        </span>
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

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-5">
                      {/* Message */}
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                          User Message
                        </p>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {ticket.message}
                        </div>
                      </div>

                      {/* Admin Reply (if exists) */}
                      {ticket.adminReply && (
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-2">
                            Admin Reply
                          </p>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-xs text-purple-800 leading-relaxed whitespace-pre-wrap">
                            {ticket.adminReply}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                        {/* Status Changer */}
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase text-gray-400">
                            Status:
                          </label>
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Reply Toggle */}
                        <button
                          onClick={() => {
                            setReplyingId(isReplying ? null : ticket.id);
                            setReplyText(ticket.adminReply || '');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <HiOutlineReply className="h-3.5 w-3.5" />
                          {isReplying ? 'Cancel' : ticket.adminReply ? 'Edit Reply' : 'Reply'}
                        </button>
                      </div>

                      {/* Reply Form */}
                      {isReplying && (
                        <div className="space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            placeholder="Type your reply to the user..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={!replyText.trim()}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Send Reply
                          </button>
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
    </DashboardLayout>
  );
}
