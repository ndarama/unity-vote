'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vote, ShieldCheck, LogOut, Trophy, Home, LayoutGrid } from 'lucide-react';
import { useAppContext } from '@/services/AppContext';
import { Button } from './UI';

export const Navbar: React.FC = () => {
  const { adminRole, logoutAdmin, contests } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleAdminClick = () => {
    if (adminRole) {
      router.push('/admin');
    } else {
      router.push('/admin/login');
    }
  };

  // Assume the first contest is the main featured one for the navbar shortcut
  const mainContestId = contests.length > 0 ? contests[0].id : null;

  const isLinkActive = (path: string, queryCheck?: string) => {
    if (queryCheck) {
      return pathname === path;
    }
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-navy/95 backdrop-blur-md text-white shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 group-hover:shadow-brand-orange/50">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight group-hover:text-brand-orange transition-colors hidden sm:block">Unity Vote</span>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center gap-4 md:gap-8 bg-white/5 px-4 md:px-8 py-2.5 rounded-full border border-white/5 backdrop-blur-sm mx-2 md:mx-4">
            <Link href="/" className={`flex items-center gap-2 text-base md:text-lg font-bold transition-all duration-200 ${isLinkActive('/') ? 'text-brand-orange' : 'text-gray-300 hover:text-white'}`}>
              <Home className={`w-5 h-5 ${isLinkActive('/') ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="hidden md:inline">Contests</span>
            </Link>

            {mainContestId && (
              <>
                <div className="w-px h-5 bg-white/10 hidden md:block"></div>
                <Link 
                  href={`/contest/${mainContestId}?tab=leaderboard`}
                  className={`flex items-center gap-2 text-base md:text-lg font-bold transition-all duration-200 ${isLinkActive(`/contest/${mainContestId}`, 'tab=leaderboard') ? 'text-brand-orange' : 'text-gray-300 hover:text-white'}`}
                >
                  <Trophy className={`w-5 h-5 ${isLinkActive(`/contest/${mainContestId}`, 'tab=leaderboard') ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="hidden md:inline">Leaderboard</span>
                </Link>
              </>
            )}
          </div>
            
          {/* Right Side Actions */}
          <div className="flex items-center gap-5 shrink-0">
            {adminRole ? (
              <div className="flex items-center gap-6">
                 <Link href="/admin" className={`flex items-center gap-2 text-lg font-bold hover:text-brand-orange transition-colors ${pathname.startsWith('/admin') ? 'text-brand-orange' : 'text-gray-300'}`}>
                  <LayoutGrid className="w-5 h-5" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>
                <Button variant="ghost" onClick={logoutAdmin} className="text-gray-300 hover:text-white hover:bg-white/10 text-base font-semibold">
                  <LogOut className="w-5 h-5 mr-2" />
                  <span className="hidden lg:inline">Exit</span>
                </Button>
              </div>
            ) : (
              <button 
                onClick={handleAdminClick}
                className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl text-sm md:text-base font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="hidden md:inline">Admin Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
