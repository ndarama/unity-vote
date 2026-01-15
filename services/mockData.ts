import { Contest, Contestant } from '../types';

export const INITIAL_CONTESTS: Contest[] = [
  {
    id: 'c1',
    title: 'Unity Summit & Awards 2026',
    description: 'Celebrating the voices, bridge-builders, and future leaders shaping our diverse community.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2000',
  }
];

export const INITIAL_CONTESTANTS: Contestant[] = [
  {
    id: 'p1',
    name: 'Sarah Chen',
    category: 'Brobyggerprisen 2026',
    bio: 'Har arbeidet utrettelig for å skape dialog og forståelse på tvers av kulturelle og religiøse skillelinjer i bydelen.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    votes: 1240,
    isVisible: true,
    status: 'active',
    email: 'sarah.chen@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p2',
    name: 'Marcus Johnson',
    category: 'Inkluderingsprisen 2026',
    bio: 'Startet et idrettslag som er tilrettelagt for alle barn, uavhengig av funksjonsevne, med fokus på mestring og glede.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    votes: 985,
    isVisible: true,
    status: 'active',
    email: 'marcus.j@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p3',
    name: 'Elena Rodriguez',
    category: 'Fremtidens stemme 2026',
    bio: 'En ung samfunnsdebattant som har løftet viktige spørsmål om klima og byutvikling inn i den nasjonale debatten.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    votes: 1567,
    isVisible: true,
    status: 'active',
    email: 'elena.r@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p4',
    name: 'Erik Johansen',
    category: 'Kommunikasjonskraft 2026',
    bio: 'Gjør tungt fagstoff tilgjengelig og engasjerende gjennom sin innovative bruk av sosiale medier og podcasts.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    votes: 850,
    isVisible: true,
    status: 'active',
    email: 'erik.j@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p5',
    name: 'Maria Olsen',
    category: 'Gjennomslagskraft 2026',
    bio: 'Fikk gjennomslag for en lovendring som sikrer bedre rettigheter for frilansere i kultursektoren.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    votes: 1120,
    isVisible: true,
    status: 'active',
    email: 'maria.o@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p6',
    name: 'Ahmed Hassan',
    category: 'Brobyggerprisen 2026',
    bio: 'Organiserer nabolagsmiddager som bringer sammen mennesker fra alle generasjoner og bakgrunner.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    votes: 720,
    isVisible: true,
    status: 'active',
    email: 'ahmed.h@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p7',
    name: 'Sofie Nilsen',
    category: 'Inkluderingsprisen 2026',
    bio: 'Har skapt en arbeidsplass som aktivt rekrutterer og tilrettelegger for mennesker med hull i CV-en.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    votes: 600,
    isVisible: true,
    status: 'active',
    email: 'sofie.n@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  },
  {
    id: 'p8',
    name: 'Lars Berg',
    category: 'Fremtidens stemme 2026',
    bio: 'Utviklet en app som hjelper unge med å finne lærlingplasser, og taler ungdommens sak i fylkestinget.',
    photoUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=400',
    votes: 930,
    isVisible: true,
    status: 'active',
    email: 'lars.b@example.com',
    linkedinUrl: '#',
    contestId: 'c1'
  }
];