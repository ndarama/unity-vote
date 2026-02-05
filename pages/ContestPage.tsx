'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Search, Trophy, Share2, Linkedin, AlertCircle, User, X, Check, TrendingUp, Lock, Ban } from 'lucide-react';
import { useAppContext } from '../services/AppContext';
import { Button, Card, Input, Modal, MockCaptcha, SkeletonCard } from '../components/UI';
import { VoteStatus, Contestant } from '../types';

export const ContestPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { contests, contestants, castVote, verifyVote, confirmVote: commitVote, isLoadingContests, isLoadingContestants } = useAppContext();
  
  const contest = contests.find(c => c.id === id);
  
  // Check if data is still loading
  const isLoading = isLoadingContests || isLoadingContestants;
  
  // Get all visible contestants for this contest
  const allContestants = contestants.filter(c => c.isVisible && c.contestId === id);
  
  // Split into active and withdrawn
  const activeContestants = allContestants.filter(c => c.status !== 'withdrawn');
  const withdrawnContestants = allContestants.filter(c => c.status === 'withdrawn');

  const [activeTab, setActiveTab] = useState<'contestants' | 'leaderboard'>('contestants');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Voting State
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedContestantId, setSelectedContestantId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>(VoteStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedContestantId, setCopiedContestantId] = useState<string | null>(null);

  // Bio Modal State
  const [viewingContestant, setViewingContestant] = useState<Contestant | null>(null);

  // Initialize search and tab from URL
  useEffect(() => {
    const category = searchParams?.get('category');
    const tab = searchParams?.get('tab');

    if (category) {
      setSearchTerm(category);
    }
    
    if (tab === 'leaderboard') {
      setActiveTab('leaderboard');
    } else {
      setActiveTab('contestants');
    }
  }, [searchParams]);

  if (!contest) return <div className="p-8 text-center">Contest not found</div>;

  const isVotingActive = contest.status === 'active';

  // Apply search filter to both lists
  const filterFn = (c: Contestant) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredActive = activeContestants.filter(filterFn);
  const filteredWithdrawn = withdrawnContestants.filter(filterFn);

  const openVoteModal = (contestantId: string) => {
    if (!isVotingActive) return; // Prevent opening if paused/ended

    // If opening from bio modal, close it first (optional, but cleaner UI)
    setViewingContestant(null);
    
    setSelectedContestantId(contestantId);
    setVoteStatus(VoteStatus.IDLE);
    setEmail('');
    setOtp('');
    setCaptchaVerified(false);
    setErrorMessage('');
    setVoteModalOpen(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setErrorMessage('Please verify you are human.');
      return;
    }
    setVoteStatus(VoteStatus.SENDING_OTP);
    setErrorMessage('');

    const result = await castVote(email, selectedContestantId!, contest.id);
    
    if (result.success) {
      setVoteStatus(VoteStatus.AWAITING_OTP);
    } else {
      setVoteStatus(VoteStatus.ERROR);
      setErrorMessage(result.message);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoteStatus(VoteStatus.VERIFYING);
    
    const isValid = await verifyVote(email, otp);
    
    if (isValid) {
      // Actually commit the vote to global state
      // @ts-ignore - accessing the helper exposed via context
      commitVote(email, selectedContestantId!, contest.id);
      setVoteStatus(VoteStatus.SUCCESS);
    } else {
      setVoteStatus(VoteStatus.AWAITING_OTP); // Go back to input
      setErrorMessage('Invalid code. Please try again (Use 123456).');
    }
  };

  const handleShare = (contestant: Contestant) => {
    // Generate a link that filters for this specific contestant name
    // This uses the existing "category" search param which effectively searches both name and category
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#/contest/${contestant.contestId}?category=${encodeURIComponent(contestant.name)}`;
    
    navigator.clipboard.writeText(url).then(() => {
        setCopiedContestantId(contestant.id);
        setTimeout(() => setCopiedContestantId(null), 2000);
    });
  };

  // Get unique categories for leaderboard grouping
  const uniqueCategories = Array.from(new Set(activeContestants.map(c => c.category).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header - Only visible when not in leaderboard mode */}
      {activeTab === 'contestants' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-3">
                    {contest.title}
                    {contest.status === 'paused' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">Voting Paused</span>}
                    {contest.status === 'ended' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">Ended</span>}
                </h1>
                <p className="text-brand-grey mt-2 max-w-2xl">{contest.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        {activeTab === 'contestants' && (
          <div className="mb-8 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-brand-lightGrey" />
            <input 
              type="text" 
              placeholder="Search contestants or categories..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
               <button 
                 onClick={() => setSearchTerm('')}
                 className="absolute right-3 top-3 text-gray-400 hover:text-brand-navy"
               >
                 <X className="w-5 h-5" />
               </button>
            )}
          </div>
        )}

        {/* Contestants Grid */}
        {activeTab === 'contestants' && (
          <>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredActive.length === 0 && filteredWithdrawn.length === 0 ? (
               <div className="col-span-full text-center py-12 text-brand-grey">
                 No contestants found matching &quot;{searchTerm}&quot;
               </div>
            ) : (
              filteredActive.map(person => (
                <Card key={person.id} className="flex flex-col hover:-translate-y-1 transition-transform duration-300 relative group/card">
                   {/* Share Button */}
                   <button
                        onClick={(e) => {
                             e.stopPropagation(); // prevent card click
                             handleShare(person);
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white text-brand-navy hover:text-brand-orange rounded-full shadow-sm transition-all opacity-0 group-hover/card:opacity-100"
                        title="Copy Link to Contestant"
                    >
                        {copiedContestantId === person.id ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                    </button>

                  <div 
                    className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setViewingContestant(person)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <span className="bg-white/90 text-brand-navy px-4 py-2 rounded-full text-sm font-semibold shadow-lg">View Profile</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider bg-brand-orange/10 px-2 py-1 rounded-full">
                        {person.category}
                      </span>
                      <h3 
                        className="text-xl font-bold text-brand-navy mt-2 cursor-pointer hover:text-brand-orange transition-colors"
                        onClick={() => setViewingContestant(person)}
                      >
                        {person.name}
                      </h3>
                      <p className="text-sm text-brand-grey mt-2 line-clamp-3">{person.bio}</p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setViewingContestant(person)} className="text-brand-navy px-0 hover:bg-transparent hover:text-brand-orange">
                        Read More
                      </Button>
                      <Button 
                         size="sm" 
                         onClick={() => openVoteModal(person.id)}
                         disabled={!isVotingActive}
                         className={!isVotingActive ? "opacity-60 cursor-not-allowed bg-gray-400" : ""}
                      >
                        {isVotingActive ? 'Vote' : <><Lock className="w-3 h-3 mr-1" /> Closed</>}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          )}

          {/* Withdrawn Section */}
          {!isLoading && filteredWithdrawn.length > 0 && (
             <div className="mt-16 border-t border-gray-200 pt-10">
               <div className="flex items-center gap-3 mb-6 opacity-70">
                   <Ban className="w-6 h-6 text-gray-500" />
                   <h2 className="text-2xl font-bold text-gray-600">Withdrawn Nominations</h2>
               </div>
               
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredWithdrawn.map(person => (
                    <Card key={person.id} className="flex flex-col bg-gray-50 border-gray-200 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                       <div className="relative aspect-square overflow-hidden bg-gray-200">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover opacity-80" />
                           <div className="absolute inset-0 flex items-center justify-center">
                               <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20 backdrop-blur-sm shadow-xl">
                                   Withdrawn
                               </span>
                           </div>
                       </div>
                       <div className="p-5 flex-1 flex flex-col">
                           <div className="mb-2">
                               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider border border-gray-200 px-2 py-1 rounded-full">
                                   {person.category}
                               </span>
                               <h3 className="text-lg font-bold text-gray-600 mt-2">{person.name}</h3>
                           </div>
                           <div className="mt-auto pt-4 border-t border-gray-200">
                                <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                  <Ban className="w-3 h-3" /> No longer participating
                                </span>
                           </div>
                       </div>
                    </Card>
                  ))}
               </div>
             </div>
          )}
          </>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-8">
             <div className="text-center mb-10 pt-4">
               <h2 className="text-3xl font-bold text-brand-navy flex items-center justify-center gap-3">
                 <Trophy className="w-8 h-8 text-brand-orange" />
                 Live Rankings
               </h2>
               <p className="text-brand-grey mt-2">Real-time updates. Top candidates for each category.</p>
             </div>

             {uniqueCategories.map(category => {
                const categoryContestants = activeContestants
                  .filter(c => c.category === category)
                  .sort((a, b) => b.votes - a.votes);
                
                const totalCategoryVotes = categoryContestants.reduce((sum, c) => sum + c.votes, 0);
                const maxVotes = categoryContestants[0]?.votes || 1; // Avoid division by zero

                return (
                  <Card key={category} className="overflow-visible border-0 shadow-lg ring-1 ring-gray-100">
                    <div className="bg-gradient-to-r from-brand-navy to-[#0A3D56] text-white p-6 rounded-t-xl flex items-center justify-between shadow-md relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        
                        <div className="relative z-10">
                             <h3 className="text-xl font-bold flex items-center gap-2">
                                {category}
                             </h3>
                             <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                               <TrendingUp className="w-3 h-3" />
                               {totalCategoryVotes.toLocaleString()} votes cast
                             </p>
                        </div>
                        <div className="relative z-10 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Trophy className="w-6 h-6 text-brand-orange" />
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-50 bg-white rounded-b-xl">
                        {categoryContestants.map((person, index) => {
                          const percentageOfTotal = totalCategoryVotes > 0 ? (person.votes / totalCategoryVotes) * 100 : 0;
                          const percentageOfMax = (person.votes / maxVotes) * 100;
                          
                          let rankStyle = "bg-gray-50 text-brand-lightGrey border border-gray-100";
                          let rankLabel = index + 1;
                          
                          if (index === 0) rankStyle = "bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm";
                          if (index === 1) rankStyle = "bg-gray-100 text-slate-700 border border-gray-300 shadow-sm";
                          if (index === 2) rankStyle = "bg-orange-50 text-orange-800 border border-orange-200 shadow-sm";

                          return (
                          <div key={person.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors group relative">
                            <div className="flex items-center gap-4 relative z-10">
                                {/* Rank */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${rankStyle}`}>
                                  {rankLabel}
                                </div>
                                
                                {/* Avatar */}
                                <div 
                                    className="relative w-14 h-14 rounded-full overflow-hidden cursor-pointer shrink-0 border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                                    onClick={() => setViewingContestant(person)}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3 
                                        className="font-bold text-brand-navy truncate cursor-pointer hover:text-brand-orange transition-colors text-lg"
                                        onClick={() => setViewingContestant(person)}
                                    >
                                        {person.name}
                                    </h3>
                                    <div className="text-right">
                                        <span className="block text-xl font-bold text-brand-navy">{person.votes.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Progress Bars */}
                                  <div className="flex items-center gap-3 mt-2">
                                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-gradient-to-r from-brand-orange to-amber-500' : 'bg-brand-navy/60'}`}
                                            style={{ width: `${percentageOfMax}%` }}
                                        />
                                     </div>
                                     <span className="text-xs text-brand-grey font-medium w-12 text-right">{percentageOfTotal.toFixed(1)}%</span>
                                  </div>
                                </div>
                                
                                {/* Vote Button */}
                                <div className="shrink-0 pl-3">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => openVoteModal(person.id)}
                                        disabled={!isVotingActive}
                                        className={`hidden sm:inline-flex border-gray-200 hover:border-brand-orange hover:text-brand-orange ${!isVotingActive ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {isVotingActive ? 'Vote' : 'Closed'}
                                    </Button>
                                    <button 
                                        onClick={() => openVoteModal(person.id)}
                                        disabled={!isVotingActive}
                                        className={`sm:hidden p-2 rounded-full shadow-md ${isVotingActive ? "bg-brand-orange text-white" : "bg-gray-300 text-gray-500"}`}
                                    >
                                        {isVotingActive ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                          </div>
                        )})}
                    </div>
                  </Card>
                );
             })}
          </div>
        )}
      </div>

        {/* Bio Modal */}
        <Modal
          isOpen={!!viewingContestant}
          onClose={() => setViewingContestant(null)}
          maxWidth="max-w-4xl" // Wider modal for split view
          // Omit title to trigger custom headless mode
        >
          {viewingContestant && (
            <div className="flex flex-col md:flex-row bg-white h-full md:min-h-[450px]">
               {/* Left: Full Vertical Image */}
               <div className="w-full md:w-5/12 h-72 md:h-auto relative shrink-0">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={viewingContestant.photoUrl} 
                   alt={viewingContestant.name} 
                   className="absolute inset-0 w-full h-full object-cover" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                 {viewingContestant.status === 'withdrawn' && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                         <span className="text-white text-xl font-bold border-2 border-white px-4 py-2 rounded-lg transform -rotate-12">WITHDRAWN</span>
                     </div>
                 )}
               </div>
               
               {/* Right: Details */}
               <div className="flex-1 p-6 md:p-10 flex flex-col h-full relative">
                  <div className="mb-4 pt-2">
                     <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange/10 px-3 py-1 rounded-full">
                       {viewingContestant.category}
                     </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4 leading-tight">
                    {viewingContestant.name}
                  </h2>
                  
                  <div className="prose prose-sm text-brand-grey mb-8 leading-relaxed">
                    <p>{viewingContestant.bio}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto border-t pt-6">
                    <Button 
                       size="lg" 
                       onClick={() => openVoteModal(viewingContestant.id)} 
                       disabled={!isVotingActive || viewingContestant.status === 'withdrawn'}
                       className={`w-full text-base py-6 shadow-xl shadow-brand-orange/10 ${!isVotingActive || viewingContestant.status === 'withdrawn' ? "opacity-60 cursor-not-allowed bg-gray-400" : ""}`}
                    >
                      {viewingContestant.status === 'withdrawn' 
                        ? "Nomination Withdrawn" 
                        : isVotingActive 
                            ? `Vote for ${viewingContestant.name.split(' ')[0]}` 
                            : "Voting Closed"}
                    </Button>
                    
                    {viewingContestant.linkedinUrl && (
                       <a 
                         href={viewingContestant.linkedinUrl} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="flex items-center justify-center gap-2 text-sm font-medium text-brand-lightGrey hover:text-[#0077b5] transition-colors py-2"
                       >
                         <Linkedin className="w-4 h-4" /> View Professional Profile
                       </a>
                    )}
                  </div>
               </div>
            </div>
          )}
        </Modal>

      {/* Vote Modal */}
      <Modal 
        isOpen={voteModalOpen} 
        onClose={() => setVoteModalOpen(false)}
        title={voteStatus === VoteStatus.SUCCESS ? "Vote Confirmed!" : "Cast Your Vote"}
      >
        {voteStatus === VoteStatus.IDLE || voteStatus === VoteStatus.SENDING_OTP || voteStatus === VoteStatus.ERROR ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-brand-grey">Enter your email to verify your vote. We&apos;ll send you a secure One-Time Password.</p>
            <Input 
              type="email" 
              label="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
            <MockCaptcha onVerify={setCaptchaVerified} />
            
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={voteStatus === VoteStatus.SENDING_OTP}>
              Send Verification Code
            </Button>
          </form>
        ) : voteStatus === VoteStatus.AWAITING_OTP || voteStatus === VoteStatus.VERIFYING ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
             <div className="text-center mb-4">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                 <Search className="w-6 h-6" /> {/* Icon placeholder for Mail */}
               </div>
               <h4 className="font-bold text-brand-navy">Check your email</h4>
               <p className="text-sm text-brand-grey">We sent a code to <span className="font-semibold">{email}</span></p>
               <p className="text-xs text-gray-400 mt-1">(Use code 123456 for demo)</p>
             </div>
             <Input 
               type="text" 
               label="Verification Code" 
               value={otp} 
               onChange={e => setOtp(e.target.value)} 
               placeholder="123456"
               className="text-center text-2xl tracking-widest font-mono uppercase"
               maxLength={6}
             />
             
             {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

             <Button type="submit" className="w-full" isLoading={voteStatus === VoteStatus.VERIFYING}>
               Confirm Vote
             </Button>
             <button 
                type="button" 
                onClick={() => setVoteStatus(VoteStatus.IDLE)}
                className="w-full text-sm text-brand-lightGrey hover:text-brand-navy mt-2 underline"
             >
               Change Email
             </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Trophy className="w-8 h-8" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-brand-navy">Thank you!</h3>
               <p className="text-brand-grey">Your vote has been securely recorded.</p>
             </div>
             <Button onClick={() => setVoteModalOpen(false)} className="w-full">
               Close
             </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContestPage;


