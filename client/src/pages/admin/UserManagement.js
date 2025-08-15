import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TokenStorage } from '../../utils/security';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [deactivationReason, setDeactivationReason] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    merchants: 0,
    admins: 0,
    kycApproved: 0,
    kycPending: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, kycFilter, roleFilter, dateFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/admin/users', config);
      setUsers(response.data.users);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    // KYC filter
    if (kycFilter !== 'all') {
      filtered = filtered.filter(user => user.kycStatus === kycFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(user => 
          new Date(user.createdAt) >= filterDate
        );
      }
    }

    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setProcessing(true);
      const action = currentStatus ? 'deactivate' : 'activate';
      
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`/api/admin/users/${userId}/${action}`, {
        reason: action === 'deactivate' ? deactivationReason : undefined
      }, config);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      
      setStats(prev => ({
        ...prev,
        active: currentStatus ? prev.active - 1 : prev.active + 1,
        inactive: currentStatus ? prev.inactive + 1 : prev.inactive - 1
      }));
      
      toast.success(`User ${action}d successfully`);
      setShowDeactivateModal(false);
      setDeactivationReason('');
    } catch (err) {
      console.error(`Error ${currentStatus ? 'deactivating' : 'activating'} user:`, err);
      toast.error(err.response?.data?.message || `Failed to ${currentStatus ? 'deactivate' : 'activate'} user`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/admin/users/${userId}`, config);
      
      // Update local state
      const deletedUser = users.find(user => user.id === userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: deletedUser.isActive ? prev.active - 1 : prev.active,
        inactive: !deletedUser.isActive ? prev.inactive - 1 : prev.inactive,
        merchants: deletedUser.role === 'merchant' ? prev.merchants - 1 : prev.merchants,
        admins: deletedUser.role === 'admin' ? prev.admins - 1 : prev.admins
      }));
      
      toast.success('User deleted successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setProcessing(false);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const openDeactivateModal = (user) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-SS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 'badge badge-success' : 'badge badge-danger';
  };

  const getKycBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'rejected':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'badge badge-primary';
      case 'merchant':
        return 'badge badge-secondary';
      default:
        return 'badge badge-secondary';
    }
  };

  const getKycIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all users and their account settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Merchants</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.merchants}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">KYC Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.kycApproved}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">KYC Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.kycPending}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="form-label">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search by name, email, business, or phone"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* KYC Filter */}
            <div>
              <label className="form-label">KYC Status</label>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All KYC</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="required">Required</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="form-label">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Roles</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="form-label">Joined</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        </div>
        <div className="card-body">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full">
              <table className="table w-full min-w-[1200px]">
              <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">User</th>
                    <th className="table-header-cell">Contact</th>
                    <th className="table-header-cell">Business</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">KYC</th>
                    <th className="table-header-cell">Balance</th>
                    <th className="table-header-cell">Joined</th>
                    <th className="table-header-cell min-w-[200px]">Actions</th>
                  </tr>
                </thead>
              <tbody className="table-body">
                  {filteredUsers.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.businessName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{user.businessType || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={getRoleBadge(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadge(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getKycIcon(user.kycStatus)}
                        <span className={`ml-2 ${getKycBadge(user.kycStatus)}`}>
                          {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(user.balance || 0)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[200px]">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="btn btn-sm btn-secondary"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => user.isActive ? openDeactivateModal(user) : handleToggleUserStatus(user.id, user.isActive)}
                              className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? (
                                <ShieldExclamationIcon className="h-4 w-4" />
                              ) : (
                                <ShieldCheckIcon className="h-4 w-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn btn-sm btn-danger"
                              title="Delete User"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openUserModal(user)}
                      className="btn btn-sm btn-secondary"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {user.role !== 'admin' && (
                      <>
                        <button
                          onClick={() => user.isActive ? openDeactivateModal(user) : handleToggleUserStatus(user.id, user.isActive)}
                          className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <ShieldExclamationIcon className="h-4 w-4" />
                          ) : (
                            <ShieldCheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="text-gray-900">{user.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <span className={getRoleBadge(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={getStatusBadge(user.isActive)}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">KYC</p>
                    <div className="flex items-center">
                      {getKycIcon(user.kycStatus)}
                      <span className={`ml-1 ${getKycBadge(user.kycStatus)}`}>
                        {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="text-gray-900 font-medium">
                      {formatCurrency(user.balance || 0)}
                    </p>
                  </div>
                </div>
                
                {user.businessName && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Business</p>
                    <p className="text-sm text-gray-900">{user.businessName}</p>
                    <p className="text-xs text-gray-500">{user.businessType}</p>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || kycFilter !== 'all' || roleFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Users will appear here when they register on the platform.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Details - {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-4 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Full Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.phone}</p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.city}</p>
                        <p className="text-xs text-gray-500">City</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                {selectedUser.role === 'merchant' && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedUser.businessName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Business Name</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="h-5 w-5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedUser.businessType || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Business Type</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <span className={getRoleBadge(selectedUser.role)}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={getStatusBadge(selectedUser.isActive)}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">KYC Status</p>
                      <div className="flex items-center mt-1">
                        {getKycIcon(selectedUser.kycStatus)}
                        <span className={`ml-2 ${getKycBadge(selectedUser.kycStatus)}`}>
                          {selectedUser.kycStatus.charAt(0).toUpperCase() + selectedUser.kycStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Balance</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(selectedUser.balance || 0)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Joined Date</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Login</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                {selectedUser.role === 'merchant' && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Transaction Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedUser.totalTransactions || 0}</p>
                          <p className="text-xs text-gray-500">Total Transactions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedUser.totalRevenue || 0)}
                          </p>
                          <p className="text-xs text-gray-500">Total Revenue</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedUser.successRate || 0}%
                          </p>
                          <p className="text-xs text-gray-500">Success Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Modal */}
      {showDeactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Deactivate User Account</h3>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-warning-800">
                        Deactivate {selectedUser.firstName} {selectedUser.lastName}?
                      </h3>
                      <div className="mt-2 text-sm text-warning-700">
                        <p>
                          This will prevent the user from accessing their account. You can reactivate it later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Reason for Deactivation *</label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Please provide a reason for deactivating this account..."
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive)}
                  disabled={processing || !deactivationReason.trim()}
                  className="btn btn-warning"
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Deactivating...
                    </>
                  ) : (
                    'Deactivate Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;