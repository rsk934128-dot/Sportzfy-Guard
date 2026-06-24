import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Award, 
  Zap, 
  Users, 
  BarChart2, 
  Sun, 
  Moon, 
  CloudRain, 
  Volume2, 
  Play, 
  ArrowRight, 
  History, 
  Sparkles, 
  Table,
  Sliders,
  Tv,
  Clock,
  Shield,
  Search,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Match } from '../types';

interface TournamentCommandCenterProps {
  language: 'EN' | 'BN';
  onAddLog: (log: any) => void;
}

// Interfaces for local mock tournament data
interface BracketMatch {
  id: string;
  stage: string;
  teamA: { name: string; logo: string; score?: string; isWinner?: boolean };
  teamB: { name: string; logo: string; score?: string; isWinner?: boolean };
  status: 'live' | 'upcoming' | 'finished';
  time?: string;
  prediction?: string;
  bengaliPrediction?: string;
  winProbA: number; // probability of team A winning
}

interface StandingTeam {
  rank: number;
  name: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number; // goal difference
  points: number;
  form: string[]; // e.g. ['W', 'D', 'W', 'W', 'L']
}

interface MotmArchiveEntry {
  id: string;
  matchName: string;
  bengaliMatchName: string;
  player: string;
  team: string;
  logo: string;
  rating: number;
  position: string;
  bengaliPosition: string;
  narrative: string;
  bengaliNarrative: string;
}

export default function TournamentCommandCenter({ language, onAddLog }: TournamentCommandCenterProps) {
  const [activeTab, setActiveTab] = useState<'brackets' | 'standings' | 'predictions' | 'atmosphere'>('brackets');
  
  // Stadium Visual Adjustments
  const [stadiumLighting, setStadiumLighting] = useState<'day' | 'golden' | 'night' | 'neon'>('night');
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'rain' | 'fog'>('clear');
  const [homeBias, setHomeBias] = useState<number>(60); // Percentage home team volume/intensity bias
  const [crowdIntensity, setCrowdIntensity] = useState<number>(75); // General crowd intensity
  const [tickerMessage, setTickerMessage] = useState<string>('SPORTZFY DIGITAL TOURNAMENT TICKER - INTERACTIVE LIVE OBSERVABILITY ACTIVATED');
  const [selectedPredictionMatch, setSelectedPredictionMatch] = useState<string>('b1');

  // Interactive Live Bracket Data State
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([
    // Quarter-Finals
    {
      id: 'q1',
      stage: 'Quarter-Final 1',
      teamA: { name: 'Real Madrid', logo: '👑', score: '3', isWinner: true },
      teamB: { name: 'Chelsea', logo: '🦁', score: '1', isWinner: false },
      status: 'finished',
      time: 'FT',
      winProbA: 70
    },
    {
      id: 'q2',
      stage: 'Quarter-Final 2',
      teamA: { name: 'Manchester City', logo: '🩵', score: '4', isWinner: true },
      teamB: { name: 'Bayern Munich', logo: '🔴', score: '2', isWinner: false },
      status: 'finished',
      time: 'FT',
      winProbA: 65
    },
    {
      id: 'q3',
      stage: 'Quarter-Final 3',
      teamA: { name: 'PSG', logo: '🗼', score: '1', isWinner: false },
      teamB: { name: 'Barcelona', logo: '🔵🔴', score: '2', isWinner: true },
      status: 'finished',
      time: 'FT',
      winProbA: 45
    },
    {
      id: 'q4',
      stage: 'Quarter-Final 4',
      teamA: { name: 'Arsenal', logo: '🔴⚪', score: '0', isWinner: false },
      teamB: { name: 'Liverpool', logo: '🔴🦁', score: '1', isWinner: true },
      status: 'finished',
      time: 'FT',
      winProbA: 52
    },
    // Semi-Finals
    {
      id: 's1',
      stage: 'Semi-Final 1',
      teamA: { name: 'Real Madrid', logo: '👑', score: '2' },
      teamB: { name: 'Manchester City', logo: '🩵', score: '2' },
      status: 'live',
      time: "82'",
      prediction: 'Intense tactical battlefield. Real Madrid utilizing deep defensive block with explosive counter-attacks via Vinicius, while City holds 64% possession command.',
      bengaliPrediction: 'তীব্র কৌশলগত লড়াই। রিয়াল মাদ্রিদ ভিনিসিয়াসের মাধ্যমে ক্ষিপ্র কাউন্টার অ্যাটাক করছে, বিপরীতে সিটি ৬৪% বল পজিশন ধরে রেখে খেলছে।',
      winProbA: 48
    },
    {
      id: 's2',
      stage: 'Semi-Final 2',
      teamA: { name: 'Barcelona', logo: '🔵🔴', score: undefined },
      teamB: { name: 'Liverpool', logo: '🔴🦁', score: undefined },
      status: 'upcoming',
      time: 'Tomorrow 20:00',
      prediction: 'El Clasico of European-English rivalries. Barcelona key relies on midfield tempo dictation. Liverpool counter-press remains lethal.',
      bengaliPrediction: 'ইউরোপীয়-ইংলিশ হাইপড দ্বৈরথ। বার্সেলোনার ভরসা মিডফিল্ড টেম্পো নিয়ন্ত্রণ, বিপরীতে লিভারপুলের কাউন্টার-প্রেস অত্যন্ত বিপজ্জনক।',
      winProbA: 51
    },
    // Finals
    {
      id: 'f1',
      stage: 'Grand Final',
      teamA: { name: 'TBD (Semi 1 Winner)', logo: '🏆', score: undefined },
      teamB: { name: 'TBD (Semi 2 Winner)', logo: '🏆', score: undefined },
      status: 'upcoming',
      time: 'Jun 28, 21:00',
      prediction: 'The ultimate showcase. Anticipating high physical intensity and razor-thin tactical margins.',
      bengaliPrediction: 'চূড়ান্ত মহারণ। তীব্র শারীরিক লড়াই এবং অতি ক্ষুদ্র কৌশলগত পার্থক্যে ম্যাচের ভাগ্য নির্ধারিত হবে।',
      winProbA: 50
    }
  ]);

  // Live Standings Data State
  const standingsData: StandingTeam[] = [
    { rank: 1, name: 'Manchester City', logo: '🩵', played: 34, won: 26, drawn: 5, lost: 3, gd: 54, points: 83, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, name: 'Arsenal', logo: '🔴⚪', played: 34, won: 24, drawn: 5, lost: 5, gd: 48, points: 77, form: ['W', 'L', 'W', 'W', 'W'] },
    { rank: 3, name: 'Liverpool', logo: '🔴🦁', played: 34, won: 22, drawn: 8, lost: 4, gd: 41, points: 74, form: ['D', 'W', 'L', 'W', 'W'] },
    { rank: 4, name: 'Aston Villa', logo: '🦁🔴', played: 34, won: 20, drawn: 6, lost: 8, gd: 21, points: 66, form: ['W', 'D', 'W', 'L', 'D'] },
    { rank: 5, name: 'Tottenham Hotspur', logo: '⚪🐓', played: 33, won: 18, drawn: 6, lost: 9, gd: 16, points: 60, form: ['L', 'W', 'D', 'W', 'L'] },
    { rank: 6, name: 'Newcastle United', logo: '⚫⚪', played: 33, won: 15, drawn: 5, lost: 13, gd: 12, points: 50, form: ['W', 'W', 'D', 'L', 'W'] }
  ];

  // MOTM Archive State
  const motmArchive: MotmArchiveEntry[] = [
    {
      id: 'm1',
      matchName: 'Real Madrid vs Chelsea (3-1)',
      bengaliMatchName: 'রিয়াল মাদ্রিদ বনাম চেলসি (৩-১)',
      player: 'Vinicius Jr.',
      team: 'Real Madrid',
      logo: '👑',
      rating: 9.4,
      position: 'Forward',
      bengaliPosition: 'ফরোয়ার্ড',
      narrative: 'Exploited transition spaces with blazing pace, claiming a magnificent brace and providing the assist for Benzema’s header.',
      bengaliNarrative: 'বিধ্বংসী গতিতে আক্রমণভাগে ত্রাস সৃষ্টি করেন, দুটি দুর্দান্ত গোল করার পাশাপাশি বেনজেমার হেডার গোলের অ্যাসিস্টও করেন।'
    },
    {
      id: 'm2',
      matchName: 'Manchester City vs Bayern (4-2)',
      bengaliMatchName: 'ম্যান সিটি বনাম বায়ার্ন (৪-২)',
      player: 'Erling Haaland',
      team: 'Manchester City',
      logo: '🩵',
      rating: 9.6,
      position: 'Striker',
      bengaliPosition: 'স্ট্রাইকার',
      narrative: 'Absolute physical masterclass in the box. Registered a perfect hat-trick and completed 92% of high-pressure forward link passes.',
      bengaliNarrative: 'ডি-বক্সে অদম্য শারীরিক শক্তির প্রদর্শনী। একটি নিখুঁত হ্যাটট্রিক করেন এবং হাই-প্রেসার পরিস্থিতিতে ৯২% নিখুঁত লিঙ্ক পাস দেন।'
    },
    {
      id: 'm3',
      matchName: 'PSG vs Barcelona (1-2)',
      bengaliMatchName: 'পিএসজি বনাম বার্সেলোনা (১-২)',
      player: 'Robert Lewandowski',
      team: 'Barcelona',
      logo: '🔵🔴',
      rating: 8.8,
      position: 'Striker',
      bengaliPosition: 'স্ট্রাইকার',
      narrative: 'Expert target-man play. Scored the match-winning header in the 78th minute and created three clear-cut big chances.',
      bengaliNarrative: 'টার্গেট ম্যান হিসেবে দারুণ নৈপুণ্য। ৭৮তম মিনিটে দলের জয়সূচক হেডার গোল করেন এবং ৩টি সুবর্ণ সুযোগ তৈরি করেন।'
    }
  ];

  // Simulated live updates for Semi-Final 1 score
  useEffect(() => {
    const interval = setInterval(() => {
      setBracketMatches(prev => prev.map(m => {
        if (m.id === 's1' && m.status === 'live') {
          const scoreA = parseInt(m.teamA.score || '2');
          const scoreB = parseInt(m.teamB.score || '2');
          const isGoal = Math.random() > 0.90; // 10% chance to score
          if (isGoal) {
            const isA = Math.random() > 0.5;
            const nextScoreA = isA ? scoreA + 1 : scoreA;
            const nextScoreB = !isA ? scoreB + 1 : scoreB;
            
            // Trigger beautiful system log
            onAddLog({
              id: `live-goal-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'info',
              message: `[Tournament Command Center] GOAL in Semi-Final 1! ${m.teamA.name} ${nextScoreA} - ${nextScoreB} ${m.teamB.name}`,
              bengaliMsg: `[টুর্নামেন্ট কন্ট্রোল সেন্টার] সেমিফাইনাল ১-এ গোল! ${m.teamA.name} ${nextScoreA} - ${nextScoreB} ${m.teamB.name}`,
              severity: 'success'
            });

            // Trigger score ticker update
            setTickerMessage(`⚽ GOAL! SEMI-FINAL 1 UPDATED: ${m.teamA.name} ${nextScoreA} - ${nextScoreB} ${m.teamB.name} ⚽ LIVE IN PLAY SCREEN`);

            return {
              ...m,
              teamA: { ...m.teamA, score: nextScoreA.toString() },
              teamB: { ...m.teamB, score: nextScoreB.toString() }
            };
          }
        }
        return m;
      }));
    }, 9000);

    return () => clearInterval(interval);
  }, [onAddLog]);

  // Lighting classes mapped to selected visual state
  const getLightingStyle = () => {
    switch (stadiumLighting) {
      case 'day': return 'bg-gradient-to-b from-sky-400/10 via-slate-950 to-slate-950 border-sky-400/20';
      case 'golden': return 'bg-gradient-to-b from-amber-500/10 via-slate-950 to-slate-950 border-amber-500/20';
      case 'neon': return 'bg-gradient-to-b from-fuchsia-600/15 via-slate-950 to-slate-950 border-fuchsia-500/30';
      case 'night':
      default:
        return 'bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 border-slate-800';
    }
  };

  const selectedPredMatch = bracketMatches.find(m => m.id === selectedPredictionMatch) || bracketMatches[4];

  return (
    <div 
      id="tournament-command-center" 
      className={`rounded-3xl border p-6 transition-all duration-500 ${getLightingStyle()}`}
    >
      {/* HEADER WITH INTEGRATED BRANDING & REALTIME LIGHTING CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 animate-pulse">
            <Trophy className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
                {language === 'EN' ? 'Tournament Command Center' : 'টুর্নামেন্ট কমান্ড সেন্টার'}
              </h2>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                {language === 'EN' ? 'Orchestrated Live' : 'লাইভ নিয়ন্ত্রিত'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'EN' ? 'Unified sports simulation dashboard & stadium atmosphere system' : 'স্পোর্টস সিমুলেশন ড্যাশবোর্ড ও স্টেডিয়াম পরিবেশ নিয়ন্ত্রণ হাব'}
            </p>
          </div>
        </div>

        {/* RECTIVE ATMOSPHERE STATUS CONTROLS */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              setStadiumLighting('day');
              onAddLog({ id: `light-day`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Stadium illumination: Afternoon Sunshine Mode preset.', bengaliMsg: 'স্টেডিয়াম লাইটিং: বিকেলের রোদ মোড প্রিসেট সক্রিয়।', severity: 'info' });
            }}
            className={`p-2 rounded-xl transition ${stadiumLighting === 'day' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            title="Afternoon Sun"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setStadiumLighting('golden');
              onAddLog({ id: `light-golden`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Stadium illumination: Golden Sunset Mode preset.', bengaliMsg: 'স্টেডিয়াম লাইটিং: গোধূলি সূর্যাস্ত মোড প্রিসেট সক্রিয়।', severity: 'info' });
            }}
            className={`p-2 rounded-xl transition ${stadiumLighting === 'golden' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            title="Golden Sunset"
          >
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={() => {
              setStadiumLighting('night');
              onAddLog({ id: `light-night`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Stadium illumination: High-intensity Floodlights Night Mode.', bengaliMsg: 'স্টেডিয়াম লাইটিং: হাই-ইনটেনসিটি ফ্লাডলাইট নাইট মোড সক্রিয়।', severity: 'info' });
            }}
            className={`p-2 rounded-xl transition ${stadiumLighting === 'night' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            title="Floodlight Night"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setStadiumLighting('neon');
              onAddLog({ id: `light-neon`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Stadium illumination: Cosmic Neon Arena preset.', bengaliMsg: 'স্টেডিয়াম লাইটিং: কসমিক নিয়ন এরিনা প্রিসেট সক্রিয়।', severity: 'info' });
            }}
            className={`p-2 rounded-xl transition ${stadiumLighting === 'neon' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            title="Cosmic Neon"
          >
            <Zap className="w-4 h-4 text-fuchsia-400" />
          </button>
        </div>
      </div>

      {/* DYNAMIC SCROLLING SPORTS TICKER TAPE */}
      <div className="bg-slate-950 border border-slate-900 px-4 py-2 mt-4 rounded-xl overflow-hidden flex items-center gap-3">
        <span className="text-[9px] font-mono font-black text-rose-500 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded shrink-0 animate-pulse uppercase">
          {language === 'EN' ? 'LIVE TICKER' : 'লাইভ টিকার'}
        </span>
        <div className="flex-1 overflow-hidden relative">
          <div className="whitespace-nowrap inline-block animate-marquee font-mono text-[10px] text-indigo-400 font-semibold tracking-wider">
            {tickerMessage} • {language === 'EN' ? 'SEMI-FINAL 1 UPDATE:' : 'সেমি-ফাইনাল ১ লাইভ স্কোর:'} Real Madrid {bracketMatches[4].teamA.score} - {bracketMatches[4].teamB.score} Manchester City (In play) • AI prediction indicates a high probability of extra-time climax.
          </div>
        </div>
      </div>

      {/* PRIMARY ORCHESTRATION TABS */}
      <div className="flex flex-wrap items-center gap-2 mt-5">
        <button
          onClick={() => setActiveTab('brackets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'brackets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{language === 'EN' ? 'Championship Bracket' : 'চ্যাম্পিয়নশিপ ব্র্যাকেট'}</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'standings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>{language === 'EN' ? 'League Standings' : 'লীগ পয়েন্ট টেবিল'}</span>
        </button>

        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'predictions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{language === 'EN' ? 'AI Tactical Predictions' : 'এআই ট্যাকটিক্যাল প্রেডিকশন'}</span>
        </button>

        <button
          onClick={() => setActiveTab('atmosphere')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'atmosphere' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'EN' ? 'Stadium Atmosphere' : 'স্টেডিয়াম পরিবেশ নিয়ন্ত্রণ'}</span>
        </button>
      </div>

      {/* VIEWPORT AREA */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BRACKET STAGE DISPLAY */}
          {activeTab === 'brackets' && (
            <motion.div
              key="brackets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">
                
                {/* Column 1: Quarter Finals */}
                <div className="space-y-4">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 pb-1 border-b border-slate-900">
                    {language === 'EN' ? 'Quarter-Finals (FT)' : 'কোয়ার্টার-ফাইনাল (সমাপ্ত)'}
                  </div>
                  {bracketMatches.filter(m => m.stage.startsWith('Quarter')).map(m => (
                    <div 
                      key={m.id} 
                      className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 relative group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>{m.stage}</span>
                        <span className="text-slate-400 font-bold">{m.time}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className={`flex justify-between items-center text-xs ${m.teamA.isWinner ? 'font-bold text-slate-200' : 'text-slate-500 line-through'}`}>
                          <span className="flex items-center gap-1.5"><span>{m.teamA.logo}</span>{m.teamA.name}</span>
                          <span className="font-mono">{m.teamA.score}</span>
                        </div>
                        <div className={`flex justify-between items-center text-xs ${m.teamB.isWinner ? 'font-bold text-slate-200' : 'text-slate-500 line-through'}`}>
                          <span className="flex items-center gap-1.5"><span>{m.teamB.logo}</span>{m.teamB.name}</span>
                          <span className="font-mono">{m.teamB.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Semi Finals */}
                <div className="space-y-6">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 pb-1 border-b border-slate-900">
                    {language === 'EN' ? 'Semi-Finals (In Play)' : 'সেমি-ফাইনাল (চলমান)'}
                  </div>
                  
                  {/* Semi Final 1 (Live) */}
                  <div className="p-4 bg-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-500/5 rounded-2xl space-y-3 relative group hover:border-indigo-500/70 transition">
                    <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[8px] bg-rose-500/15 text-rose-400 border border-rose-500/20 font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                      <span>{language === 'EN' ? 'LIVE' : 'লাইভ'} {bracketMatches[4].time}</span>
                    </div>

                    <div className="text-[9px] font-mono text-indigo-400 font-bold uppercase">
                      {bracketMatches[4].stage}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>{bracketMatches[4].teamA.logo}</span>
                          {bracketMatches[4].teamA.name}
                        </span>
                        <span className="font-mono font-black text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{bracketMatches[4].teamA.score}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>{bracketMatches[4].teamB.logo}</span>
                          {bracketMatches[4].teamB.name}
                        </span>
                        <span className="font-mono font-black text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{bracketMatches[4].teamB.score}</span>
                      </div>
                    </div>

                    {/* AI Probability Bar */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-800">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Win Prob: {bracketMatches[4].winProbA}%</span>
                        <span>{100 - bracketMatches[4].winProbA}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${bracketMatches[4].winProbA}%` }}></div>
                        <div className="bg-indigo-400/30 h-full flex-1"></div>
                      </div>
                    </div>
                  </div>

                  {/* Semi Final 2 (Upcoming) */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 relative group hover:border-slate-700 transition">
                    <div className="text-[9px] font-mono text-slate-500 flex justify-between items-center">
                      <span>{bracketMatches[5].stage}</span>
                      <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 text-[8px] font-semibold">{bracketMatches[5].time}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{bracketMatches[5].teamA.logo}</span>
                          {bracketMatches[5].teamA.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">vs</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{bracketMatches[5].teamB.logo}</span>
                          {bracketMatches[5].teamB.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">vs</span>
                      </div>
                    </div>

                    {/* Quick prediction prediction toggle button */}
                    <button
                      onClick={() => {
                        setSelectedPredictionMatch('s2');
                        setActiveTab('predictions');
                        onAddLog({ id: `pred-seek-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Loaded AI predictions for Barcelona vs Liverpool.', bMessage: 'বার্সেলোনা বনাম লিভারপুল ম্যাচের এআই পূর্বাভাস লোড করা হয়েছে।', severity: 'info' });
                      }}
                      className="w-full text-center py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-[9px] font-bold tracking-wider rounded-lg transition uppercase cursor-pointer"
                    >
                      🔮 VIEW AI TACTICAL OUTLOOK
                    </button>
                  </div>
                </div>

                {/* Column 3: Grand Finale */}
                <div className="space-y-4">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 pb-1 border-b border-slate-900">
                    {language === 'EN' ? 'Grand Final (Upcoming)' : 'গ্র্যান্ড ফাইনাল (আসন্ন)'}
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900/90 border-2 border-indigo-500/20 rounded-2xl relative overflow-hidden text-center space-y-4">
                    <div className="absolute -right-6 -top-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
                    
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-widest">
                        {bracketMatches[6].stage}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{bracketMatches[6].time}</div>
                    </div>

                    <div className="flex items-center justify-around gap-2 pt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xl">🏆</span>
                        <span className="text-[11px] font-bold text-slate-300 mt-1">West Champion</span>
                      </div>
                      <span className="text-xs font-mono text-slate-600">VS</span>
                      <div className="flex flex-col items-center">
                        <span className="text-xl">🏆</span>
                        <span className="text-[11px] font-bold text-slate-300 mt-1">East Champion</span>
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-slate-400 leading-tight bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {language === 'EN' 
                        ? 'Simulated forecast suggests high likelihood of City vs Barcelona showdown.'
                        : 'সিমুলেশন মডেল অনুযায়ী ম্যান সিটি বনাম বার্সেলোনা ফাইনালের সম্ভাবনা ৮০%।'}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: STANDINGS TABLE DISPLAY */}
          {activeTab === 'standings' && (
            <motion.div
              key="standings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-center w-12">{language === 'EN' ? 'Rank' : 'র‍্যাংক'}</th>
                      <th className="px-4 py-3">{language === 'EN' ? 'Club' : 'ক্লাব'}</th>
                      <th className="px-3 py-3 text-center">{language === 'EN' ? 'P' : 'খেলেছে'}</th>
                      <th className="px-3 py-3 text-center">{language === 'EN' ? 'W' : 'জয়'}</th>
                      <th className="px-3 py-3 text-center">{language === 'EN' ? 'D' : 'ড্র'}</th>
                      <th className="px-3 py-3 text-center">{language === 'EN' ? 'L' : 'হার'}</th>
                      <th className="px-3 py-3 text-center">{language === 'EN' ? 'GD' : 'গোল ব্যবধান'}</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-200">{language === 'EN' ? 'PTS' : 'পয়েন্ট'}</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">{language === 'EN' ? 'Form' : 'সাম্প্রতিক'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standingsData.map((team) => (
                      <tr key={team.rank} className="hover:bg-slate-900/60 transition group">
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-400 group-hover:text-slate-200">
                          {team.rank}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-200 flex items-center gap-2">
                          <span className="text-base">{team.logo}</span>
                          <span>{team.name}</span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono text-slate-400">{team.played}</td>
                        <td className="px-3 py-3.5 text-center font-mono text-slate-400">{team.won}</td>
                        <td className="px-3 py-3.5 text-center font-mono text-slate-400">{team.drawn}</td>
                        <td className="px-3 py-3.5 text-center font-mono text-slate-400">{team.lost}</td>
                        <td className="px-3 py-3.5 text-center font-mono text-slate-400">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="px-4 py-3.5 text-center font-mono font-extrabold text-indigo-400 text-sm bg-slate-950/20">
                          {team.points}
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <div className="flex justify-center gap-1">
                            {team.form.map((res, i) => (
                              <span 
                                key={i} 
                                className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                                  res === 'W' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                                  res === 'D' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 
                                  'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {res}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI PREDICTIONS ENGINE */}
          {activeTab === 'predictions' && (
            <motion.div
              key="predictions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side selector list (col-span-4) */}
                <div className="lg:col-span-4 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {language === 'EN' ? 'Select Championship Match' : 'চ্যাম্পিয়নশিপ ম্যাচ নির্বাচন করুন'}
                  </span>
                  {bracketMatches.filter(m => m.id === 's1' || m.id === 's2' || m.id === 'f1').map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedPredictionMatch(m.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedPredictionMatch === m.id
                          ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/10'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 block uppercase">
                          {m.stage}
                        </span>
                        <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">
                          {m.teamA.name} vs {m.teamB.name}
                        </span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${selectedPredictionMatch === m.id ? 'translate-x-1 text-indigo-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>

                {/* Right side granular forecast details (col-span-8) */}
                <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
                      <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                        {language === 'EN' ? 'AI Tactical Intelligence Verdict' : 'এআই ট্যাকটিক্যাল ইন্টেলিজেন্স রায়'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      Confidence Level: 84%
                    </span>
                  </div>

                  <div className="flex items-center justify-around gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-900">
                    <div className="text-center">
                      <span className="text-2xl block">{selectedPredMatch.teamA.logo}</span>
                      <span className="text-xs font-bold text-slate-300 block mt-1">{selectedPredMatch.teamA.name}</span>
                      <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{selectedPredMatch.winProbA}%</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">WIN PROB</span>
                    </div>

                    <div className="text-center font-mono font-bold text-slate-600 text-xs">
                      VS
                    </div>

                    <div className="text-center">
                      <span className="text-2xl block">{selectedPredMatch.teamB.logo}</span>
                      <span className="text-xs font-bold text-slate-300 block mt-1">{selectedPredMatch.teamB.name}</span>
                      <span className="text-2xl font-black text-slate-100 font-mono block mt-1">{100 - selectedPredMatch.winProbA}%</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">WIN PROB</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {language === 'EN' ? 'Strategic Insight' : 'কৌশলগত বিশ্লেষণ'}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {language === 'EN' ? selectedPredMatch.prediction : selectedPredMatch.bengaliPrediction}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-850 grid grid-cols-2 gap-3.5">
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-900">
                      <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold">Key Tactical Node</span>
                      <span className="text-xs font-bold text-slate-200 block mt-0.5">
                        {language === 'EN' ? 'Midfield Transition Speed' : 'মিডফিল্ড ট্রানজিশন স্পীড'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-900">
                      <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold">Projected XG</span>
                      <span className="text-xs font-bold text-slate-200 block mt-0.5">
                        {language === 'EN' ? 'Real Madrid 1.84 - 1.62 Man City' : 'রিয়াল মাদ্রিদ ১.৮৪ - ১.৬২ ম্যান সিটি'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: STADIUM ATMOSPHERE CONTROLS */}
          {activeTab === 'atmosphere' && (
            <motion.div
              key="atmosphere-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Weather Adjustments & Sliders (col-span-7) */}
                <div className="md:col-span-7 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                    <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                      {language === 'EN' ? 'Ambient Soundscape Synthesis Controls' : 'পরিবেশ সাউন্ডস্কেপ সিন্থেসিস কন্ট্রোল'}
                    </span>
                  </div>

                  {/* Weather Selection */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                      {language === 'EN' ? 'Acoustic Weather Dampening' : 'শব্দ তরঙ্গ অবদমন (আবহাওয়া)'}
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => {
                          setWeatherCondition('clear');
                          onAddLog({ id: `weather-clear`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Weather dampening: Clear skies (Full Resonance).', bengaliMsg: 'আবহাওয়া ফিল্টার: পরিষ্কার আকাশ (পূর্ণ রেজোন্যান্স)।', severity: 'info' });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          weatherCondition === 'clear' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>{language === 'EN' ? 'Clear' : 'স্বচ্ছ'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setWeatherCondition('rain');
                          onAddLog({ id: `weather-rain`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Weather dampening: Rain / Wet Grass (High-freq dampening).', bengaliMsg: 'আবহাওয়া ফিল্টার: বৃষ্টি / ভেজা মাঠ (হাই-ফ্রিকোয়েন্সি ড্যাম্পেনিং)।', severity: 'info' });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          weatherCondition === 'rain' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>{language === 'EN' ? 'Rain' : 'বৃষ্টি'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setWeatherCondition('fog');
                          onAddLog({ id: `weather-fog`, timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Weather dampening: Heavy Fog (Lowpass 400Hz filter applied).', bengaliMsg: 'আবহাওয়া ফিল্টার: ঘন কুয়াশা (লো-পাস ৪০০ হার্জ ফিল্টার যুক্ত)।', severity: 'info' });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          weatherCondition === 'fog' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{language === 'EN' ? 'Foggy' : 'কুয়াশা'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sliders for crowd intensity and bias */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 font-bold uppercase">{language === 'EN' ? 'General Crowd Intensity' : 'সাধারণ দর্শক কোলাহল মাত্রা'}</span>
                        <span className="text-indigo-400 font-bold">{crowdIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={crowdIntensity}
                        onChange={(e) => setCrowdIntensity(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 font-bold uppercase">{language === 'EN' ? 'Home vs Away Bias' : 'হোম বনাম অ্যাওয়ে দলের সমর্থন পক্ষপাত'}</span>
                        <span className="text-indigo-400 font-bold">{homeBias}% Home</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={homeBias}
                        onChange={(e) => setHomeBias(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                        <span>10% (Away Dominated)</span>
                        <span>50% (Neutral)</span>
                        <span>90% (Ultra Home Cauldron)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live sound synthesis monitor panel (col-span-5) */}
                <div className="md:col-span-5 bg-slate-900/40 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                      {language === 'EN' ? 'Synthesized Atmosphere Metrics' : 'প্রক্রিয়াগত সাউন্ড ট্র্যাকার'}
                    </span>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Brownian Noise</span>
                        <span className="text-indigo-400 font-bold">{(crowdIntensity * 1.2).toFixed(1)} dB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Reverb Wet Ratio</span>
                        <span className="text-indigo-400 font-bold">{(homeBias / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Highpass Cutoff</span>
                        <span className="text-indigo-400 font-bold">
                          {weatherCondition === 'rain' ? '1200 Hz' : weatherCondition === 'fog' ? '400 Hz' : 'Flat'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Acoustic Feedback</span>
                        <span className="text-emerald-400 font-bold">STABLE</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal font-sans italic border-t border-slate-800/80 pt-4 mt-4">
                    {language === 'EN'
                      ? 'Synthesized procedurally inside the browser Web Audio context. Modulating parameters dynamically feeds real-time adjustments into the main soundstage engines.'
                      : 'ব্রাউজার ওয়েব অডিও কনটেক্সটে রিয়েল টাইমে সংশ্লেষিত। ডাইনামিক প্যারামিটারগুলো পরিবর্তন করলে তা মূল প্লেয়ারের সাউন্ডস্টেজকে প্রভাবিত করবে।'}
                  </p>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* HISTORICAL MOTM / VERDICT ARCHIVE TRAY */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
            {language === 'EN' ? 'Tournament Match-of-the-Match Archive' : 'টুর্নামেন্ট ম্যাচ অফ দ্যা ম্যাচ রেকর্ডস'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {motmArchive.map(entry => (
            <div 
              key={entry.id} 
              className="p-4 bg-slate-950/60 border border-slate-850 hover:border-slate-800 hover:bg-slate-950 transition rounded-2xl flex flex-col justify-between space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">
                    {language === 'EN' ? entry.matchName : entry.bengaliMatchName}
                  </span>
                  <span className="text-xs font-extrabold text-slate-200 block mt-0.5">
                    {entry.player}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono block">
                    {language === 'EN' ? entry.position : entry.bengaliPosition} • {entry.logo} {entry.team}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded">
                  ★ {entry.rating}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal italic font-sans border-t border-slate-900 pt-2">
                "{language === 'EN' ? entry.narrative : entry.bengaliNarrative}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
