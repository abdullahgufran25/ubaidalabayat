import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Shield, User, Award, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const Customers = () => {
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUser?._id) {
      addToast('You cannot change your own admin role!', 'error');
      return;
    }

    setUpdatingId(id);
    try {
      const res = await axios.put(`/api/auth/users/${id}`, { role: newRole });
      if (res.data.success) {
        addToast(`User role updated to ${newRole} successfully`, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?._id) {
      addToast('You cannot delete your own account!', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/auth/users/${id}`);
      if (res.data.success) {
        addToast(res.data.message || 'User deleted successfully', 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Customer & User Accounts</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Manage registered customer profiles, view system staff, and configure administrative roles
        </p>
      </div>

      {/* Statistics Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-luxury-gray rounded p-5 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold">Total Customers</p>
              <h3 className="text-xl font-serif font-bold text-luxury-dark">
                {users.filter(u => u.role === 'customer').length}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-luxury-gray rounded p-5 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold">Staff Members</p>
              <h3 className="text-xl font-serif font-bold text-luxury-dark">
                {users.filter(u => u.role === 'staff').length}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-luxury-gray rounded p-5 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-600 rounded">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold">Administrators</p>
              <h3 className="text-xl font-serif font-bold text-luxury-dark">
                {users.filter(u => u.role === 'admin').length}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading accounts directory...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No registered user accounts found.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Name & Profile Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4 text-center">Current Role</th>
                  <th className="p-4 text-center">Change Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-gray-55 transition-colors">
                    {/* User profile */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                          usr.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          usr.role === 'staff' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {usr.name ? usr.name.substring(0, 2) : 'US'}
                        </div>
                        <div>
                          <p className="font-semibold text-luxury-dark flex items-center">
                            {usr.name}
                            {usr._id === currentUser?._id && (
                              <span className="ml-2 px-1.5 py-0.2 text-[8px] uppercase tracking-wider bg-gray-100 border text-gray-500 rounded font-normal">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-luxury-textGray font-mono">{usr._id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="flex items-center text-luxury-textGray font-mono text-[10px]">
                          <Mail size={11} className="mr-1.5 text-luxury-gold" />
                          {usr.email}
                        </p>
                        <p className="flex items-center text-luxury-textGray font-mono text-[10px]">
                          <Phone size={11} className="mr-1.5 text-luxury-gold" />
                          {usr.phone || 'No phone number'}
                        </p>
                      </div>
                    </td>

                    {/* Joined date */}
                    <td className="p-4 text-luxury-textGray font-mono text-[10px]">
                      <div className="flex items-center">
                        <Calendar size={11} className="mr-1.5 text-luxury-gold" />
                        {new Date(usr.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        usr.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        usr.role === 'staff' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {usr.role}
                      </span>
                    </td>

                    {/* Change Role Selector */}
                    <td className="p-4 text-center">
                      <select
                        disabled={usr._id === currentUser?._id || updatingId === usr._id}
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                        className="bg-white border border-luxury-gray rounded px-2 py-1 text-[10px] tracking-wider uppercase font-semibold text-luxury-dark focus:border-luxury-gold outline-none disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(usr._id)}
                        disabled={usr._id === currentUser?._id}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors inline-block rounded"
                        title="Delete User Account"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
