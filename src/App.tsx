/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  Tv, 
  Flame, 
  RefreshCw, 
  Sliders, 
  Globe, 
  Plus, 
  Trash2, 
  ExternalLink, 
  HelpCircle, 
  Info, 
  Lock, 
  Unlock, 
  Wifi, 
  CheckCircle2,
  ListFilter,
  PlayCircle,
  FileCode2,
  AlertTriangle,
  Copy,
  Check,
  Trophy
} from 'lucide-react';
import { Match, SecurityOption, SecurityLog } from './types';
import { mockMatches, initialSecurityOptions, sampleLogs } from './data';
import SecurePlayer from './components/SecurePlayer';
import ReactNativeConfigGenerator from './components/ReactNativeConfigGenerator';
import TournamentCommandCenter from './components/TournamentCommandCenter';

export default function App() {
  const [currentView, setCurrentView] = useState<'stream' | 'tournament'>('stream');
  const [language, setLanguage] = useState<'EN' | 'BN'>('BN');
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [selectedSport, setSelectedSport] = useState<'all' | 'football' | 'cricket' | 'basketball'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(mockMatches[0]);
  
  // Custom URL input
  const [customUrl, setCustomUrl] = useState('');
  const [isUsingCustomUrl, setIsUsingCustomUrl] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Security States
  const [securityOptions, setSecurityOptions] = useState<SecurityOption[]>(initialSecurityOptions);
  const [logs, setLogs] = useState<SecurityLog[]>(sampleLogs);
  const [blockedCount, setBlockedCount] = useState(14); // Simulated blocked ads counter

  // Active sport filter
  const filteredMatches = selectedSport === 'all' 
    ? matches 
    : matches.filter(m => m.sport === selectedSport);

  // Handle stream URL change
  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsUsingCustomUrl(false);
    
    // Add info log
    const timeStr = new Date().toLocaleTimeString();
    addLog({
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      type: 'info',
      message: `Loading stream for ${match.teamA.name} vs ${match.teamB.name}.`,
      bengaliMsg: `${match.teamA.name} বনাম ${match.teamB.name} এর লাইভ স্ট্রিম লোড করা হচ্ছে।`,
      severity: 'info'
    });
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    setIsUsingCustomUrl(true);
    setSelectedMatch(null);

    // Add info log
    const timeStr = new Date().toLocaleTimeString();
    addLog({
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      type: 'info',
      message: `Loading custom test stream: ${customUrl.substring(0, 40)}...`,
      bengaliMsg: `কাস্টম টেস্ট স্ট্রিম লোড করা হচ্ছে: ${customUrl.substring(0, 40)}...`,
      severity: 'info'
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    });
  };

  const liveHlsPresets = [
    {
      name: 'Al Jazeera News Live',
      bnName: 'আল জাজিরা নিউজ লাইভ',
      url: 'https://live-amg-elg.akamaized.net/aljazeera/index.m3u8',
      quality: '1080p Stable'
    },
    {
      name: 'France 24 News Live',
      bnName: 'ফ্রান্স ২৪ লাইভ টিভি',
      url: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8',
      quality: '720p Stable'
    },
    {
      name: 'Red Bull TV Live',
      bnName: 'রেড বুল টিভি লাইভ',
      url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      quality: 'Multi-bitrate'
    },
    {
      name: 'Tears of Steel HLS Test',
      bnName: 'টিয়ার্স অফ স্টিল টেস্ট',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      quality: '1080p HD'
    },
    {
      name: 'Big Buck Bunny Test',
      bnName: 'বিগ বাক বানি টেস্ট',
      url: 'https://test-streams.mux.dev/x36xhg/movie.m3u8',
      quality: 'Multi-resolution'
    }
  ];

  const addLog = (newLog: SecurityLog) => {
    const uniqueLog = {
      ...newLog,
      id: `${newLog.id}-${Math.random().toString(36).substring(2, 9)}`
    };
    setLogs(prev => [uniqueLog, ...prev].slice(0, 30)); // Keep last 30 logs
    if (uniqueLog.type === 'blocked_popup' || uniqueLog.type === 'blocked_redirect' || uniqueLog.type === 'cookie_access') {
      setBlockedCount(prev => prev + 1);
    }
  };

  const toggleSecurityOption = (id: string) => {
    setSecurityOptions(prev => prev.map(opt => {
      if (opt.id === id) {
        const updated = { ...opt, value: !opt.value };
        const timeStr = new Date().toLocaleTimeString();
        addLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'info',
          message: `Security setting altered: ${opt.name} set to ${updated.value ? 'ENABLED' : 'DISABLED'}.`,
          bengaliMsg: `নিরাপত্তা সেটিংস পরিবর্তন: ${opt.name} এখন ${updated.value ? 'সক্রিয় (ENABLED)' : 'নিষ্ক্রিয় (DISABLED)'}।`,
          severity: 'info'
        });
        return updated;
      }
      return opt;
    }));
  };

  const clearLogs = () => {
    setLogs([]);
    setBlockedCount(0);
  };

  // Simulate dynamic match score changes
  useEffect(() => {
    const timer = setInterval(() => {
      setMatches(prevMatches => prevMatches.map(match => {
        if (match.status === 'live') {
          if (match.sport === 'football') {
            const nextMinute = (match.minute ?? 70) + 1;
            // random chance to score a goal
            const scoreGoal = Math.random() > 0.95;
            let scoreA = parseInt(match.teamA.score ?? '0');
            let scoreB = parseInt(match.teamB.score ?? '0');
            if (scoreGoal) {
              if (Math.random() > 0.5) scoreA += 1;
              else scoreB += 1;
              
              // Add goal log
              const timeStr = new Date().toLocaleTimeString();
              addLog({
                id: `log-${Date.now()}`,
                timestamp: timeStr,
                type: 'info',
                message: `GOAL! Live score updated for ${match.teamA.name} vs ${match.teamB.name}.`,
                bengaliMsg: `গোল! ${match.teamA.name} বনাম ${match.teamB.name} এর লাইভ স্কোর আপডেট হয়েছে।`,
                severity: 'info'
              });
            }
            return {
              ...match,
              minute: nextMinute > 90 ? 90 : nextMinute,
              teamA: { ...match.teamA, score: scoreA.toString() },
              teamB: { ...match.teamB, score: scoreB.toString() }
            };
          } else if (match.sport === 'cricket') {
            let runs = parseInt(match.teamA.score?.split('/')[0] ?? '184');
            let wickets = parseInt(match.teamA.score?.split('/')[1] ?? '4');
            let overs = parseFloat(match.teamA.overs ?? '18.2');

            // Simulate next ball
            let nextOvers = parseFloat((overs + 0.1).toFixed(1));
            if (parseFloat((nextOvers % 1).toFixed(1)) >= 0.6) {
              nextOvers = Math.floor(nextOvers) + 1;
            }

            const rand = Math.random();
            if (rand > 0.92 && wickets < 10) {
              wickets += 1;
              // Add log
              const timeStr = new Date().toLocaleTimeString();
              addLog({
                id: `log-${Date.now()}`,
                timestamp: timeStr,
                type: 'info',
                message: `WICKET! Kolkata Knight Riders are now ${runs}/${wickets}.`,
                bengaliMsg: `উইকেট! কলকাতা নাইট রাইডার্স এখন ${runs}/${wickets}।`,
                severity: 'info'
              });
            } else {
              const runIncrease = Math.floor(Math.random() * 4);
              runs += runIncrease;
            }

            return {
              ...match,
              teamA: {
                ...match.teamA,
                score: `${runs}/${wickets}`,
                overs: nextOvers.toFixed(1),
                wickets: wickets.toString()
              }
            };
          }
        }
        return match;
      }));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 flex flex-col gap-6">
      {/* Top Safe Alert Banner */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-mono text-[11px]">
              {language === 'EN' 
                ? 'SECURE FRAME LAB ENVIRONMENT ACTIVE' 
                : 'নিরাপদ ফ্রেম ল্যাব এনভায়রনমেন্ট সক্রিয়'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500 font-mono">
              {language === 'EN' ? 'Strictly Sandboxed Iframe Simulator' : 'সম্পূর্ণ সুরক্ষিত আইফ্রেম সিমুলেটর'}
            </span>
            <button 
              id="lang-toggle-btn"
              onClick={() => setLanguage(lang => lang === 'EN' ? 'BN' : 'EN')}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-indigo-400 font-bold rounded-lg transition text-[11px] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header styled to match Bento theme */}
      <header className="flex justify-between items-center bg-slate-900/50 border border-slate-800 p-5 rounded-2xl max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-slate-100 flex items-center gap-2">
              Sportzfy Guard <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.5 rounded">v1.2.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'EN' ? 'Security & Integration Hub' : 'নিরাপত্তা ও ইন্টিগ্রেশন হাব'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {language === 'EN' ? 'SYSTEM SECURE' : 'সিস্টেম নিরাপদ'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-xs text-indigo-400 font-bold">
            SF
          </div>
        </div>
      </header>

      {/* Main Bento Grid layout starts here */}
      <div className="max-w-7xl w-full mx-auto space-y-6">
        
        {/* PREMIUM GLOBAL VIEW SWITCHER */}
        <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 flex gap-2">
          <button
            onClick={() => setCurrentView('stream')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              currentView === 'stream'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Tv className="w-4.5 h-4.5" />
            <span>{language === 'EN' ? 'Security Sandbox & Broadcast Player' : 'সিকিউরিটি স্যান্ডবক্স ও ব্রডকাস্ট প্লেয়ার'}</span>
          </button>
          <button
            onClick={() => setCurrentView('tournament')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              currentView === 'tournament'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Trophy className="w-4.5 h-4.5 text-yellow-300" />
            <span>{language === 'EN' ? 'Tournament Command Center' : 'টুর্নামেন্ট কমান্ড সেন্টার'}</span>
          </button>
        </div>
        
        {currentView === 'stream' ? (
          <>
            {/* TOP LEVEL BENTO BLOCKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Block 1: Security Risks & Stats (Left Column, col-span-5) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {language === 'EN' ? 'Security Audit Counter' : 'নিরাপত্তা অডিট কাউন্টার'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {language === 'EN' ? 'Sandbox isolation rating' : 'স্যান্ডবক্স আইসোলেশন রেটিং'}
                </p>
              </div>
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="my-4">
              <p className="text-4xl font-extrabold text-white tracking-tight font-display">
                98.4<span className="text-slate-500">%</span>
              </p>
              <p className="text-xs text-emerald-400 mt-1 italic">
                {language === 'EN' ? 'External script isolation active' : 'এক্সটার্নাল স্ক্রিপ্ট সম্পূর্ণ আইসোলেটেড'}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/60">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">X-Frame-Options</span>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CSP Protection Policy</span>
                <span className="text-emerald-400 font-bold">STRICT</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Blocked Adware / Popups</span>
                <span className="text-indigo-400 font-bold">{blockedCount} SIMULATED</span>
              </div>
            </div>
          </div>

          {/* Bento Block 2: Quick Advisory Module (Middle, col-span-4) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {language === 'EN' ? 'Legal & Compliance' : 'আইনি ও কমপ্লায়েন্স সতর্কতা'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {language === 'EN'
                  ? 'External streaming integrations from unofficial APK side-loads often deliver high security risks. We strongly recommend leveraging secure m3u8 HLS streams via standardized sandbox players rather than hosting unvetted third-party interfaces.'
                  : 'অফিসিয়াল অ্যাপ ছাড়া Sportzfy বা অনুরূপ এপিকে সাইড-লোড করা অত্যন্ত ঝুঁকিপূর্ণ। কাস্টম ড্যাশবোর্ডে m3u8 বা HLS লিঙ্ক ভিডিও প্লেয়ার ব্যবহার করে ডিরেক্ট খেলা চালানোই সবচেয়ে নিরাপদ এবং আইনি জটিলতামুক্ত পদ্ধতি।'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-xs font-mono text-slate-400">
                  {language === 'EN' ? 'NoorNexus Ecosystem integration' : 'NoorNexus ইকোসিস্টেম ইন্টিগ্রেশন'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Compatible with Sheikh Code Exchange architecture.
              </p>
            </div>
          </div>

          {/* Bento Block 3: Ecosystem Info (Right Column, col-span-3) */}
          <div className="lg:col-span-3 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-between min-h-[300px] shadow-lg shadow-indigo-600/10">
            <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-75 font-mono">
              {language === 'EN' ? 'ECOSYSTEM SYSTEMS' : 'ইকোসিস্টেম প্রজেক্টস'}
            </h3>
            
            <div className="space-y-2 my-auto">
              <p className="text-base font-bold font-display tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 opacity-90" />
                Sovereign Fintech Shield
              </p>
              <p className="text-base font-bold font-display tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 opacity-90" />
                NoorNexus Suite
              </p>
              <p className="text-base font-bold font-display tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 opacity-90" />
                Sheikh Code Exchange
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/20 pt-4">
              <span className="text-xs opacity-80">
                {language === 'EN' ? 'Active Projects' : 'সক্রিয় প্রজেক্ট সমূহ'}
              </span>
              <span className="text-lg font-black font-mono">03</span>
            </div>
          </div>

        </div>

        {/* SECURE PLAY SPACE & INTERACTIVE DEMO (Bento Core Layout) */}
        <div id="secure-player-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dynamic Video Player - taking 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-1 bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden">
              <SecurePlayer
                match={isUsingCustomUrl ? null : selectedMatch}
                customUrl={customUrl}
                securityOptions={securityOptions}
                onAddLog={addLog}
                language={language}
              />
            </div>

            {/* Custom Input Bento Module */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  {language === 'EN' ? 'HLS / SITE URL TESTING FRAME' : 'HLS বা কাস্টম সাইট টেস্ট ফ্রেম'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'EN'
                    ? 'Input any .m3u8 streaming link to watch live, or external sport URL to trigger safety simulations.'
                    : 'যেকোনো লাইভ m3u8 স্ট্রিম বা থার্ড পার্টি স্পোর্টস লিঙ্ক দিয়ে স্যান্ডবক্স টেস্ট করুন।'}
                </p>
              </div>

              <form onSubmit={handleCustomUrlSubmit} className="flex gap-2.5">
                <input
                  id="custom-stream-url-input"
                  type="text"
                  placeholder="https://test-streams.mux.dev/x36xhg/movie.m3u8"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 transition"
                />
                <button
                  id="submit-custom-url-btn"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold font-sans px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  {language === 'EN' ? 'Load' : 'লোড করুন'}
                </button>
              </form>

              {/* Live HLS Presets List */}
              <div className="pt-3 border-t border-slate-800/60 space-y-2">
                <div className="flex justify-between items-center pb-1">
                  <h5 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                    {language === 'EN' ? 'PRE-VERIFIED LIVE VIDEO LINKS' : 'যাচাইকৃত লাইভ ভিডিও লিঙ্কসমূহ'}
                  </h5>
                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                    {language === 'EN' ? 'ONLINE' : 'অনলাইন'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5">
                  {liveHlsPresets.map((preset, index) => {
                    const isCopied = copiedUrl === preset.url;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between gap-3 p-2 bg-slate-950/50 border border-slate-800/50 hover:border-slate-700/60 rounded-xl hover:bg-slate-950 transition group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {language === 'EN' ? preset.name : preset.bnName}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {preset.quality}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-indigo-400/80 truncate block mt-0.5 max-w-[280px]">
                            {preset.url}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomUrl(preset.url);
                              setIsUsingCustomUrl(true);
                              setSelectedMatch(null);
                              const timeStr = new Date().toLocaleTimeString();
                              addLog({
                                id: `log-${Date.now()}`,
                                timestamp: timeStr,
                                type: 'info',
                                message: `Loaded preset stream: ${preset.name}`,
                                bengaliMsg: `প্রিসেট স্ট্রিম লোড করা হয়েছে: ${preset.bnName}`,
                                severity: 'info'
                              });
                            }}
                            className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>{language === 'EN' ? 'Play' : 'চালান'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(preset.url)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                            title={language === 'EN' ? 'Copy Stream URL' : 'লিঙ্ক কপি করুন'}
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Live Controller Panel & Captures - taking 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Security Switches */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                    {language === 'EN' ? 'LIVE SANDBOX SHIELDS' : 'লাইভ স্যান্ডবক্স শিল্ডসমূহ'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400">
                  {language === 'EN' ? 'CONFIG' : 'সেটিংস'}
                </span>
              </div>

              <div className="space-y-3.5">
                {securityOptions.map(option => (
                  <div key={option.id} className="flex items-start justify-between gap-4 p-2.5 rounded-2xl hover:bg-slate-850/30 transition">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                        {option.id === 'sandbox' && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
                        {option.id === 'allowPopups' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{option.name}</span>
                      </label>
                      <span className="text-[10px] text-slate-400 block leading-normal">
                        {language === 'EN' ? option.description : option.bengaliDesc}
                      </span>
                    </div>

                    <button
                      id={`security-toggle-${option.id}`}
                      onClick={() => toggleSecurityOption(option.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        option.value ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          option.value ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Captures Logs Console */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                    {language === 'EN' ? 'REALTIME DEPLOYMENT LOGS' : 'রিয়েলটাইম স্যান্ডবক্স লগস'}
                  </h3>
                </div>
                <button
                  id="clear-logs-btn"
                  onClick={clearLogs}
                  className="text-[10px] font-mono text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'EN' ? 'Clear' : 'মুছে ফেলুন'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 h-44 overflow-y-auto font-mono text-[10px] space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-slate-600 py-12">
                    {language === 'EN' ? 'No logs captured yet. Try streaming.' : 'কোনো লগ নেই। স্ট্রিম চালু করুন।'}
                  </div>
                ) : (
                  logs.map(log => {
                    let typeColor = 'text-indigo-400';
                    let bgBorder = 'border-indigo-500/10 bg-indigo-500/5';
                    if (log.type === 'blocked_popup' || log.type === 'blocked_redirect') {
                      typeColor = 'text-rose-400 font-bold';
                      bgBorder = 'border-rose-500/20 bg-rose-500/5';
                    } else if (log.type === 'cookie_access') {
                      typeColor = 'text-amber-400';
                      bgBorder = 'border-amber-500/20 bg-amber-500/5';
                    }

                    return (
                      <div key={log.id} className={`p-2 rounded-xl border leading-relaxed ${bgBorder}`}>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                          <span className={`uppercase font-bold ${typeColor}`}>[{log.type}]</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300">
                          {language === 'EN' ? log.message : log.bengaliMsg}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

        {/* MATCHES DASHBOARD (Grid arranged as bento cells) */}
        <section id="dashboard-section" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Tv className="w-5 h-5" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
                  {language === 'EN' ? 'LIVE SPORTS FEED' : 'লাইভ স্পোর্টস ফিড'}
                </h3>
              </div>
              <h2 className="text-xl font-bold font-display text-slate-100">
                {language === 'EN' ? 'Available Clean Stream Feeds' : 'সংযুক্ত স্পোর্টস স্ট্রিম সমূহ'}
              </h2>
            </div>

            {/* Sport Category Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'football', 'cricket', 'basketball'] as const).map(sport => (
                <button
                  id={`filter-${sport}-btn`}
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
                    selectedSport === sport 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {sport === 'all' ? (language === 'EN' ? 'All' : 'সব খেলা') : sport}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMatches.map(match => {
                const isSelected = selectedMatch?.id === match.id && !isUsingCustomUrl;
                return (
                  <motion.div
                    layout
                    id={`match-card-${match.id}`}
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSelectMatch(match)}
                    className={`p-5 rounded-3xl cursor-pointer border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-48 ${
                      isSelected 
                        ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {match.league}
                      </span>
                      {match.status === 'live' ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          {language === 'EN' ? 'LIVE' : 'লাইভ'} {match.sport === 'football' ? `${match.minute}'` : ''}
                        </span>
                      ) : match.status === 'upcoming' ? (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                          {match.time}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-slate-950 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-900">
                          {language === 'EN' ? 'FINISHED' : 'সমাপ্ত'}
                        </span>
                      )}
                    </div>

                    {/* Middle Row (Teams) */}
                    <div className="space-y-2.5 my-auto">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{match.teamA.logo}</span>
                          <span className="text-sm font-semibold text-slate-200">{match.teamA.name}</span>
                        </div>
                        {match.status === 'live' || match.status === 'finished' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-100 font-mono">{match.teamA.score}</span>
                            {match.sport === 'cricket' && (
                              <span className="text-[9px] text-slate-400 font-mono">Overs: {match.teamA.overs}</span>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{match.teamB.logo}</span>
                          <span className="text-sm font-semibold text-slate-200">{match.teamB.name}</span>
                        </div>
                        {match.status === 'live' || match.status === 'finished' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-100 font-mono">{match.teamB.score}</span>
                            {match.sport === 'cricket' && (
                              <span className="text-[9px] text-slate-400 font-mono">Overs: {match.teamB.overs}</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-400 text-[11px] font-mono">
                        {match.category}
                      </span>
                      <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:text-indigo-300">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{language === 'EN' ? 'Watch' : 'স্ট্রিম দেখুন'}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* BOTTOM REACT NATIVE CODE GENERATION ENGINE */}
        <section className="pt-4">
          <ReactNativeConfigGenerator language={language} />
        </section>

        {/* BENTO STATS SECTION (Simulated active stream feeds bandwidth metrics) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">
              {language === 'EN' ? 'Bandwidth' : 'ব্যান্ডউইথ ব্যবহার'}
            </p>
            <p className="text-2xl font-black text-white font-display">
              12.4 <span className="text-xs text-slate-500 font-normal">Mbps</span>
            </p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">
              {language === 'EN' ? 'Buffer Rate' : 'বাফারিং হার'}
            </p>
            <p className="text-2xl font-black text-white font-display">
              0.02 <span className="text-xs text-slate-500 font-normal">%</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-mono">
              {language === 'EN' ? 'Latency' : 'লেটেঞ্চি ল্যাগ'}
            </p>
            <p className="text-2xl font-black text-white font-display">
              42 <span className="text-xs text-slate-500 font-normal">ms</span>
            </p>
          </div>
        </section>
          </>
        ) : (
          <TournamentCommandCenter language={language} onAddLog={addLog} />
        )}

        {/* SECURITY EDUCATION SECTION */}
        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold font-display text-slate-100">
              {language === 'EN' ? 'Frequently Asked Security Questions' : 'স্ট্রিমিং সিকিউরিটি সম্পর্কিত প্রশ্নোত্তর'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-200">
                {language === 'EN' 
                  ? 'Q: How does Iframe Sandboxing protect our users?' 
                  : 'প্রশ্ন: আইফ্রেম স্যান্ডবক্সিং ইউজারদের কীভাবে সুরক্ষিত রাখে?'}
              </h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                {language === 'EN'
                  ? 'By default, any website loaded inside an iframe can run arbitrary javascript. This javascript can try to hijack your parent window using window.top.location = "spam-site.com". Sandboxing restricts these capabilities so the site is isolated and unable to manipulate the parent.'
                  : 'ডিফল্টভাবে, যেকোনো ওয়েবসাইট আইফ্রেমের ভেতরে রান করলে তা প্যারেন্ট পেজের ফুল কন্ট্রোল নিয়ে নিতে পারে এবং window.top.location কোড ব্যবহার করে ইউজারকে বিজ্ঞাপনের সাইটে নিয়ে যেতে পারে। sandbox অ্যাট্রিবিউট ব্যবহার করলে এটি সম্পূর্ণ ব্লক হয়ে যায়।'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200">
                {language === 'EN'
                  ? 'Q: Why should we block allow-same-origin for streaming sites?'
                  : 'প্রশ্ন: স্পোর্টস সাইটের জন্য allow-same-origin বন্ধ রাখা কেন জরুরি?'}
              </h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                {language === 'EN'
                  ? 'If a third-party stream site is loaded with allow-same-origin, and it happens to be hosted on the same domain or gets session access, it can read your local site storage, cookie tokens, and mock authentication data. Disabling it forces the iframe to run in a completely isolated cross-origin context.'
                  : 'যদি একই ডোমেইনে বা লোকাল সাইটে allow-same-origin অন থাকে, তবে আইফ্রেমটি আপনার অ্যাপের লোকাল স্টোরেজ বা কুকিজ পড়তে পারবে। এটি নিষ্ক্রিয় রাখলে আইফ্রেমটি কোনো প্রকার পার্সোনাল ডেটা অ্যাক্সেস করতে পারে না।'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500 mt-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <p className="text-slate-400 font-semibold font-display">
              Sportzfy Guard Sandbox © 2026
            </p>
            <p className="text-[11px]">
              {language === 'EN'
                ? 'Educational and development reference implementation. Ensure streaming links conform to legal broadcast rights.'
                : 'শিক্ষামূলক এবং ডেভেলপমেন্ট রেফারেন্সের জন্য তৈরি। স্ট্রিমিং লিঙ্ক ব্যবহারের আগে সম্প্রচার স্বত্ব যাচাই করে নিন।'}
            </p>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600 font-mono">Status: Green</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
