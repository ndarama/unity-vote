'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Layers, Calendar, Clock, Share2, Check } from 'lucide-react';
import { useAppContext } from '../services/AppContext';
import { Button, SkeletonCategory } from '../components/UI';
import { format } from 'date-fns';

export const Home: React.FC = () => {
  const { contests, contestants, isLoadingContests, isLoadingContestants } = useAppContext();
  const router = useRouter();
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  // Use the first active/upcoming contest for hero display
  const activeContest = contests[0];

  // Check if data is still loading
  const isLoading = isLoadingContests || isLoadingContestants;

  // Extract unique categories across all contests
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; contestId: string; contestTitle: string; count: number; image: string }>();
    
    contestants.forEach(c => {
      const contest = contests.find(ctx => ctx.id === c.contestId);
      if (!contest || !c.isVisible) return;
      
      const key = `${c.contestId}-${c.category}`;
      if (!map.has(key)) {
        map.set(key, {
          name: c.category,
          contestId: c.contestId,
          contestTitle: contest.title,
          count: 0,
          image: c.photoUrl // Use the first found contestant image as the category thumbnail
        });
      }
      const cat = map.get(key)!;
      cat.count++;
    });

    return Array.from(map.values());
  }, [contestants, contests]);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timerLabel, setTimerLabel] = useState("Loading...");

  useEffect(() => {
    if (!activeContest) return;

    const startDate = new Date(activeContest.startDate);
    const endDate = new Date(activeContest.endDate);
    
    const calculateTime = () => {
      const now = new Date();
      let target: Date;
      let label = "";

      if (now < startDate) {
         target = startDate;
         label = "Voting Opens In";
      } else if (now >= startDate && now < endDate) {
         target = endDate;
         label = "Voting Closes In";
      } else {
         // Ended
         setTimerLabel("Voting Ended");
         return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setTimerLabel(label);

      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeContest]);

  const handleShare = (e: React.MouseEvent, contestId: string, categoryName: string) => {
    e.stopPropagation();
    // Construct URL that filters by this category
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#/contest/${contestId}?category=${encodeURIComponent(categoryName)}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCategory(categoryName);
      setTimeout(() => setCopiedCategory(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Hero Section */}
      <div className="relative bg-brand-navy py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Cover Image Background */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={activeContest?.bannerUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2000"} 
            alt="Unity Summit Stage" 
            className="w-full h-full object-cover opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/80 to-brand-navy/50"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/20 text-brand-orange text-sm font-bold tracking-wider mb-6 border border-brand-orange/30 backdrop-blur-sm">
             OFFICIAL VOTING PORTAL
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg uppercase">
            {activeContest?.title || "Unity Summit & Awards 2026"}
          </h1>
          <p className="text-lg md:text-xl text-brand-lightGrey mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            {activeContest?.description || "Celebrate the changemakers. Honor the bridge-builders."}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => router.push('/guide')} className="shadow-lg shadow-brand-orange/20">
              Read More
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-6 h-6 text-brand-orange" />
          <h2 className="text-2xl font-bold text-brand-navy">Browse by Award Category</h2>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCategory key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div 
              key={`${cat.contestId}-${cat.name}`}
              onClick={() => router.push(`/contest/${cat.contestId}?category=${encodeURIComponent(cat.name)}`)}
              className="cursor-pointer group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                {/* Share Button */}
                <button
                    onClick={(e) => handleShare(e, cat.contestId, cat.name)}
                    className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-white text-brand-navy hover:text-brand-orange rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    title="Copy Category Link"
                >
                    {copiedCategory === cat.name ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-brand-navy/0 transition-colors z-10"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">{cat.count} Nominees</span>
                    <Tag className="w-4 h-4 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{cat.name}</h3>
                </div>
                <p className="text-xs text-brand-grey mt-4 truncate">{cat.contestTitle}</p>
              </div>
            </div>
          ))}

          {/* Event Date & Countdown Card */}
          <div className="relative overflow-hidden rounded-xl shadow-sm border border-brand-navy/10 bg-brand-navy text-white flex flex-col">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="p-6 flex-1 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-2 text-brand-orange mb-2">
                 <Calendar className="w-5 h-5" />
                 <span className="font-bold tracking-wider text-sm uppercase">Event Timeline</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Grand Ceremony</h3>
              <p className="text-gray-300 mb-6">
                {activeContest?.endDate 
                   ? format(new Date(activeContest.endDate), "MMMM do, yyyy") 
                   : "Date TBA"}
              </p>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                  <span className="block text-xl font-bold text-brand-orange">{timeLeft.days}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Days</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                  <span className="block text-xl font-bold text-brand-orange">{timeLeft.hours}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Hrs</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                  <span className="block text-xl font-bold text-brand-orange">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Min</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                  <span className="block text-xl font-bold text-brand-orange">{timeLeft.seconds}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Sec</span>
                </div>
              </div>
            </div>
            <div className="bg-brand-orange/10 p-3 text-center border-t border-white/10">
               <span className="text-xs font-medium text-brand-orange flex items-center justify-center gap-2 uppercase tracking-wide">
                 <Clock className="w-4 h-4" /> {timerLabel}
               </span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Home;