'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Settings, Eye, Edit3, Wand2, Trash2, Users, ChevronRight, Image as ImageIcon, X, Download, Upload, Shield, Mail, KeyRound, CheckCircle2, PlayCircle, PauseCircle, StopCircle, Ban, Linkedin, Calendar, Clock, Save, Activity, Percent, Trophy, TrendingUp, Vote, Server, UserCog, Lock, Globe, Smartphone, AlertTriangle, BarChart2, FileText, Filter, Search, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUpDown, Monitor, Cpu, HardDrive, Wifi, ShieldAlert, Zap, Database } from 'lucide-react';
import { useAppContext } from '../services/AppContext';
import { Button, Card, Input, Modal, SkeletonStats, SkeletonTable } from '../components/UI';
import { generateBio } from '../services/geminiService';
import { Contestant, AdminUser, Contest } from '../types';
import { formatDistanceToNow, format, subDays, subHours, isAfter } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Static monitor data - defined outside component for performance
const MONITOR_DATA = {
  traffic: Array.from({length: 20}, (_, i) => ({
    time: `${i}:00`,
    requests: 1000 + (i * 25),
    latency: 20 + (i % 10) * 3
  })),
  services: [
    { name: 'PostgreSQL Database', status: 'operational', uptime: '99.99%', latency: '4ms', icon: Database },
    { name: 'Redis Cache', status: 'operational', uptime: '99.95%', latency: '2ms', icon: Zap },
    { name: 'API Gateway', status: 'operational', uptime: '100%', latency: '12ms', icon: Server },
    { name: 'Email Service (SMTP)', status: 'degraded', uptime: '98.50%', latency: '150ms', icon: Mail },
    { name: 'Storage Buckets', status: 'operational', uptime: '99.99%', latency: '45ms', icon: HardDrive },
    { name: 'CDN Nodes (Europe)', status: 'operational', uptime: '100%', latency: '12ms', icon: Globe },
  ],
  securityLogs: [
    { id: 1, type: 'Failed Login', ip: '192.168.1.5', location: 'Moscow, RU', time: '2 mins ago', severity: 'medium' },
    { id: 2, type: 'SQL Injection Attempt', ip: '45.22.11.9', location: 'Beijing, CN', time: '15 mins ago', severity: 'high' },
    { id: 3, type: 'Admin Login', ip: '10.0.0.5', location: 'Oslo, NO', time: '1 hour ago', severity: 'low' },
    { id: 4, type: 'Rate Limit Exceeded', ip: '172.16.0.4', location: 'New York, US', time: '2 hours ago', severity: 'low' },
    { id: 5, type: 'New Device', ip: '82.11.44.2', location: 'London, UK', time: '4 hours ago', severity: 'medium' },
  ]
};

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { 
    adminRole, contests, contestants, categories, votes, 
    toggleContestantVisibility, updateContestant, addContestant, deleteContestant, withdrawContestant, updateContestStatus, updateContest,
    adminUsers, inviteAdminUser, updateAdminUser, deleteAdminUser, resetAdminUserPassword,
    showNotification, isLoadingContests, isLoadingContestants, refreshData
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'overview' | 'contestants' | 'users' | 'system' | 'account' | 'monitor'>('overview');
  
  // --- Overview Filters ---
  const [showOverviewFilters, setShowOverviewFilters] = useState(false);
  const [overviewCategory, setOverviewCategory] = useState<string>('All');
  const [overviewTimeRange, setOverviewTimeRange] = useState<'all' | '30d' | '7d' | '24h'>('all');

  // --- Contestant List Filters ---
  const [showContestantFilters, setShowContestantFilters] = useState(true);
  const [contestantSearch, setContestantSearch] = useState('');
  const [contestantStatusFilter, setContestantStatusFilter] = useState<'all' | 'active' | 'paused' | 'withdrawn'>('all');
  const [contestantCategoryFilter, setContestantCategoryFilter] = useState<string>('All');
  const [contestantSort, setContestantSort] = useState<'votesDesc' | 'votesAsc' | 'nameAsc'>('votesDesc');

  // Contestant State
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // Preview & Drill-down State
  const [previewContestant, setPreviewContestant] = useState<Contestant | null>(null);
  const [viewingStats, setViewingStats] = useState<Contestant | null>(null);
  
  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager'>('manager');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null); // If editing existing user
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  // Account Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Contest (Assuming single contest for now)
  const activeContest = contests[0];

  // Schedule State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Guard
  useEffect(() => {
    if (!adminRole) {
      router.push('/admin/login');
    }
  }, [adminRole, router]);

  // Sync state with active contest data
  useEffect(() => {
    if (activeContest) {
        // Helper to format ISO string or date string to datetime-local value (YYYY-MM-DDThh:mm)
        // Note: mock data dates might just be 'YYYY-MM-DD', we handle both
        const formatToInput = (dateStr: string) => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            
            const pad = (n: number) => n.toString().padStart(2, '0');
            const yyyy = date.getFullYear();
            const MM = pad(date.getMonth() + 1);
            const dd = pad(date.getDate());
            const hh = pad(date.getHours());
            const mm = pad(date.getMinutes());
            
            return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
        };
        
        setStartDate(formatToInput(activeContest.startDate));
        setEndDate(formatToInput(activeContest.endDate));
    }
  }, [activeContest]);

  // Use static monitor data
  const monitorData = MONITOR_DATA;

  const allCategories = Array.from(new Set(contestants.map(c => c.category))).sort();

  // --- Filtered Data for Overview ---
  const filteredOverviewContestants = useMemo(() => {
    return overviewCategory === 'All' 
      ? contestants 
      : contestants.filter(c => c.category === overviewCategory);
  }, [contestants, overviewCategory]);

  // --- Time Range Filter Logic for Metrics ---
  const getFilteredVotes = useMemo(() => {
      const now = new Date();
      let cutoff = new Date(0); // Epoch

      if (overviewTimeRange === '24h') cutoff = subHours(now, 24);
      if (overviewTimeRange === '7d') cutoff = subDays(now, 7);
      if (overviewTimeRange === '30d') cutoff = subDays(now, 30);

      // Filter votes by date AND by currently selected category contestants
      const validContestantIds = new Set(filteredOverviewContestants.map(c => c.id));
      
      return votes.filter(v => 
          validContestantIds.has(v.contestantId) && 
          isAfter(v.timestamp, cutoff)
      );
  }, [overviewTimeRange, votes, filteredOverviewContestants]);

  const filteredVotes = getFilteredVotes;

  const filteredTotalVotes = overviewTimeRange === 'all' 
      ? filteredOverviewContestants.reduce((sum, c) => sum + c.votes, 0)
      : filteredVotes.length;

  const activeContestsCount = contests.filter(c => c.status === 'active').length;
  const activeNomineesCount = filteredOverviewContestants.filter(c => c.status === 'active').length;
  const avgVotesPerNominee = activeNomineesCount > 0 ? Math.round(filteredTotalVotes / activeNomineesCount) : 0;
  
  // Growth Calculation
  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const votesLast24h = filteredVotes.filter(v => (now - v.timestamp) < oneDayMs).length;
  const prevTotal = filteredTotalVotes - votesLast24h;
  const voteGrowth = prevTotal > 0 ? ((votesLast24h / prevTotal) * 100).toFixed(2) : "0.0";

  // --- Filtered Data for Contestants Tab ---
  const filteredListContestants = useMemo(() => {
    let result = contestants.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(contestantSearch.toLowerCase()) || 
                              c.email.toLowerCase().includes(contestantSearch.toLowerCase());
        
        const matchesStatus = contestantStatusFilter === 'all' 
                              ? true 
                              : contestantStatusFilter === 'active' ? (c.status === 'active' && c.isVisible)
                              : contestantStatusFilter === 'paused' ? (c.status === 'active' && !c.isVisible)
                              : c.status === 'withdrawn';
        
        const matchesCategory = contestantCategoryFilter === 'All' 
                              ? true 
                              : c.category === contestantCategoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sorting
    result.sort((a, b) => {
        if (contestantSort === 'votesDesc') return b.votes - a.votes;
        if (contestantSort === 'votesAsc') return a.votes - b.votes;
        if (contestantSort === 'nameAsc') return a.name.localeCompare(b.name);
        return 0;
    });

    return result;
  }, [contestants, contestantSearch, contestantStatusFilter, contestantCategoryFilter, contestantSort]);

  const top5ContestantsMemo = useMemo(() => {
    if (filteredOverviewContestants.length === 0) return [];
    return filteredOverviewContestants
      .slice()
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);
  }, [filteredOverviewContestants]);
  
  const trendDataMemo = useMemo(() => {
    if (top5ContestantsMemo.length === 0) return [];
    
    const days = overviewTimeRange === '24h' ? 24 : 7;
    const isHourly = overviewTimeRange === '24h';
    const now = new Date();
    const result: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        if (isHourly) d.setHours(now.getHours() - i);
        else d.setDate(now.getDate() - i);
        
        const label = isHourly 
            ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            : d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const point: any = { name: label };
        let total = 0;
        
        for (const c of top5ContestantsMemo) {
            const seed = c.name.length + i;
            const base = Math.floor(c.votes / (days * 2)); 
            const noise = (seed % 10) * 2;
            const trend = i * 2; 
            const val = Math.max(0, base + noise + trend); 
            point[c.name] = val;
            total += val;
        }
        
        point['total'] = Math.floor(total * 1.2);
        result.push(point);
    }
    
    return result;
  }, [overviewTimeRange, top5ContestantsMemo]);

  const drillDownStatsMemo = useMemo(() => {
      if (!viewingStats) return null;
      
      const avgVotesPerHour = Math.floor(viewingStats.votes / 24);
      const timeSeries = Array.from({length: 24}, (_, i) => ({
          hour: `${i}:00`,
          votes: Math.max(2, avgVotesPerHour + ((i * 7) % 10) - 3)
      }));
      
      const countries = [
          { name: 'Norway', votes: Math.floor(viewingStats.votes * 0.7) },
          { name: 'Sweden', votes: Math.floor(viewingStats.votes * 0.15) },
          { name: 'UK', votes: Math.floor(viewingStats.votes * 0.08) },
          { name: 'USA', votes: Math.floor(viewingStats.votes * 0.05) },
          { name: 'Other', votes: Math.floor(viewingStats.votes * 0.02) },
      ];
      
      const devices = [
          { name: 'Mobile', value: Math.floor(viewingStats.votes * 0.65), color: '#EC6822' },
          { name: 'Desktop', value: Math.floor(viewingStats.votes * 0.30), color: '#062B3F' },
          { name: 'Tablet', value: Math.floor(viewingStats.votes * 0.05), color: '#9CA9B2' },
      ];
      
      const ipClusters = [
          { ip: '84.212.45.12', count: 142, location: 'Oslo, NO', status: 'Suspicious' },
          { ip: '92.110.22.88', count: 45, location: 'Bergen, NO', status: 'Warning' },
          { ip: '193.212.1.1', count: 28, location: 'Trondheim, NO', status: 'OK' },
          { ip: '62.14.88.99', count: 12, location: 'Stavanger, NO', status: 'OK' },
          { ip: '213.11.44.2', count: 8, location: 'Drammen, NO', status: 'OK' },
      ];
      
      return { timeSeries, countries, devices, ipClusters };
  }, [viewingStats]);

  if (!adminRole) return null;

  const displayCategories = contestantCategoryFilter === 'All' 
    ? Array.from(new Set(filteredListContestants.map(c => c.category))).sort()
    : [contestantCategoryFilter];


  const getContestantMetrics = (c: Contestant) => {
      const realVotes = votes.filter(v => v.contestantId === c.id);
      
      // Last Vote Timestamp
      let lastVoteTime = "No recent votes";
      let lastVoteDate: Date | null = null;
      if (realVotes.length > 0) {
          lastVoteDate = new Date(realVotes[realVotes.length - 1].timestamp);
          lastVoteTime = formatDistanceToNow(lastVoteDate, { addSuffix: true });
      } else if (c.votes > 0) {
          // Mock historical data for demo purposes
          lastVoteTime = "2 hours ago"; 
      }

      // Vote Velocity
      const velocity = realVotes.filter(v => Date.now() - v.timestamp < 3600000).length;
      const displayVelocity = velocity > 0 ? velocity : (c.votes > 500 ? Math.floor(Math.random() * 15) + 5 : 0);

      // Calculate share per category instead of overall
      const categoryContestants = contestants.filter(x => x.category === c.category);
      const categoryTotalVotes = categoryContestants.reduce((sum, x) => sum + x.votes, 0);
      const share = categoryTotalVotes > 0 ? ((c.votes / categoryTotalVotes) * 100).toFixed(1) : "0.0";

      return { lastVoteTime, displayVelocity, share };
  };

  // --- Dynamic Chart Data (Overview) ---
  const voteData = filteredOverviewContestants.filter(c => c.status !== 'withdrawn').map(c => ({
    name: c.name.split(' ')[0], 
    votes: c.votes
  })).sort((a,b) => b.votes - a.votes).slice(0, 10);

  const top5Contestants = top5ContestantsMemo;
  const chartColors = ['#EC6822', '#062B3F', '#10B981', '#8B5CF6', '#F59E0B'];

  const trendData = trendDataMemo;

  // --- Drill Down Mock Generator ---
  const drillDownStats = drillDownStatsMemo;

  // Get category names for dropdowns
  const categoryNames: string[] = categories.map(c => c.name).sort();

  // --- Handlers ---
  const handleEdit = (contestant: Contestant) => {
    setEditingContestant({ ...contestant });
    const isKnown = categoryNames.includes(contestant.category);
    setIsCustomCategory(!isKnown && contestant.category !== '');
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteContestant(id);
      showNotification('success', `Deleted contestant: ${name}`);
    }
  };
  
  const handleWithdraw = (id: string, name: string) => {
      if(window.confirm(`Withdraw "${name}"?`)) {
        withdrawContestant(id);
        showNotification('info', `Withdrew contestant: ${name}`);
      }
  };

  const handleRestore = (id: string, name: string) => {
      if(window.confirm(`Restore "${name}"?`)) {
        withdrawContestant(id);
        showNotification('success', `Restored contestant: ${name}`);
      }
  };

  const handleCreate = () => {
    setEditingContestant({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      category: categoryNames.length > 0 ? categoryNames[0] : '',
      bio: '',
      photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60',
      votes: 0,
      isVisible: true,
      status: 'active',
      email: '',
      linkedinUrl: '',
      contestId: contests[0]?.id || ''
    });
    setIsCustomCategory(false);
    setIsEditModalOpen(true);
  };

  const handleSaveContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContestant) return;
    const exists = contestants.find(c => c.id === editingContestant.id);
    if (exists) {
      await updateContestant(editingContestant.id, editingContestant);
      showNotification('success', 'Contestant updated successfully.');
    } else {
      await addContestant(editingContestant);
      showNotification('success', 'New contestant created.');
    }
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingContestant) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingContestant({ ...editingContestant, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeminiBio = async () => {
    if (!editingContestant?.name || !editingContestant?.category) {
      showNotification('error', "Please enter a name and category first.");
      return;
    }
    setIsGeneratingBio(true);
    const bio = await generateBio(editingContestant.name, editingContestant.category);
    setEditingContestant(prev => prev ? { ...prev, bio } : null);
    setIsGeneratingBio(false);
    showNotification('success', 'Biography generated with AI.');
  };

  const handleOverviewExportCSV = () => {
    if (filteredOverviewContestants.length === 0) { showNotification('info', "No data to export."); return; }
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const generatedBy = adminUsers.find(u => u.role === adminRole)?.email || 'System';
    const metadata = `Overview Report | Generated: ${timestamp} | Filter: ${overviewCategory} | Time: ${overviewTimeRange}`;
    const headers = ['ID', 'Name', 'Category', 'Votes', 'Category Share %', 'Velocity', 'Last Vote', 'Status'];
    const rows = filteredOverviewContestants.map(c => {
        const metrics = getContestantMetrics(c);
        return [
            c.id, `"${c.name}"`, `"${c.category}"`, c.votes, `${metrics.share}%`, 
            metrics.displayVelocity, metrics.lastVoteTime, c.status
        ];
    });
    const csvContent = [metadata, '', headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Overview_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
      link.click();
      showNotification('success', 'Export completed successfully.');
    }
  };

  const handleOverviewExportPDF = () => {
    if (filteredOverviewContestants.length === 0) { showNotification('info', "No data to export."); return; }
    const doc = new jsPDF();
    doc.setFillColor(6, 43, 63); doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text('Unity Vote Overview Report', 14, 16);
    doc.setTextColor(0, 0, 0); doc.setFontSize(22); doc.text(overviewCategory === 'All' ? 'All Categories' : overviewCategory, 14, 40);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 48);
    doc.text(`Time Range: ${overviewTimeRange.toUpperCase()}`, 14, 53);
    
    const tableColumn = ["Rank", "Nominee", "Category", "Votes", "Cat. %", "Status"];
    const sorted = [...filteredOverviewContestants].sort((a, b) => b.votes - a.votes);
    const tableRows = sorted.map((c, i) => {
       const metrics = getContestantMetrics(c);
       return [i + 1, c.name, c.category, c.votes.toLocaleString(), `${metrics.share}%`, c.status];
    });

    autoTable(doc, {
      startY: 60, head: [tableColumn], body: tableRows, theme: 'grid',
      headStyles: { fillColor: [236, 104, 34], textColor: 255, fontStyle: 'bold' }
    });
    doc.save(`Overview_Report.pdf`);
    showNotification('success', 'PDF Report downloaded.');
  };

  const handleExportCSV = (category: string) => {
     // Use filteredListContestants for context-aware export
     const data = filteredListContestants.filter(c => c.category === category);
     if (data.length === 0) { showNotification('info', 'No contestants found for this category.'); return; }
     // ... Reuse previous logic structure simplified ...
     const rows = data.map(c => [c.id, c.name, c.category, c.votes, c.status].join(','));
     const blob = new Blob([`Name,Category,Votes,Status\n${rows}`], { type: 'text/csv' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `${category}_Export.csv`;
     link.click();
     showNotification('success', `Exported ${category} data.`);
  };

  const handleExportPDF = (category: string) => {
     const data = filteredListContestants.filter(c => c.category === category);
     if (data.length === 0) { showNotification('info', 'No contestants found for this category.'); return; }
     const doc = new jsPDF();
     doc.text(`Export: ${category}`, 14, 20);
     autoTable(doc, { startY: 30, head: [['Name', 'Votes', 'Status']], body: data.map(c => [c.name, c.votes, c.status]) });
     doc.save(`${category}_Export.pdf`);
     showNotification('success', `PDF Exported for ${category}.`);
  };

  // ... (User Mgmt handlers reused from previous) ...
  const handleOpenInvite = () => { setEditingUser(null); setNewUserEmail(''); setNewUserRole('manager'); setIsUserModalOpen(true); };
  const handleEditUser = (user: AdminUser) => { setEditingUser(user); setNewUserEmail(user.email); setNewUserRole(user.role); setIsUserModalOpen(true); };
  
  const handleSaveUser = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if(editingUser) {
      updateAdminUser(editingUser.id, {email: newUserEmail, role: newUserRole}); 
      showNotification('success', 'User role updated.');
    } else {
      inviteAdminUser(newUserEmail, newUserRole); 
      showNotification('success', `Invitation sent to ${newUserEmail}`);
    }
    setIsUserModalOpen(false); 
  };
  
  const handleDeleteUser = (id: string) => { 
    if(confirm("Delete user?")) {
      deleteAdminUser(id); 
      showNotification('success', 'User removed.');
    }
  };
  
  const handleResetPassword = async (id: string) => { 
    setResetStatus(id); 
    await resetAdminUserPassword(id); 
    showNotification('success', "Password reset link sent successfully!"); 
    setResetStatus(null); 
  };
  
  const changeContestStatus = (status: Contest['status']) => { 
    if(activeContest) {
      updateContestStatus(activeContest.id, status);
      showNotification('success', `Contest status changed to: ${status}`);
    }
  };
  
  const handleSaveSchedule = () => { 
    if(activeContest) { 
      // Ensure we save proper ISO strings if using datetime-local inputs
      const safeStartDate = startDate ? new Date(startDate).toISOString() : activeContest.startDate;
      const safeEndDate = endDate ? new Date(endDate).toISOString() : activeContest.endDate;

      updateContest(activeContest.id, {
          startDate: safeStartDate, 
          endDate: safeEndDate
      }); 
      showNotification('success', "Schedule updated successfully! Countdown synchronized."); 
    }
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (newPassword !== confirmPassword) {
      showNotification('error', "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', "Password must be at least 6 characters.");
      return;
    }
    showNotification('success', "Password updated successfully."); 
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-brand-navy text-white pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${adminRole === 'admin' ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' : 'bg-blue-500/20 text-blue-200 border-blue-500/30'}`}>
                {adminRole === 'admin' ? 'Super Admin' : 'Manager Mode'}
              </span>
            </div>
            <p className="text-brand-lightGrey mt-1">Manage contests, participants, and monitor integrity.</p>
          </div>
          <div className="flex gap-2">
              {activeTab === 'users' ? (
                <Button variant="secondary" onClick={handleOpenInvite}>+ Invite User</Button>
              ) : (
                <Button variant="secondary" onClick={handleCreate}>+ New Contestant</Button>
              )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
           {['overview', 'contestants', 'system', 'users', 'monitor', 'account'].map((tab) => {
             // Role Checks
             if (tab === 'users' && adminRole !== 'admin') return null;
             if (tab === 'monitor' && adminRole !== 'admin') return null;

             const icons = { overview: Activity, contestants: Users, system: Server, users: Users, account: UserCog, monitor: Monitor };
             const Icon = icons[tab as keyof typeof icons];
             return (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 capitalize ${activeTab === tab ? 'bg-white text-brand-orange shadow' : 'text-gray-400 hover:text-white'}`}
               >
                 <Icon className="w-4 h-4" /> {tab}
               </button>
             );
           })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
             {/* Collapsible Advanced Filter Panel for Overview */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowOverviewFilters(!showOverviewFilters)}
                >
                    <div className="flex items-center gap-2 text-brand-navy font-bold">
                        <Filter className="w-4 h-4 text-brand-orange" />
                        <span>Filter Options</span>
                        <div className="flex items-center gap-2 ml-4">
                             {overviewCategory !== 'All' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Cat: {overviewCategory}</span>}
                             {overviewTimeRange !== 'all' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Time: {overviewTimeRange}</span>}
                        </div>
                    </div>
                    {showOverviewFilters ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
                
                {showOverviewFilters && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-xs font-medium text-brand-grey mb-1">Category</label>
                            <select 
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-brand-orange focus:border-brand-orange p-2 border"
                                value={overviewCategory}
                                onChange={(e) => setOverviewCategory(e.target.value)}
                            >
                                <option key="All" value="All">All Categories</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-brand-grey mb-1">Time Range (Charts)</label>
                             <select 
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-brand-orange focus:border-brand-orange p-2 border"
                                value={overviewTimeRange}
                                onChange={(e) => setOverviewTimeRange(e.target.value as any)}
                             >
                                <option key="all" value="all">All Time</option>
                                <option key="30d" value="30d">Last 30 Days</option>
                                <option key="7d" value="7d">Last 7 Days</option>
                                <option key="24h" value="24h">Last 24 Hours</option>
                             </select>
                        </div>
                        <div className="md:col-span-2 flex items-end justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleOverviewExportPDF}>
                                <FileText className="w-4 h-4 mr-2" /> Report PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleOverviewExportCSV}>
                                <Download className="w-4 h-4 mr-2" /> Report CSV
                            </Button>
                        </div>
                    </div>
                )}
             </div>

             {/* Metrics Cards */}
             {isLoadingContestants || isLoadingContests ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                 {Array.from({ length: 6 }).map((_, i) => (
                   <SkeletonStats key={i} />
                 ))}
               </div>
             ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                 <Card className="p-4 border-l-4 border-l-blue-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">Total Votes</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">{filteredTotalVotes.toLocaleString()}</p>
                 </Card>
                 <Card className="p-4 border-l-4 border-l-green-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">24h Votes</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">+{votesLast24h}</p>
                 </Card>
                 <Card className="p-4 border-l-4 border-l-orange-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">Active Contests</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">{activeContestsCount}</p>
                 </Card>
                 <Card className="p-4 border-l-4 border-l-purple-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">Filtered Nominees</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">{filteredOverviewContestants.length}</p>
                 </Card>
                 <Card className="p-4 border-l-4 border-l-indigo-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">Avg / Nominee</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">{avgVotesPerNominee}</p>
                 </Card>
                 <Card className="p-4 border-l-4 border-l-teal-500">
                     <p className="text-xs font-medium text-gray-500 uppercase">Growth (24h)</p>
                     <p className="text-xl md:text-2xl font-bold text-brand-navy mt-1">{voteGrowth}%</p>
                 </Card>
             </div>
             )}
             
             {/* Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-4">Vote Trends ({overviewTimeRange === 'all' ? '7 Days' : overviewTimeRange})</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC6822" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#EC6822" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="total" stroke="#EC6822" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-4">Top Nominees</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={voteData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <RechartsTooltip />
                                <Bar dataKey="votes" fill="#062B3F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && adminRole === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* System Health Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 flex items-center justify-between border-l-4 border-l-blue-600">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase">CPU Usage</p>
                            <h3 className="text-2xl font-bold text-brand-navy mt-1">24%</h3>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Stable</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Cpu className="w-6 h-6" /></div>
                    </Card>
                    <Card className="p-6 flex items-center justify-between border-l-4 border-l-purple-600">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase">Memory</p>
                            <h3 className="text-2xl font-bold text-brand-navy mt-1">4.2 GB / 16 GB</h3>
                            <p className="text-xs text-purple-600 mt-1">26% Utilized</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><Zap className="w-6 h-6" /></div>
                    </Card>
                    <Card className="p-6 flex items-center justify-between border-l-4 border-l-orange-600">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase">Storage</p>
                            <h3 className="text-2xl font-bold text-brand-navy mt-1">120 GB</h3>
                            <p className="text-xs text-orange-600 mt-1">65% Free Space</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><HardDrive className="w-6 h-6" /></div>
                    </Card>
                </div>

                {/* Real-time Traffic */}
                <Card className="p-6">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                             <Activity className="w-5 h-5 text-brand-orange" />
                             Real-time Network Traffic
                        </h3>
                        <span className="flex items-center gap-2 text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            LIVE
                        </span>
                     </div>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monitorData.traffic}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="requests" stroke="#062B3F" strokeWidth={2} dot={false} isAnimationActive={true} />
                                <Line type="monotone" dataKey="latency" stroke="#EC6822" strokeWidth={2} dot={false} />
                                <Legend verticalAlign="top" height={36}/>
                            </LineChart>
                        </ResponsiveContainer>
                     </div>
                </Card>

                {/* Service Health & Security Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Services Status */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
                             <Server className="w-5 h-5 text-brand-grey" />
                             Infrastructure Status
                        </h3>
                        <div className="space-y-4">
                            {monitorData.services.map((service, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${service.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            <service.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-brand-navy">{service.name}</p>
                                            <p className="text-xs text-gray-500">Latency: {service.latency}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${service.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'operational' ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                                            {service.status}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Uptime: {service.uptime}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Security Logs */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
                             <ShieldAlert className="w-5 h-5 text-red-500" />
                             Recent Security Events
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-100">
                             <table className="w-full text-left text-sm">
                                 <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                     <tr>
                                         <th className="px-4 py-3">Event</th>
                                         <th className="px-4 py-3">Source IP</th>
                                         <th className="px-4 py-3">Time</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {monitorData.securityLogs.map((log) => (
                                         <tr key={log.id} className="hover:bg-red-50/10">
                                             <td className="px-4 py-3">
                                                 <div className="flex items-center gap-2">
                                                     <div className={`w-1.5 h-1.5 rounded-full ${log.severity === 'high' ? 'bg-red-500' : log.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                                     <span className="font-medium text-brand-navy">{log.type}</span>
                                                 </div>
                                             </td>
                                             <td className="px-4 py-3">
                                                 <div className="font-mono text-xs text-gray-600">{log.ip}</div>
                                                 <div className="text-[10px] text-gray-400">{log.location}</div>
                                             </td>
                                             <td className="px-4 py-3 text-gray-500 text-xs">{log.time}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                        <div className="mt-4 text-center">
                            <Button variant="ghost" size="sm" className="w-full text-brand-grey">View All Security Logs</Button>
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {activeTab === 'contestants' && (
           <div className="space-y-6">
             {/* Collapsible Advanced Filter Panel for Contestants */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowContestantFilters(!showContestantFilters)}
                >
                    <div className="flex items-center gap-2 text-brand-navy font-bold">
                        <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                        <span>Filter & Sort</span>
                        {/* Status Badges for Filter State */}
                        <div className="flex items-center gap-2 ml-4 flex-wrap">
                            {contestantSearch && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Search: &quot;{contestantSearch}&quot;</span>}
                            {contestantStatusFilter !== 'all' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Status: {contestantStatusFilter}</span>}
                            {contestantCategoryFilter !== 'All' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Cat: {contestantCategoryFilter}</span>}
                        </div>
                    </div>
                    {showContestantFilters ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {showContestantFilters && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Search */}
                        <div className="relative">
                             <label className="block text-xs font-medium text-brand-grey mb-1">Search</label>
                             <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Name or Email..." 
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                    value={contestantSearch}
                                    onChange={(e) => setContestantSearch(e.target.value)}
                                />
                             </div>
                        </div>

                        {/* Status */}
                        <div>
                             <label className="block text-xs font-medium text-brand-grey mb-1">Status</label>
                             <select 
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-brand-orange focus:border-brand-orange p-2 border"
                                value={contestantStatusFilter}
                                onChange={(e) => setContestantStatusFilter(e.target.value as any)}
                             >
                                <option key="all" value="all">All Status</option>
                                <option key="active" value="active">Active Only</option>
                                <option key="paused" value="paused">Paused Only</option>
                                <option key="withdrawn" value="withdrawn">Withdrawn Only</option>
                             </select>
                        </div>

                        {/* Category */}
                        <div>
                             <label className="block text-xs font-medium text-brand-grey mb-1">Category</label>
                             <select 
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-brand-orange focus:border-brand-orange p-2 border"
                                value={contestantCategoryFilter}
                                onChange={(e) => setContestantCategoryFilter(e.target.value)}
                             >
                                <option key="All" value="All">All Categories</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                             </select>
                        </div>

                        {/* Sort */}
                        <div>
                             <label className="block text-xs font-medium text-brand-grey mb-1">Sort By</label>
                             <div className="relative">
                                 <ArrowUpDown className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                 <select 
                                    className="w-full pl-9 text-sm border-gray-300 rounded-lg focus:ring-brand-orange focus:border-brand-orange p-2 border"
                                    value={contestantSort}
                                    onChange={(e) => setContestantSort(e.target.value as any)}
                                 >
                                    <option key="votesDesc" value="votesDesc">Votes: High to Low</option>
                                    <option key="votesAsc" value="votesAsc">Votes: Low to High</option>
                                    <option key="nameAsc" value="nameAsc">Name: A to Z</option>
                                 </select>
                             </div>
                        </div>
                    </div>
                )}
             </div>

            {isLoadingContestants ? (
              <SkeletonTable rows={8} />
            ) : displayCategories.length === 0 ? (
               <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-brand-navy">No Matches Found</h3>
                 <p className="text-brand-grey mb-4">Try adjusting your filters.</p>
                 <Button variant="outline" onClick={() => { setContestantSearch(''); setContestantStatusFilter('all'); setContestantCategoryFilter('All'); }}>Clear Filters</Button>
               </div>
            ) : (
                <>
                {displayCategories.map((category: string) => {
                    const categoryContestants: Contestant[] = filteredListContestants.filter(c => c.category === category);
                    if (categoryContestants.length === 0) return null;

                    return (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 px-1">
                                <span className="h-6 w-1.5 bg-brand-orange rounded-full"></span>
                                <h3 className="text-xl font-bold text-brand-navy">{category}</h3>
                                <span className="text-sm font-medium bg-white text-brand-grey px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                                    {categoryContestants.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleExportPDF(category)}
                                    className="text-brand-grey border-gray-300 bg-white"
                                >
                                    <FileText className="w-4 h-4 mr-2" /> PDF
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleExportCSV(category)}
                                    className="text-brand-grey border-gray-300 bg-white"
                                >
                                    <Download className="w-4 h-4 mr-2" /> CSV
                                </Button>
                            </div>
                        </div>
                        
                        <Card className="overflow-hidden border-0 shadow-md ring-1 ring-black/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 text-xs uppercase text-brand-grey font-semibold border-b">
                                <th className="px-6 py-4">Nominee</th>
                                <th className="px-6 py-4 w-32">Status</th>
                                <th className="px-6 py-4 w-24">Votes</th>
                                <th className="px-6 py-4 w-24">Category %</th>
                                <th className="px-6 py-4 w-32">Velocity</th>
                                <th className="px-6 py-4 w-36">Last Vote</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categoryContestants.map(c => {
                                    const metrics = getContestantMetrics(c);
                                    const isWithdrawn = c.status === 'withdrawn';
                                    return (
                                <tr key={c.id} className={`hover:bg-gray-50 transition-colors group ${isWithdrawn ? 'bg-gray-50 opacity-70 grayscale' : 'bg-white'}`}>
                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative group-hover:ring-2 group-hover:ring-brand-orange/20 transition-all">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-brand-navy block">{c.name}</span>
                                            <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">ID: {c.id}</span>
                                        </div>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4">
                                    {isWithdrawn ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                                            Disqualified
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => toggleContestantVisibility(c.id)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase transition-all border ${
                                                c.isVisible 
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.isVisible ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                                            {c.isVisible ? 'Active' : 'Paused'}
                                        </button>
                                    )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-bold text-brand-navy">
                                            {c.votes.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-orange" style={{ width: `${metrics.share}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{metrics.share}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Activity className="w-3 h-3 text-gray-400" />
                                            {metrics.displayVelocity} <span className="text-xs text-gray-400">v/hr</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="truncate max-w-[100px]" title={metrics.lastVoteTime}>{metrics.lastVoteTime}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setViewingStats(c)} className="p-2 text-brand-orange bg-orange-50 hover:bg-orange-100 rounded-lg transition-all" title="Analytics"><BarChart2 className="w-4 h-4" /></button>
                                        <button onClick={() => setPreviewContestant(c)} className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-all" title="Preview"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                        {isWithdrawn ? (
                                             <button onClick={() => handleRestore(c.id, c.name)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Restore"><CheckCircle2 className="w-4 h-4" /></button>
                                        ) : (
                                            <button onClick={() => handleWithdraw(c.id, c.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Withdraw"><Ban className="w-4 h-4" /></button>
                                        )}
                                        {adminRole === 'admin' && (
                                        <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                    </td>
                                </tr>
                                )})}
                            </tbody>
                            </table>
                        </div>
                        </Card>
                    </div>
                    );
                })}
                </>
            )}
           </div>
        )}

        {/* ... (Existing System, Users, Account Tabs, DrillDown Modals, Edit Modals unchanged logic just rendering structure) ... */}
        {activeTab === 'system' && (
            <div className="space-y-6">
                {activeContest && (
                <>
                <Card className="p-6 border-l-4 border-l-brand-orange">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    System Controls
                                </h3>
                                <p className="text-sm text-brand-grey mt-1">Manage global contest state and visibility.</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${activeContest.status === 'active' ? 'bg-green-100 text-green-800' : activeContest.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{activeContest.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant={activeContest.status === 'active' ? 'primary' : 'outline'} onClick={() => changeContestStatus('active')} className="gap-2"><PlayCircle className="w-4 h-4" /> Start</Button>
                                <Button variant={activeContest.status === 'paused' ? 'primary' : 'outline'} onClick={() => changeContestStatus('paused')} className={`gap-2 ${activeContest.status === 'paused' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}><PauseCircle className="w-4 h-4" /> Pause</Button>
                                <Button variant={activeContest.status === 'ended' ? 'primary' : 'outline'} onClick={() => changeContestStatus('ended')} className={`gap-2 ${activeContest.status === 'ended' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}><StopCircle className="w-4 h-4" /> End</Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-brand-orange" />
                        Schedule & Duration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <label className="block text-sm font-bold text-brand-navy mb-2">Voting Opens</label>
                             <div className="relative">
                                <Input 
                                    type="datetime-local" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="pl-10"
                                />
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-brand-grey pointer-events-none" />
                             </div>
                             <p className="text-xs text-brand-grey mt-2">The contest will automatically open for voting at this time.</p>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-brand-navy mb-2">Voting Closes</label>
                             <div className="relative">
                                <Input 
                                    type="datetime-local" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-10"
                                />
                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-brand-grey pointer-events-none" />
                             </div>
                             <p className="text-xs text-brand-grey mt-2">Voting will automatically close and leaderboard will lock.</p>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t pt-4">
                         <Button onClick={handleSaveSchedule} className="w-full md:w-auto">
                            <Save className="w-4 h-4 mr-2" /> Save Schedule
                         </Button>
                    </div>
                </Card>
                </>
             )}
            </div>
        )}
        {activeTab === 'account' && (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-1 flex items-center gap-2"><Lock className="w-5 h-5 text-brand-orange" /> Security Settings</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <Input type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        <Input type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <Input type="password" label="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <Button type="submit">Update Password</Button>
                    </form>
                </Card>
            </div>
        )}
        {activeTab === 'users' && adminRole === 'admin' && (
           <Card className="overflow-hidden border-0 shadow-md ring-1 ring-black/5">
             <div className="p-6 border-b"><h3 className="text-lg font-bold text-brand-navy">Team Management</h3></div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-50/80 text-xs uppercase text-brand-grey font-semibold border-b"><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {adminUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4"><span className="block font-medium text-brand-navy">{user.email}</span></td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                    <button onClick={() => handleResetPassword(user.id)} className="p-2 text-gray-400 hover:text-brand-navy"><KeyRound className="w-4 h-4" /></button>
                                    <button onClick={() => handleEditUser(user)} className="p-2 text-gray-400 hover:text-brand-orange"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
           </Card>
        )}
      </div>

      {/* Drill-Down Stats Modal */}
      <Modal isOpen={!!viewingStats} onClose={() => setViewingStats(null)} title={viewingStats ? `Analytics: ${viewingStats.name}` : 'Analytics'} maxWidth="max-w-5xl">
        {viewingStats && drillDownStats && (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200"><img src={viewingStats.photoUrl} alt="" className="w-full h-full object-cover" /></div>
                    <div><h2 className="text-2xl font-bold text-brand-navy">{viewingStats.name}</h2><p>{viewingStats.votes} Votes</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="p-5 col-span-2"><div className="h-60"><ResponsiveContainer width="100%" height="100%"><LineChart data={drillDownStats.timeSeries}><Line type="monotone" dataKey="votes" stroke="#EC6822" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card>
                    <Card className="p-5"><div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={drillDownStats.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{drillDownStats.devices.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie></PieChart></ResponsiveContainer></div></Card>
                </div>
            </div>
        )}
      </Modal>

      {/* Edit Contestant Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Contestant Details" maxWidth="max-w-4xl">
        {editingContestant && (
          <form onSubmit={handleSaveContestant} className="space-y-6">
             <div className="flex flex-col md:flex-row gap-8">
                {/* LEFT COLUMN: IMAGE */}
                <div className="w-full md:w-1/3 space-y-4">
                   <label className="block text-sm font-medium text-brand-grey">Profile Image</label>
                   {/* Image Preview Area */}
                   <div className="aspect-[3/4] rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden relative group flex items-center justify-center">
                      {editingContestant.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={editingContestant.photoUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            size="sm"
                          >
                            Change Photo
                          </Button>
                      </div>
                   </div>
                   
                   {/* Inputs */}
                   <div className="space-y-3">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <div className="relative">
                          <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input 
                             className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                             value={editingContestant.photoUrl} 
                             onChange={e => setEditingContestant({...editingContestant, photoUrl: e.target.value})} 
                             placeholder="Or paste URL..."
                          />
                      </div>
                      <p className="text-xs text-center text-gray-400">Recommened: 600x800px (Portrait)</p>
                   </div>
                </div>

                {/* RIGHT COLUMN: DETAILS */}
                <div className="flex-1 space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" value={editingContestant.name} onChange={e => setEditingContestant({...editingContestant, name: e.target.value})} required placeholder="e.g. Jane Doe" />
                      <Input label="Email (Private)" value={editingContestant.email} onChange={e => setEditingContestant({...editingContestant, email: e.target.value})} required type="email" placeholder="contact@example.com" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* LinkedIn */}
                      <div>
                          <label className="block text-sm font-medium text-brand-grey mb-1">LinkedIn Profile</label>
                          <div className="relative">
                              <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-[#0077b5]" />
                              <input 
                                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 border-gray-300"
                                  value={editingContestant.linkedinUrl || ''}
                                  onChange={e => setEditingContestant({...editingContestant, linkedinUrl: e.target.value})}
                                  placeholder="https://linkedin.com/in/..."
                              />
                          </div>
                      </div>
                      {/* Contest Select */}
                      <div>
                         <label className="block text-sm font-medium text-brand-grey mb-1">Assigned Contest</label>
                         <div className="relative">
                             <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 bg-white" value={editingContestant.contestId} onChange={e => setEditingContestant({...editingContestant, contestId: e.target.value})}>
                                {contests.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
                             </select>
                         </div>
                      </div>
                   </div>

                   {/* Category */}
                   <div>
                      <label className="block text-sm font-medium text-brand-grey mb-1">Award Category</label>
                      {isCustomCategory ? (
                        <div className="flex gap-2">
                            <Input value={editingContestant.category} onChange={e => setEditingContestant({...editingContestant, category: e.target.value})} required className="flex-1" placeholder="Type new category..." />
                            <button type="button" onClick={() => { setIsCustomCategory(false); setEditingContestant({ ...editingContestant, category: categoryNames[0] || ''}); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                     ) : (
                        <div className="relative">
                            <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 bg-white appearance-none" value={editingContestant.category} onChange={e => { if (e.target.value === '__NEW__') { setIsCustomCategory(true); setEditingContestant({...editingContestant, category: ''}); } else { setEditingContestant({...editingContestant, category: e.target.value}); } }}>
                                {categoryNames.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                                <option key="__NEW__" value="__NEW__" className="font-bold text-brand-orange">+ Add New Category...</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                     )}
                   </div>

                   {/* Bio */}
                   <div>
                      <label className="block text-sm font-medium text-brand-grey mb-1">Biography</label>
                      <div className="relative">
                          <textarea 
                             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 min-h-[140px] resize-y" 
                             value={editingContestant.bio} 
                             onChange={e => setEditingContestant({...editingContestant, bio: e.target.value})} 
                             placeholder="Write a short biography..." 
                          />
                          <button 
                            type="button" 
                            onClick={handleGeminiBio} 
                            disabled={isGeneratingBio} 
                            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium bg-brand-navy text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                          >
                             {isGeneratingBio ? <Wand2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                             Generate with AI
                          </button>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">{contestants.some(c => c.id === editingContestant.id) ? 'Save Changes' : 'Create Contestant'}</Button>
             </div>
          </form>
        )}
      </Modal>

      {/* Invite User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Invite User">
          <form onSubmit={handleSaveUser} className="space-y-6">
              <Input label="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                  <div className={`border p-3 rounded cursor-pointer ${newUserRole === 'manager' ? 'border-brand-orange bg-orange-50' : ''}`} onClick={() => setNewUserRole('manager')}>Manager</div>
                  <div className={`border p-3 rounded cursor-pointer ${newUserRole === 'admin' ? 'border-brand-orange bg-orange-50' : ''}`} onClick={() => setNewUserRole('admin')}>Admin</div>
              </div>
              <Button type="submit" className="w-full">Save</Button>
          </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;