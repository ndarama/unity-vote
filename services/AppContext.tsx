'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contest, Contestant, VoteRecord, AdminUser, Category } from '../types';
import { INITIAL_CONTESTS, INITIAL_CONTESTANTS } from './mockData';

export type AdminRole = 'admin' | 'manager' | null;

// Mock Initial Admin Users
const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'u1', email: 'admin@unitysummit.no', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
  { id: 'u2', email: 'manager@unitysummit.no', role: 'manager', status: 'active', lastLogin: '2025-10-23T14:15:00.000Z' },
  { id: 'u3', email: 'sarah.editor@unitysummit.no', role: 'manager', status: 'invited', lastLogin: '' },
];

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  contests: Contest[];
  contestants: Contestant[];
  categories: Category[];
  votes: VoteRecord[];
  adminRole: AdminRole;
  adminUsers: AdminUser[];
  // Loading states
  isLoadingContests: boolean;
  isLoadingContestants: boolean;
  isLoadingCategories: boolean;
  // Auth
  loginAdmin: (role: AdminRole) => void;
  logoutAdmin: () => void;
  // Voting
  castVote: (email: string, contestantId: string, contestId: string) => Promise<{ success: boolean; message: string }>;
  verifyVote: (email: string, otp: string) => Promise<boolean>;
  confirmVote: (email: string, contestantId: string, contestId: string) => void;
  // Contestant Management
  updateContestant: (id: string, updates: Partial<Contestant>) => Promise<void>;
  toggleContestantVisibility: (id: string) => Promise<void>;
  addContestant: (contestant: Contestant) => Promise<void>;
  deleteContestant: (id: string) => Promise<void>;
  withdrawContestant: (id: string) => Promise<void>;
  // Contest Management
  updateContestStatus: (contestId: string, status: Contest['status']) => void;
  updateContest: (contestId: string, updates: Partial<Contest>) => void;
  // User Management
  inviteAdminUser: (email: string, role: 'admin' | 'manager') => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  resetAdminUserPassword: (id: string) => Promise<boolean>;
  // Notifications
  notifications: Notification[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  // Refresh
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [contestants, setContestants] = useState<Contestant[]>(INITIAL_CONTESTANTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null);
  
  // Loading states
  const [isLoadingContests, setIsLoadingContests] = useState(true);
  const [isLoadingContestants, setIsLoadingContestants] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Load contests from database
  const loadContests = async () => {
    try {
      setIsLoadingContests(true);
      const response = await fetch('/api/contests');
      if (response.ok) {
        const data = await response.json();
        setContests(data);
      }
    } catch (error) {
      console.error('Error loading contests:', error);
    } finally {
      setIsLoadingContests(false);
    }
  };

  // Load contestants from database
  const loadContestants = async () => {
    try {
      setIsLoadingContestants(true);
      const response = await fetch('/api/contestants');
      if (response.ok) {
        const data = await response.json();
        setContestants(data);
      }
    } catch (error) {
      console.error('Error loading contestants:', error);
    } finally {
      setIsLoadingContestants(false);
    }
  };

  // Load categories from database
  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      loadContests(),
      loadContestants(),
      loadCategories()
    ]);
  };

  // Load admin state from session storage for persistence on refresh
  useEffect(() => {
    const role = sessionStorage.getItem('unity_vote_admin_role') as AdminRole;
    if (role === 'admin' || role === 'manager') {
      setAdminRole(role);
    }
    // Load data from database
    loadContests();
    loadContestants();
    loadCategories();
  }, []);

  const loginAdmin = (role: AdminRole) => {
    setAdminRole(role);
    if (role) {
      sessionStorage.setItem('unity_vote_admin_role', role);
    }
  };

  const logoutAdmin = () => {
    setAdminRole(null);
    sessionStorage.removeItem('unity_vote_admin_role');
  };

  const castVote = async (email: string, contestantId: string, contestId: string) => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          contestantId,
          contestId,
          ipAddress: '127.0.0.1' // In production, get from request
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPendingVoteId(data.voteId);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      return { success: false, message: 'Failed to cast vote. Please try again.' };
    }
  };

  const verifyVote = async (email: string, otp: string) => {
    if (!pendingVoteId) {
      console.error('No pending vote to verify');
      return false;
    }

    try {
      const response = await fetch(`/api/votes/${pendingVoteId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();

      if (response.ok) {
        // Reload contestants to get updated vote counts
        await loadContestants();
        setPendingVoteId(null);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying vote:', error);
      return false;
    }
  };

  const confirmVote = (email: string, contestantId: string, contestId: string) => {
    // This function is now handled by verifyVote API call
    // Keeping for backward compatibility but it does nothing
    console.log('Vote confirmed via API for', email);
  };

  const updateContestant = async (id: string, updates: Partial<Contestant>) => {
    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        await loadContestants(); // Auto-refresh
        showNotification('success', 'Contestant updated successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to update contestant');
      }
    } catch (error) {
      console.error('Error updating contestant:', error);
      showNotification('error', 'Failed to update contestant');
    }
  };

  const toggleContestantVisibility = async (id: string) => {
    const contestant = contestants.find(c => c.id === id);
    if (!contestant) return;
    
    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !contestant.isVisible })
      });
      
      if (response.ok) {
        await loadContestants(); // Auto-refresh
        const updatedContestant = await response.json();
        showNotification('success', `Contestant ${updatedContestant.isVisible ? 'shown' : 'hidden'}`);
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to toggle visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showNotification('error', 'Failed to toggle visibility');
    }
  };

  const withdrawContestant = async (id: string) => {
    const contestant = contestants.find(c => c.id === id);
    if (!contestant) return;
    
    const newStatus = contestant.status === 'withdrawn' ? 'active' : 'withdrawn';
    
    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        await loadContestants(); // Auto-refresh
        showNotification('success', `Contestant ${newStatus === 'withdrawn' ? 'withdrawn' : 'reactivated'}`);
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Failed to update status');
    }
  };

  const addContestant = async (contestant: Contestant) => {
    try {
      const response = await fetch('/api/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contestant,
          status: 'active',
          votes: 0
        })
      });
      
      if (response.ok) {
        await loadContestants(); // Auto-refresh
        showNotification('success', 'Contestant added successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to add contestant');
      }
    } catch (error) {
      console.error('Error adding contestant:', error);
      showNotification('error', 'Failed to add contestant');
    }
  };

  const deleteContestant = async (id: string) => {
    if (adminRole !== 'admin') {
      showNotification('error', 'Permission denied: Only Admins can delete.');
      return;
    }
    
    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadContestants(); // Auto-refresh
        showNotification('success', 'Contestant deleted successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to delete contestant');
      }
    } catch (error) {
      console.error('Error deleting contestant:', error);
      showNotification('error', 'Failed to delete contestant');
    }
  };

  const updateContestStatus = (contestId: string, status: Contest['status']) => {
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, status } : c));
  };

  const updateContest = (contestId: string, updates: Partial<Contest>) => {
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, ...updates } : c));
  };

  // --- User Management Methods ---

  const inviteAdminUser = (email: string, role: 'admin' | 'manager') => {
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      status: 'invited',
      lastLogin: ''
    };
    setAdminUsers(prev => [...prev, newUser]);
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteAdminUser = (id: string) => {
    setAdminUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetAdminUserPassword = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; 
  };

  // --- Notifications ---
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider value={{
      contests,
      contestants,
      categories,
      votes,
      adminRole,
      // Loading states
      isLoadingContests,
      isLoadingContestants,
      isLoadingCategories,
      // Auth
      loginAdmin,
      logoutAdmin,
      // Voting
      castVote,
      verifyVote,
      confirmVote,
      // Contestant Management
      updateContestant,
      toggleContestantVisibility,
      withdrawContestant,
      addContestant,
      deleteContestant,
      // Contest Management
      updateContestStatus,
      updateContest,
      // User Mgmt
      adminUsers,
      inviteAdminUser,
      updateAdminUser,
      deleteAdminUser,
      resetAdminUserPassword,
      // Notifications
      notifications,
      showNotification,
      removeNotification,
      // Refresh
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};