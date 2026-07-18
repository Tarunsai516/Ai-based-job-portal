import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Toast from '../../components/common/Toast';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { adminService } from '../../services/adminService';
import { HiOutlineTrash, HiOutlineUser } from 'react-icons/hi';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        setLoading(false);
      });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setToast({ message: `Successfully deleted user "${selectedUser.name}"`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete user. Please try again.', type: 'error' });
    } finally {
      setSelectedUser(null);
      setIsDeleteOpen(false);
    }
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedUser(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Platform User?"
        message={`Are you sure you want to permanently delete "${selectedUser?.name}" (${selectedUser?.email})? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-xs text-gray-500 mt-0.5">Observe, filter, or revoke access for platform members.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search users by name, email, or role..."
            showFilterBtn={false}
          />
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-4 flex justify-between items-center animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-250 rounded w-1/4" />
                  <div className="h-2.5 bg-gray-150 rounded w-1/3" />
                </div>
                <div className="h-8 w-16 bg-gray-150 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Users Found"
            message={searchVal ? "Try adjusting your search criteria." : "No registered users exist on the platform."}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-100">
              {filtered.map(usr => (
                <div key={usr.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 bg-gray-50 rounded-lg border border-gray-100"><HiOutlineUser /></span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-805">{usr.name}</h4>
                      <p className="text-xs text-gray-400">{usr.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      usr.role === 'recruiter' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                      usr.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-250' :
                      'bg-blue-50 text-blue-700 border-blue-250'
                    }`}>
                      {usr.role}
                    </span>

                    {usr.role !== 'admin' && (
                      <button
                        onClick={() => { setSelectedUser(usr); setIsDeleteOpen(true); }}
                        className="p-2 border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
