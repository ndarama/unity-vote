'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contest, Contestant, VoteRecord, AdminUser } from '../types';
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
  votes: VoteRecord[];
  adminRole: AdminRole;
  adminUsers: AdminUser[];
  loginAdmin: (role: AdminRole) => void;
  logoutAdmin: () => void;
  castVote: (email: string, contestantId: string, contestId: string) => Promise<{ success: boolean; message: string }>;
  verifyVote: (email: string, otp: string) => Promise<boolean>;
  updateContestant: (id: string, updates: Partial<Contestant>) => void;
  toggleContestantVisibility: (id: string) => void;
  addContestant: (contestant: Contestant) => void;
  deleteContestant: (id: string) => void;
  withdrawContestant: (id: string) => void;
  confirmVote: (email: string, contestantId: string, contestId: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [contestants, setContestants] = useState<Contestant[]>(INITIAL_CONTESTANTS);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load admin state from session storage for persistence on refresh
  useEffect(() => {
    const role = sessionStorage.getItem('unity_vote_admin_role') as AdminRole;
    if (role === 'admin' || role === 'manager') {
      setAdminRole(role);
    }
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
    // Check contest status
    const contest = contests.find(c => c.id === contestId);
    if (!contest || contest.status !== 'active') {
       return { success: false, message: 'Voting is currently closed or paused for this contest.' };
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already voted for this contest (simplified logic)
    const existingVote = votes.find(v => v.email === email && v.contestId === contestId && v.status === 'verified');
    
    if (existingVote) {
      return { success: false, message: 'This email has already voted in this contest.' };
    }

    // In a real app, we would create a "pending" vote here and send email
    return { success: true, message: 'OTP sent to your email.' };
  };

  const verifyVote = async (email: string, otp: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock OTP verification (accepts '123456')
    if (otp === '123456') {
      return true;
    }
    return false;
  };

  const confirmVote = (email: string, contestantId: string, contestId: string) => {
     const newVote: VoteRecord = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        contestantId,
        contestId,
        timestamp: Date.now(),
        status: 'verified'
      };
      
      setVotes(prev => [...prev, newVote]);
      
      setContestants(prev => prev.map(c => 
        c.id === contestantId ? { ...c, votes: c.votes + 1 } : c
      ));
  };

  const updateContestant = (id: string, updates: Partial<Contestant>) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleContestantVisibility = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
  };

  const withdrawContestant = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'withdrawn' ? 'active' : 'withdrawn' } : c));
  };

  const addContestant = (contestant: Contestant) => {
    setContestants(prev => [...prev, { ...contestant, status: 'active' }]);
  };

  const deleteContestant = (id: string) => {
    if (adminRole !== 'admin') {
      console.error("Permission denied: Only Admins can delete.");
      return;
    }
    setContestants(prev => prev.filter(c => c.id !== id));
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
      votes,
      adminRole,
      loginAdmin,
      logoutAdmin,
      castVote,
      verifyVote,
      updateContestant,
      toggleContestantVisibility,
      withdrawContestant,
      addContestant,
      deleteContestant,
      confirmVote,
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
      removeNotification
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