'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Shield, ShieldCheck, Eye, EyeOff, Mail, X as XIcon } from 'lucide-react';
import { Button, Input, Card } from './UI';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface AdminManagementProps {
  currentUser: {
    id: string;
    role: string;
  };
}

export const AdminManagement: React.FC<AdminManagementProps> = ({ currentUser }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'invite'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'manager',
    isActive: true
  });

  // Invite form state
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'manager'
  });

  useEffect(() => {
    fetchAdmins();
    fetchInvitations();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      
      if (response.ok) {
        setAdmins(data.admins);
      } else {
        setError(data.error || 'Failed to fetch admins');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invite');
      const data = await response.json();
      
      if (response.ok) {
        setInvitations(data.invitations);
      }
    } catch (err) {
      console.error('Failed to fetch invitations');
    }
  };

  const handleInvite = () => {
    setInviteData({
      email: '',
      name: '',
      role: 'manager'
    });
    setShowInviteModal(true);
    setError('');
    setSuccess('');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send invitation');
        return;
      }

      setSuccess('Invitation sent successfully! They will receive an email with setup instructions.');
      setShowInviteModal(false);
      fetchInvitations();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invite/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to cancel invitation');
        return;
      }

      setSuccess('Invitation cancelled successfully');
      fetchInvitations();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'manager',
      isActive: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (admin: Admin) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = modalMode === 'create' 
      ? '/api/admin' 
      : `/api/admin/${selectedAdmin?.id}`;
    
    const method = modalMode === 'create' ? 'POST' : 'PUT';

    const body: any = {
      email: formData.email,
      name: formData.name,
      role: formData.role,
      isActive: formData.isActive
    };

    // Only include password if it's provided
    if (formData.password) {
      body.password = formData.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Operation failed');
        return;
      }

      setSuccess(modalMode === 'create' ? 'Admin created successfully' : 'Admin updated successfully');
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Delete failed');
        return;
      }

      setSuccess('Admin deleted successfully');
      fetchAdmins();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      const response = await fetch(`/api/admin/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !admin.isActive })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      setSuccess(`Admin ${!admin.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchAdmins();
    } catch (err) {
      setError('Network error');
    }
  };

  const canManageAdmins = currentUser.role === 'admin';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Admin Management</h2>
          <p className="text-brand-grey mt-1">Manage administrator accounts and permissions</p>
        </div>
        {canManageAdmins && (
          <div className="flex gap-2">
            <Button onClick={handleInvite} variant="secondary" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invite User
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Admin
            </Button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b bg-blue-50">
            <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invitations ({invitations.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brand-navy">{invite.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brand-grey">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invite.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-grey">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Admins Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-navy/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy uppercase tracking-wider">
                  Created
                </th>
                {canManageAdmins && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-brand-navy uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                        {admin.role === 'admin' ? (
                          <ShieldCheck className="h-5 w-5 text-brand-orange" />
                        ) : (
                          <Shield className="h-5 w-5 text-brand-grey" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-brand-navy">{admin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-grey">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-grey">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  {canManageAdmins && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className="text-brand-grey hover:text-brand-navy"
                          title={admin.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {admin.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {admin.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite New Admin
            </h3>
            <p className="text-sm text-brand-grey mb-4">
              Send an invitation email with a secure signup link. The invitation will expire in 7 days.
            </p>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Send Invitation
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brand-navy mb-4">
              {modalMode === 'create' ? 'Create New Admin' : 'Edit Admin'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label={modalMode === 'create' ? 'Password' : 'Password (leave blank to keep current)'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={modalMode === 'create'}
              />
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {modalMode === 'edit' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-brand-navy">
                    Active Account
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {modalMode === 'create' ? 'Create Admin' : 'Update Admin'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
