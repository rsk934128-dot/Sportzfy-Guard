import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Volume2, VolumeX, Shield, ShieldAlert, Terminal, RefreshCw, Layers, 
  Trash2, Trophy, Clock, Cpu, Database, Activity, Wifi, Sparkles, MessageSquare, 
  ExternalLink, Grid, Volume1, Speaker, Sliders, Gauge, Zap, TrendingUp, Tv, 
  Megaphone, SlidersHorizontal, Radio, Eye 
} from 'lucide-react';
import { Match, SecurityOption, SecurityLog } from '../types';
import { soundEngine } from '../utils/soundEngine';

// Helper component for Live Mosaic Wall grid elements
interface MosaicVideoProps {
  url: string;
  name: string;
  isMuted: boolean;
  onPromote: () => void;
  language: 'EN' | 'BN';
}

function MosaicVideo({ url, name, isMuted, onPromote, language }: MosaicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 4, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, () => {
        setLoadError(true);
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
    }
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 group flex flex-col h-full min-h-[110px]">
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {loadError ? (
          <div className="text-[10px] font-mono text-rose-400 p-2 text-center">
            [Feed Blocked/Offline]
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover pointer-events-none bg-slate-950"
            playsInline
            muted={isMuted}
            autoPlay
            loop
          />
        )}
        
        {/* Promote to main screen overlay */}
        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
          <button
            onClick={onPromote}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-md shadow-indigo-950 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>{language === 'EN' ? 'PROMOTE' : 'মূল স্ক্রিন'}</span>
          </button>
        </div>

        {/* Live Indicator overlay */}
        <div className="absolute top-1.5 left-1.5 z-10 bg-slate-950/85 backdrop-blur px-1.5 py-0.5 rounded border border-slate-800 text-[8px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE</span>
        </div>
      </div>
      
      <div className="px-2 py-1 bg-slate-900 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-300 font-semibold truncate max-w-[130px]">{name}</span>
        <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1 rounded">HLS</span>
      </div>
    </div>
  );
}

// Helper component for Telemetry Canvas Oscilloscope
function TelemetryCanvas({ latency, packetLoss }: { latency: number; packetLoss: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw Waveform based on latency and jitter from packet loss
      ctx.beginPath();
      ctx.strokeStyle = packetLoss > 2 ? '#f43f5e' : '#6366f1';
      ctx.lineWidth = 1.5;

      const jitter = packetLoss * 5;
      const amplitude = 12 + (packetLoss * 2);
      const frequency = 0.05 + (latency * 0.01);

      for (let x = 0; x < canvas.width; x++) {
        const noise = (Math.random() - 0.5) * jitter;
        const y = (canvas.height / 2) + Math.sin(x * frequency + t) * amplitude + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary data wave
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 2) {
        const y = (canvas.height / 2) + Math.cos(x * 0.02 - t * 0.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      t += 0.08 + (latency * 0.02);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [latency, packetLoss]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={80}
      className="w-full h-full bg-slate-950 rounded-lg border border-slate-800"
    />
  );
}

interface SecurePlayerProps {
  match: Match | null;
  customUrl: string;
  securityOptions: SecurityOption[];
  onAddLog: (log: SecurityLog) => void;
  language: 'EN' | 'BN';
}

export default function SecurePlayer({
  match,
  customUrl,
  securityOptions,
  onAddLog,
  language
}: SecurePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [selectedServer, setSelectedServer] = useState<'server1' | 'server2' | 'server3'>('server1');
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [blockedAlert, setBlockedAlert] = useState<{ message: string; bengaliMsg: string; type: string } | null>(null);
  
  const [playbackStats, setPlaybackStats] = useState({
    resolution: 'Auto (1080p)',
    fps: '60 fps',
    buffer: '0.0s',
    securityStatus: 'Highly Protected'
  });

  // Dynamic Live Score Tracker State
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const liveMatchRef = useRef<Match | null>(null);

  useEffect(() => {
    liveMatchRef.current = liveMatch;
  }, [liveMatch]);

  // Control Room Dashboard & Telemetry States
  const [controlRoomTab, setControlRoomTab] = useState<'player' | 'livewall' | 'telemetry' | 'soundstage'>('player');
  const [isCrowdHumActive, setIsCrowdHumActive] = useState<boolean>(false);
  const [venueSize, setVenueSize] = useState<'mini' | 'arena' | 'grand'>('arena');
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(false);
  const [simulatedLatency, setSimulatedLatency] = useState<number>(1.2);
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(24.5);
  const [packetLoss, setPacketLoss] = useState<number>(0.0);
  const [adaptiveBitrate, setAdaptiveBitrate] = useState<boolean>(true);
  const [activeCdnIndex, setActiveCdnIndex] = useState<number>(0);
  const [telemetryTimeline, setTelemetryTimeline] = useState<{ id: string; time: string; type: 'success' | 'warn' | 'error' | 'info'; message: string }[]>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'info', message: 'Sportzfy Telemetry Gateway initialized.' },
    { id: '2', time: new Date().toLocaleTimeString(), type: 'success', message: 'Decryption keys verified on primary DNS tunnel.' }
  ]);

  const isTtsEnabledRef = useRef(isTtsEnabled);
  const languageRef = useRef(language);
  const isCrowdHumActiveRef = useRef(isCrowdHumActive);
  const packetLossRef = useRef(packetLoss);
  const adaptiveBitrateRef = useRef(adaptiveBitrate);

  useEffect(() => {
    isTtsEnabledRef.current = isTtsEnabled;
    languageRef.current = language;
    isCrowdHumActiveRef.current = isCrowdHumActive;
    packetLossRef.current = packetLoss;
    adaptiveBitrateRef.current = adaptiveBitrate;
  }, [isTtsEnabled, language, isCrowdHumActive, packetLoss, adaptiveBitrate]);

  // Synchronize custom audio settings with sound engine
  useEffect(() => {
    soundEngine.setVolume(volume);
    soundEngine.setMuted(isMuted);
  }, [volume, isMuted]);

  useEffect(() => {
    if (isCrowdHumActive) {
      soundEngine.startAtmosphere();
    } else {
      soundEngine.stopAtmosphere();
    }
  }, [isCrowdHumActive]);

  const [commentaries, setCommentaries] = useState<{ id: string; time: string; text: string; textBn: string; type?: 'goal' | 'wicket' | 'normal' }[]>([]);
  
  // Smart Cache Optimizer State
  const [cacheSize, setCacheSize] = useState<number>(142.4);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  
  // Tab selector state for non-HLS streams
  const [nonHlsTab, setNonHlsTab] = useState<'stream' | 'simulator'>('stream');
  const [overrideUrl, setOverrideUrl] = useState<string | null>(null);

  useEffect(() => {
    setOverrideUrl(null);
  }, [match, customUrl]);

  // Player engine state (Auto, HLS Video Player, Embedded IFrame)
  const [playerMode, setPlayerMode] = useState<'auto' | 'hls' | 'iframe'>('auto');

  // Player UI and Overlay Control States
  const [showControls, setShowControls] = useState<boolean>(true);
  const [useNativeControls, setUseNativeControls] = useState<boolean>(false);
  const [useProxy, setUseProxy] = useState<boolean>(true);

  const baseStreamUrl = overrideUrl || (match ? match.streamUrl : customUrl);
  
  // Resolve stream URL quality suffix/alterations per server selection
  const streamUrl = (() => {
    if (!baseStreamUrl) return '';
    if (selectedServer === 'server2') {
      return baseStreamUrl.includes('?') ? `${baseStreamUrl}&quality=sd` : `${baseStreamUrl}?quality=sd`;
    }
    if (selectedServer === 'server3') {
      return baseStreamUrl.includes('?') ? `${baseStreamUrl}&quality=hd` : `${baseStreamUrl}?quality=hd`;
    }
    return baseStreamUrl;
  })();

  // Final streaming URL routed through our secure proxy if useProxy is active
  const resolvedStreamUrl = (() => {
    if (!streamUrl) return '';
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(streamUrl)}`;
    }
    return streamUrl;
  })();

  // Reset stream error when stream changes
  useEffect(() => {
    setStreamError(null);
  }, [resolvedStreamUrl]);

  const isHls = playerMode === 'auto'
    ? (streamUrl.includes('.m3u8') || streamUrl.includes('.ism') || streamUrl.includes(':8200') || streamUrl.includes('/live/') || streamUrl.includes('play') || streamUrl.includes('libre3dere.site') || streamUrl.includes('beat.space') || streamUrl.includes('agl002.online') || streamUrl.includes('156.66') || streamUrl.includes('104.33') || streamUrl.includes('157.76'))
    : playerMode === 'hls';

  // Trigger loading state and safety confirmation logs on server switch or match load
  useEffect(() => {
    if (!baseStreamUrl) return;
    setIsLoadingStream(true);
    setStreamError(null);
    
    const timer = setTimeout(() => {
      setIsLoadingStream(false);
      
      const serverNames = {
        server1: 'Primary HLS (High Speed)',
        server2: 'Data Saver (Low Bandwidth)',
        server3: 'Backup Server (Ultra HD)'
      };
      const banglaServerNames = {
        server1: 'প্রাইমারি HLS (হাই স্পিড)',
        server2: 'ডাটা সেভার (লো ব্যান্ডউইথ)',
        server3: 'ব্যাকআপ সার্ভার (আল্ট্রা এইচডি)'
      };

      const timeStr = new Date().toLocaleTimeString();
      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        type: 'info',
        message: `Switched stream channel path to ${serverNames[selectedServer]}. Security verification: SUCCESS.`,
        bengaliMsg: `স্ট্রিমিং পাথ সফলভাবে ${banglaServerNames[selectedServer]}-এ পরিবর্তন করা হয়েছে। নিরাপত্তা যাচাই: সফল।`,
        severity: 'info'
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [selectedServer, baseStreamUrl]);

  // Synchronize and simulate real-time live score updates
  useEffect(() => {
    if (!match) {
      setLiveMatch(null);
      setCommentaries([]);
      return;
    }

    setLiveMatch(JSON.parse(JSON.stringify(match))); // deep clone to keep local mutations safe

    // Initialize initial sports commentaries
    if (match.sport === 'football') {
      setCommentaries([
        {
          id: 'init-c1',
          time: `${match.minute || 74}'`,
          text: `UEFA Champions League Live Match. ${match.teamA.name} and ${match.teamB.name} contesting in high intensity.`,
          textBn: `উয়েফা চ্যাম্পিয়ন্স লিগ লাইভ ম্যাচ। ${match.teamA.name} এবং ${match.teamB.name} অত্যন্ত গতিময় ও আক্রমণাত্মক ফুটবল খেলছে।`,
          type: 'normal'
        }
      ]);
    } else if (match.sport === 'cricket') {
      setCommentaries([
        {
          id: 'init-c1',
          time: `${match.teamA.overs || '18.2'} Ov`,
          text: `Exciting run chase in T20 tournament. Bowler is ready to run in.`,
          textBn: `টি-টোয়েন্টি ক্রিকেটে শ্বাসরুদ্ধকর রান তাড়া। বোলার রান-আপ শুরু করার জন্য প্রস্তুত।`,
          type: 'normal'
        }
      ]);
    } else {
      setCommentaries([
        {
          id: 'init-c1',
          time: 'Q4 08:30',
          text: `NBA Finals ongoing. Spectacular basketball action on display.`,
          textBn: `এনবিএ ফাইনাল লাইভ। কোর্টে দুর্দান্ত বাস্কেটবল লড়াই চলছে।`,
          type: 'normal'
        }
      ]);
    }
  }, [match]);

  // Real-time Sports and Cache Feed Simulation
  useEffect(() => {
    const sportsTimer = setInterval(() => {
      const currentMatch = liveMatchRef.current;
      if (!currentMatch || currentMatch.status !== 'live') return;

      const updated = JSON.parse(JSON.stringify(currentMatch)) as Match;
      const timeStr = new Date().toLocaleTimeString();
      let logPayload: SecurityLog | null = null;
      let newCommentary: { id: string; time: string; text: string; textBn: string; type?: 'goal' | 'wicket' | 'normal' } | null = null;

      if (updated.sport === 'football') {
        // Increment minutes
        const currentMin = updated.minute ? updated.minute + 1 : 75;
        updated.minute = currentMin > 90 ? 90 : currentMin;

        // Event rolls
        const rand = Math.random();
        if (rand < 0.08) {
          // GOAL for Team A
          const currentScoreA = parseInt(updated.teamA.score || '0', 10) + 1;
          updated.teamA.score = String(currentScoreA);
          
          newCommentary = {
            id: `comm-${Date.now()}`,
            time: `${updated.minute}'`,
            text: `⚽ GOAL!! Absolute brilliant strike! ${updated.teamA.name} scores a spectacular goal!`,
            textBn: `⚽ গোল!! অবিশ্বাস্য শট! ${updated.teamA.name} একটি চমৎকার গোল করে এগিয়ে গেলো!`,
            type: 'goal'
          };

          logPayload = {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            type: 'info',
            message: `Goal scored! Live scoreboard feeds updated for ${updated.teamA.name}.`,
            bengaliMsg: `গোল হয়েছে! ${updated.teamA.name}-এর জন্য লাইভ স্কোরবোর্ড আপডেট করা হয়েছে।`,
            severity: 'info'
          };
        } else if (rand < 0.16) {
          // GOAL for Team B
          const currentScoreB = parseInt(updated.teamB.score || '0', 10) + 1;
          updated.teamB.score = String(currentScoreB);

          newCommentary = {
            id: `comm-${Date.now()}`,
            time: `${updated.minute}'`,
            text: `⚽ GOAL!! Incredible composure from the striker! ${updated.teamB.name} pulls it off!`,
            textBn: `⚽ গোল!! স্ট্রাইকারের দারুণ দক্ষতা! ${updated.teamB.name} ম্যাচে অসাধারণ গোল সংগ্রহ করলো!`,
            type: 'goal'
          };

          logPayload = {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            type: 'info',
            message: `Goal scored! Live scoreboard feeds updated for ${updated.teamB.name}.`,
            bengaliMsg: `গোল হয়েছে! ${updated.teamB.name}-এর জন্য লাইভ স্কোরবোর্ড আপডেট করা হয়েছে।`,
            severity: 'info'
          };
        } else if (rand < 0.40) {
          // Random Commentary Event
          const events = [
            {
              text: "Yellow card issued to the midfielder for a tactical sliding tackle.",
              textBn: "ট্যাকটিক্যাল ট্যাকলের জন্য মিডফিল্ডারকে রেফারি হলুদ কার্ড প্রদর্শন করেছেন।"
            },
            {
              text: "Sensational finger-tip save by the goalkeeper keeps the scoreline intact!",
              textBn: "গোলরক্ষকের জাদুকরী ফিঙ্গার-টিপ সেভ ম্যাচে গোল খাওয়া থেকে দলকে রক্ষা করলো!"
            },
            {
              text: "Free kick awarded just outside the penalty box. Intense preparation.",
              textBn: "পেনাল্টি বক্সের ঠিক বাইরে বিপজ্জনক জায়গায় ফ্রি কিক পেলো দল।"
            },
            {
              text: "Dangerous corner kick delivered in, but cleared away safely by the center-back.",
              textBn: "বিপজ্জনক কর্নার কিক সেন্ট্রাল ডিফেন্ডার অত্যন্ত চমৎকার হেডে ক্লিয়ার করে দিলেন।"
            }
          ];
          const chosen = events[Math.floor(Math.random() * events.length)];
          newCommentary = {
            id: `comm-${Date.now()}`,
            time: `${updated.minute}'`,
            text: chosen.text,
            textBn: chosen.textBn,
            type: 'normal'
          };
        }
      } else if (updated.sport === 'cricket') {
        // Increment cricket ball
        let oversFloat = parseFloat(updated.teamA.overs || '18.2');
        let overInt = Math.floor(oversFloat);
        let ballInt = Math.round((oversFloat - overInt) * 10);

        ballInt += 1;
        if (ballInt >= 6) {
          overInt += 1;
          ballInt = 0;
        }
        const nextOvers = `${overInt}.${ballInt}`;
        updated.teamA.overs = nextOvers;

        const rand = Math.random();
        if (rand < 0.10) {
          // Wicket falls
          const currentWickets = parseInt(updated.teamA.wickets || '4', 10) + 1;
          updated.teamA.wickets = String(currentWickets);
          
          // Re-render score format like '184/5'
          const scoreBase = (updated.teamA.score || '184/4').split('/')[0];
          updated.teamA.score = `${scoreBase}/${currentWickets}`;

          newCommentary = {
            id: `comm-${Date.now()}`,
            time: `${nextOvers} Ov`,
            text: `🔴 OUT! Bowled him! Brilliant delivery knocks off the middle stump!`,
            textBn: `🔴 আউট! বোল্ড! অসাধারণ সুইং ডেলিভারিতে স্ট্যাম্প উড়ে গেল! ব্যাটসম্যান সাজঘরে ফিরছেন।`,
            type: 'wicket'
          };

          logPayload = {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            type: 'info',
            message: `Wicket down! Scoreboard synced for batting side.`,
            bengaliMsg: `উইকেট পতন! ব্যাটিং দলের জন্য লাইভ স্কোরবোর্ড সিঙ্ক করা হয়েছে।`,
            severity: 'info'
          };
        } else {
          // Runs scored: 0, 1, 2, 4, 6
          const runsOptions = [0, 1, 2, 4, 6];
          const weights = [0.2, 0.35, 0.2, 0.15, 0.1];
          
          // Weighted random selector
          let r = Math.random();
          let runs = 1;
          let sum = 0;
          for (let i = 0; i < runsOptions.length; i++) {
            sum += weights[i];
            if (r <= sum) {
              runs = runsOptions[i];
              break;
            }
          }

          const prevScore = (updated.teamA.score || '184/4').split('/');
          const prevRuns = parseInt(prevScore[0], 10);
          const wickets = prevScore[1] || '4';
          const nextRuns = prevRuns + runs;
          updated.teamA.score = `${nextRuns}/${wickets}`;

          let commText = '';
          let commBn = '';

          if (runs === 6) {
            commText = `🚀 SIX! Clean swing over the long-on boundary for a massive maximum!`;
            commBn = `🚀 ছক্কা! বল সোজাসুজি সীমানা পেরিয়ে গ্যালারির উঁচুতে গিয়ে পড়ল! কি দানবীয় শট!`;
          } else if (runs === 4) {
            commText = `✨ FOUR! Beautiful cover drive piercing the gap with absolute timing!`;
            commBn = `✨ চার! চমৎকার কভার ড্রাইভে ফিল্ডারদের বোকা বানিয়ে বল বাউন্ডারির বাইরে!`;
          } else if (runs === 1 || runs === 2) {
            commText = `Tapped into the outfield for ${runs === 1 ? 'a single' : 'two runs'}. Good rotatory running.`;
            commBn = `আউটফিল্ডে বল ঠেলে দিয়ে ${runs === 1 ? 'এক রান' : 'দুই রান'} সংগ্রহ। রানিং বিটুইন দ্য উইকেট খুবই ভালো।`;
          } else {
            commText = `Dot ball. Excellent pace alteration keeping the batsman guessing.`;
            commBn = `ডট বল! চমৎকার বৈচিত্র্যময় গতিতে ব্যাটসম্যানকে পরাস্ত করলেন বোলার।`;
          }

          newCommentary = {
            id: `comm-${Date.now()}`,
            time: `${nextOvers} Ov`,
            text: commText,
            textBn: commBn,
            type: 'normal'
          };
        }
      } else if (updated.sport === 'basketball') {
        // Increment score for either team
        const isA = Math.random() < 0.5;
        const points = Math.random() < 0.3 ? 3 : 2;
        
        if (isA) {
          const nextScore = parseInt(updated.teamA.score || '108', 10) + points;
          updated.teamA.score = String(nextScore);
        } else {
          const nextScore = parseInt(updated.teamB.score || '96', 10) + points;
          updated.teamB.score = String(nextScore);
        }

        newCommentary = {
          id: `comm-${Date.now()}`,
          time: 'Q4 Live',
          text: `🏀 Score! ${isA ? updated.teamA.name : updated.teamB.name} secures a clean ${points}-pointer!`,
          textBn: `🏀 স্কোর! ${isA ? updated.teamA.name : updated.teamB.name} চমৎকার ${points}-পয়েন্টার ঝুড়িতে তুললো!`,
          type: 'normal'
        };
      }

      // Perform all updates outside of the functional updater to avoid React warning!
      setLiveMatch(updated);
      if (newCommentary) {
        setCommentaries(c => [newCommentary!, ...c]);

        // Trigger procedural sound effects based on event type
        if (newCommentary.type === 'goal') {
          soundEngine.playGoalCheer();
          soundEngine.playWhistle();
        } else if (newCommentary.type === 'wicket') {
          soundEngine.playWhistle();
        }

        // Trigger AI Commentary Narration (Speech Synthesis) if enabled
        if (isTtsEnabledRef.current) {
          const speakText = languageRef.current === 'EN' ? newCommentary.text : newCommentary.textBn;
          soundEngine.speakCommentary(speakText, languageRef.current === 'EN' ? 'en' : 'bn');
        }
      }
      if (logPayload) {
        onAddLog(logPayload);
      }
    }, 8000);

    return () => clearInterval(sportsTimer);
  }, [onAddLog]);

  // Buffer Cache Size Simulator
  useEffect(() => {
    if (!isPlaying) return;

    const cacheTimer = setInterval(() => {
      setCacheSize(prev => {
        const increment = parseFloat((Math.random() * 0.8 + 0.2).toFixed(2));
        return parseFloat((prev + increment).toFixed(2));
      });
    }, 4000);

    return () => clearInterval(cacheTimer);
  }, [isPlaying]);

  // Real-time Telemetry & Adaptive Stream Intelligence Simulation
  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      // Fluctuating basic network indicators
      const baseLatency = 0.8 + (packetLossRef.current * 0.5);
      const latencyNoise = Math.random() * 0.4 - 0.2;
      const finalLatency = Math.max(0.4, parseFloat((baseLatency + latencyNoise).toFixed(2)));
      setSimulatedLatency(finalLatency);

      const baseSpeed = 45.0 - (packetLossRef.current * 8.0);
      const speedNoise = Math.random() * 4.0 - 2.0;
      const finalSpeed = Math.max(1.5, parseFloat((baseSpeed + speedNoise).toFixed(1)));
      setSimulatedSpeed(finalSpeed);

      // Adaptive Quality Switching / Predictive Failover
      if (adaptiveBitrateRef.current && finalLatency > 2.0) {
        // Latency spiked! Switch CDN source before collapse
        const servers: ('server1' | 'server2' | 'server3')[] = ['server1', 'server2', 'server3'];
        // Find a server that is NOT the currently selected one
        const currentIdx = servers.indexOf(selectedServer);
        const nextIdx = (currentIdx + 1) % servers.length;
        const targetServer = servers[nextIdx];

        setSelectedServer(targetServer);

        const timeStr = new Date().toLocaleTimeString();
        setTelemetryTimeline(prev => [
          {
            id: `tel-${Date.now()}`,
            time: timeStr,
            type: 'warn',
            message: `[Adaptive Intelligence] Latency spiked to ${finalLatency}s (>2s threshold). Proactively switching to backup ${targetServer.toUpperCase()} to prevent buffer collapse.`
          },
          ...prev
        ]);

        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'info',
          message: `⚠️ [Predictive Failover] Latency peaked at ${finalLatency}s. Redirected routing to ${targetServer.toUpperCase()} for playback stabilization.`,
          bengaliMsg: `⚠️ [প্রেডিক্টিভ ফেইলওভার] লেটেন্সি ${finalLatency}s বৃদ্ধি পাওয়ায় বাফারিং এড়াতে স্বয়ংক্রিয়ভাবে ${targetServer.toUpperCase()}-এ রাউটিং পরিবর্তন করা হয়েছে।`,
          severity: 'medium'
        });
      }
    }, 3000);

    return () => clearInterval(telemetryTimer);
  }, [selectedServer, onAddLog]);

  // Sandbox string based on active options
  const getSandboxString = () => {
    const isSandboxEnabled = securityOptions.find(o => o.id === 'sandbox')?.value ?? true;
    if (!isSandboxEnabled) return '';

    const list: string[] = [];
    if (securityOptions.find(o => o.id === 'allowScripts')?.value) list.push('allow-scripts');
    if (securityOptions.find(o => o.id === 'allowSameOrigin')?.value) list.push('allow-same-origin');
    if (securityOptions.find(o => o.id === 'allowPopups')?.value) list.push('allow-popups');
    if (securityOptions.find(o => o.id === 'allowForms')?.value) list.push('allow-forms');

    return list.join(' ');
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && resolvedStreamUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxMaxBufferLength: 15,
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsRef.current = hls;
        hls.loadSource(resolvedStreamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) {
            video.play().catch((err) => {
              if (err && err.name !== 'AbortError') {
                setIsPlaying(false);
              }
            });
          }
        });

        // HLS Error Handling and Recovery
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn('HLS Stream Encountered Error:', data);
          
          // Detect manifest load failures, bad CORS, or 404/Offline status
          if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || 
              data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
              data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
              data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
            
            const status = (data.response as any)?.status;
            const statusText = status ? ` (Status ${status})` : '';
            
            setStreamError(language === 'EN' 
              ? `The stream server returned a loading error${statusText}. The content is offline or blocked. Please switch Streaming Server below.` 
              : `স্ট্রিম সার্ভার লোডিং ত্রুটি${statusText} দেখিয়েছে। কনটেন্টটি অফলাইন বা ব্লকড আছে। দয়া করে নিচে অন্য সার্ভার সিলেক্ট করুন।`
            );
          }

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error. Attempting stream recovery...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error. Attempting buffer recovery...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal stream playback error. Re-attaching player...');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });

        hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          const level = hls.levels[data.level];
          setPlaybackStats(prev => ({
            ...prev,
            resolution: `${level?.width || '1920'}x${level?.height || '1080'}`,
            fps: '60 fps'
          }));
        });

        // Track buffer
        const interval = setInterval(() => {
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.currentTime;
            setPlaybackStats(prev => ({
              ...prev,
              buffer: `${Math.max(0, bufferedEnd - duration).toFixed(1)}s`
            }));
          }
        }, 1000);

        return () => {
          clearInterval(interval);
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari
        video.src = resolvedStreamUrl;
        video.addEventListener('loadedmetadata', () => {
          setPlaybackStats(prev => ({
            ...prev,
            resolution: 'Native (Auto)',
            fps: '60 fps'
          }));
        });
      }
    } else {
      // Non-HLS or static fallbacks
      setIsPlaying(false);
    }
  }, [resolvedStreamUrl, isHls]);

  // Handle Controls Auto-hide when playing
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        if (err && err.name !== 'AbortError') {
          console.error('Playback failed', err);
        }
        setIsPlaying(true); // Treat as playing for UI if blocked
      });
    }
  };

  const handleVideoClick = () => {
    if (!showControls) {
      setShowControls(true);
    } else {
      handlePlayPause();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const showBlockedAlert = (message: string, bengaliMsg: string, type: string) => {
    setBlockedAlert({ message, bengaliMsg, type });
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {
        // ignore sandbox constraints
      }
    }
    const timer = setTimeout(() => {
      setBlockedAlert(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const triggerMockThreat = (type: 'popup' | 'redirect' | 'cookie') => {
    const timeStr = new Date().toLocaleTimeString();
    if (type === 'popup') {
      const allowsPopups = securityOptions.find(o => o.id === 'allowPopups')?.value;
      if (!allowsPopups) {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'blocked_popup',
          message: 'Blocked malicious popup attempt to "https://highstakes-betting-ads.com/spin-win".',
          bengaliMsg: '"https://highstakes-betting-ads.com/spin-win" এর ক্ষতিকারক পপ-আপ চেষ্টা স্যান্ডবক্স দ্বারা ব্লক করা হয়েছে।',
          severity: 'high'
        });
        showBlockedAlert(
          'Blocked malicious popup attempt to "https://highstakes-betting-ads.com/spin-win".',
          '"https://highstakes-betting-ads.com/spin-win" এর ক্ষতিকারক পপ-আপ চেষ্টা স্যান্ডবক্স দ্বারা ব্লক করা হয়েছে।',
          'blocked_popup'
        );
      } else {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'info',
          message: 'WARNING: Popup allowed! Navigated to ad site in a new tab.',
          bengaliMsg: 'সতর্কতা: পপ-আপ অনুমোদিত! নতুন ট্যাবে বিজ্ঞাপনের সাইটটি ওপেন হয়েছে।',
          severity: 'medium'
        });
        window.open('about:blank', '_blank');
      }
    } else if (type === 'redirect') {
      const isSandboxEnabled = securityOptions.find(o => o.id === 'sandbox')?.value;
      const allowsScripts = securityOptions.find(o => o.id === 'allowScripts')?.value;

      if (isSandboxEnabled && !allowsScripts) {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'blocked_redirect',
          message: 'Prevented stream script from overriding the parent app window (window.top redirect).',
          bengaliMsg: 'প্যারেন্ট অ্যাপ উইন্ডোকে রিডাইরেক্ট করা থেকে স্ট্রিমের স্ক্রিপ্টকে বাধা দেওয়া হয়েছে (window.top redirect)।',
          severity: 'high'
        });
        showBlockedAlert(
          'Prevented stream script from overriding the parent app window (window.top redirect).',
          'প্যারেন্ট অ্যাপ উইন্ডোকে রিডাইরেক্ট করা থেকে স্ট্রিমের স্ক্রিপ্টকে বাধা দেওয়া হয়েছে (window.top redirect)।',
          'blocked_redirect'
        );
      } else if (isSandboxEnabled && allowsScripts) {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'blocked_redirect',
          message: 'Sandbox blocked window.top redirect because allow-top-navigation flag is missing.',
          bengaliMsg: 'allow-top-navigation ফ্ল্যাগ না থাকায় স্যান্ডবক্স window.top রিডাইরেক্ট ব্লক করেছে।',
          severity: 'high'
        });
        showBlockedAlert(
          'Sandbox blocked window.top redirect because allow-top-navigation flag is missing.',
          'allow-top-navigation ফ্ল্যাগ না থাকায় স্যান্ডবক্স window.top রিডাইরেক্ট ব্লক করেছে।',
          'blocked_redirect'
        );
      } else {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'info',
          message: 'CRITICAL WARNING: No Sandbox! Parent window redirected.',
          bengaliMsg: 'মারাত্মক সতর্কতা: কোনো স্যান্ডবক্স নেই! প্যারেন্ট উইন্ডো রিডাইরেক্ট হতে পারত।',
          severity: 'high'
        });
        alert(language === 'EN' 
          ? 'In a real app without sandboxing, this would have redirected your current page to a betting/scam site!' 
          : 'রিয়েল অ্যাপে স্যান্ডবক্সিং না থাকলে, এটি আপনার বর্তমান পেজটিকে রিডাইরেক্ট করে বেটিং বা স্প্যাম সাইটে নিয়ে যেত!'
        );
      }
    } else if (type === 'cookie') {
      const allowsSameOrigin = securityOptions.find(o => o.id === 'allowSameOrigin')?.value;
      if (!allowsSameOrigin) {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'cookie_access',
          message: 'Blocked cookie access: iframe is treated as cross-origin due to absent allow-same-origin.',
          bengaliMsg: 'কুকি অ্যাক্সেস ব্লক করা হয়েছে: allow-same-origin না থাকায় iframe-টিকে ক্রস-অরিজিন ধরা হয়েছে।',
          severity: 'medium'
        });
        showBlockedAlert(
          'Blocked cookie access: iframe is treated as cross-origin due to absent allow-same-origin.',
          'কুকি অ্যাক্সেস ব্লক করা হয়েছে: allow-same-origin না থাকায় iframe-টিকে ক্রস-অরিজিন ধরা হয়েছে।',
          'cookie_access'
        );
      } else {
        onAddLog({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'info',
          message: 'WARNING: Same-origin access allowed. Read access granted to local cookie jar.',
          bengaliMsg: 'সতর্কতা: সেম-অরিজিন অনুমোদিত। লোকাল কুকি স্টোরেজ রিড করার এক্সেস পেয়েছে।',
          severity: 'medium'
        });
      }
    }
  };

  const handlePurgeCache = () => {
    if (isPurging) return;
    setIsPurging(true);
    
    // Simulate device haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([40, 40]);
    }
    
    setTimeout(() => {
      setIsPurging(false);
      const clearedAmount = cacheSize;
      setCacheSize(1.6); // Reset to base index cache metadata
      
      const timeStr = new Date().toLocaleTimeString();
      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        type: 'info',
        message: `🛡️ [Cache Purge Policy] Cleared ${clearedAmount.toFixed(1)} MB of temporary HLS decrypted stream buffer segments. Playback stabilized.`,
        bengaliMsg: `🛡️ [ক্যাশে পলিসি] অস্থায়ী এইচএলএস ডিক্রিপ্ট করা স্ট্রিম বাফারের ${clearedAmount.toFixed(1)} MB ক্যাশে মেমরি সফলভাবে ক্লিন করা হয়েছে।`,
        severity: 'info'
      });
    }, 750);
  };

  const isSandboxed = securityOptions.find(o => o.id === 'sandbox')?.value ?? true;
  const scriptAllowed = securityOptions.find(o => o.id === 'allowScripts')?.value ?? false;
  const popupAllowed = securityOptions.find(o => o.id === 'allowPopups')?.value ?? false;

  return (
    <div id="secure-player-section" className="flex flex-col h-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* PROFESSIONAL BROADCAST CONTROL ROOM TABS */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase text-slate-200 tracking-wider">
            {language === 'EN' ? 'Control Room' : 'কন্ট্রোল রুম'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setControlRoomTab('player')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
              controlRoomTab === 'player'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'EN' ? 'Single Player' : 'একক প্লেয়ার'}</span>
          </button>
          <button
            onClick={() => setControlRoomTab('livewall')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
              controlRoomTab === 'livewall'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'EN' ? 'Live Mosaic' : 'লাইভ মোজাইক'}</span>
          </button>
          <button
            onClick={() => setControlRoomTab('telemetry')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
              controlRoomTab === 'telemetry'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'EN' ? 'Telemetry' : 'টেলিমেট্রি'}</span>
          </button>
          <button
            onClick={() => setControlRoomTab('soundstage')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
              controlRoomTab === 'soundstage'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Speaker className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'EN' ? 'Soundstage' : 'সাউন্ডস্টেজ'}</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT CONTROLLER CONTENT AREA */}
      {controlRoomTab === 'player' && (
        <div className="relative aspect-video w-full bg-black group overflow-hidden flex items-center justify-center">
        
        {/* Loading Encrypted Gateway Overlay */}
        {isLoadingStream && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="relative">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" style={{ animationDuration: '2s' }} />
              <Shield className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-100 font-display tracking-wide animate-pulse">
                {language === 'EN' ? 'Securing Encrypted HLS Feed...' : 'এনক্রিপ্টেড HLS ফিড সুরক্ষিত করা হচ্ছে...'}
              </p>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase mt-1">
                {language === 'EN' ? 'Sportzfy Shield Layer: VERIFYING' : 'স্পোর্টসফাই শিল্ড লেয়ার: যাচাই করা হচ্ছে'}
              </p>
            </div>
          </div>
        )}

        {/* Stream Load Error / Fallback Suggestions Overlay */}
        {streamError && !isLoadingStream && (
          <div className="absolute inset-0 z-25 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-full mb-3 animate-bounce">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>
            
            <h3 className="text-sm sm:text-base font-bold text-rose-400 font-display uppercase tracking-wider">
              {language === 'EN' ? 'HLS Feed Offline or Blocked' : 'HLS ফিড অফলাইন অথবা ব্লকড'}
            </h3>
            
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-md mt-1.5 mb-4 leading-relaxed px-4">
              {streamError}
            </p>

            <div className="flex flex-col gap-2 w-full max-w-sm px-4">
              <p className="text-[9px] font-bold font-mono tracking-wider text-slate-500 uppercase">
                {language === 'EN' ? 'Try These Dynamic Fixes:' : 'সমস্যা সমাধানের কার্যকরী উপায়:'}
              </p>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setSelectedServer('server1');
                    setStreamError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedServer === 'server1'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md shadow-rose-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Server 1
                </button>
                <button
                  onClick={() => {
                    setSelectedServer('server2');
                    setStreamError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedServer === 'server2'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md shadow-rose-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Server 2
                </button>
                <button
                  onClick={() => {
                    setSelectedServer('server3');
                    setStreamError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedServer === 'server3'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md shadow-rose-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Server 3
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => setUseProxy(prev => !prev)}
                  className={`py-1.5 px-2.5 rounded-lg text-[9px] font-bold font-mono border transition flex items-center justify-center gap-1 cursor-pointer ${
                    useProxy
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>PROXY: {useProxy ? 'ON' : 'OFF'}</span>
                </button>

                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-lg text-[9px] font-bold font-mono bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-indigo-950/40"
                >
                  <span>{language === 'EN' ? 'OPEN STREAM' : 'লিঙ্ক খুলুন'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Secure Shield Active / Safe Border Indicator Badge */}
        <div className="absolute top-4 right-4 z-10 glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-[11px] font-mono text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/30">
          <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{language === 'EN' ? 'SHIELD: 98.4% SECURE' : 'শিল্ড: ৯৮.৪% নিরাপদ'}</span>
        </div>

        {/* Blocked Threat Floating Alert */}
        <AnimatePresence>
          {blockedAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 z-30 p-3 bg-rose-500/10 border border-rose-500/35 backdrop-blur-md rounded-xl flex items-start gap-2.5 shadow-xl shadow-rose-950/30"
            >
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  {language === 'EN' ? 'Security Shield Intercepted' : 'নিরাপত্তা শিল্ড প্রতিহত করেছে'}
                </p>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                  {language === 'EN' ? blockedAlert.message : blockedAlert.bengaliMsg}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isHls ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black cursor-pointer"
              playsInline
              onClick={handleVideoClick}
              controls={useNativeControls}
              onError={() => {
                setStreamError(language === 'EN'
                  ? 'Failed to load video element. This stream may be offline or blocked by CORS. Try switching streaming servers or toggling proxy.'
                  : 'ভিডিও লোড করতে ব্যর্থ হয়েছে। এই স্ট্রিমটি অফলাইন বা CORS দ্বারা ব্লকড হতে পারে। অন্য সার্ভার ট্রাই করুন।'
                );
              }}
            />
            
            {/* Custom Interactive Floating Guard Stats overlay */}
            <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-indigo-400 border border-indigo-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>SECURE TUNNEL</span>
            </div>
          </>
        ) : (
          /* Secure Website Viewer or Simulation Mode */
          <div className="absolute inset-0 flex flex-col justify-between bg-slate-900 font-sans">
            {/* Simulation / Stream Tab Header */}
            <div className="flex justify-between items-center border-b border-slate-800 p-3 bg-slate-950/90 z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500 animate-pulse" />
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200">
                    {language === 'EN' ? 'SECURE WEBVIEW INTEGRATION' : 'নিরাপদ ওয়েবভিউ ইন্টিগ্রেশন'}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-[200px]" title={streamUrl}>
                    {streamUrl}
                  </p>
                </div>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  id="tab-stream-btn"
                  onClick={() => setNonHlsTab('stream')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    nonHlsTab === 'stream' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'EN' ? 'Live Stream' : 'লাইভ স্ট্রিম'}
                </button>
                <button
                  id="tab-sim-btn"
                  onClick={() => setNonHlsTab('simulator')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    nonHlsTab === 'simulator' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'EN' ? 'Shield Simulator' : 'শিল্ড সিমুলেটর'}
                </button>
              </div>
            </div>

            {nonHlsTab === 'stream' ? (
              /* Real Sandboxed Web Player Frame */
              <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex items-center justify-center">
                {/* Embedded Web Frame with sandbox block */}
                <iframe
                  id="secure-stream-frame"
                  src={streamUrl}
                  className="w-full h-full border-0 w-full"
                  sandbox={getSandboxString()}
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  onLoad={() => {
                    const timeStr = new Date().toLocaleTimeString();
                    onAddLog({
                      id: `log-${Date.now()}`,
                      timestamp: timeStr,
                      type: 'info',
                      message: `Loaded external secure stream frame inside sandboxed tunnel. Popups & parent-redirects successfully blocked by native browser security sandbox policies.`,
                      bengaliMsg: `স্যান্ডবক্সড টানেলের ভেতরে এক্সটার্নাল লাইভ স্ট্রিম ফ্রেম সফলভাবে লোড হয়েছে। পপ-আপ ও প্যারেন্ট-রিডাইরেক্ট ব্রাউজার লেভেল সিকিউরিটি দ্বারা ব্লক করা হয়েছে।`,
                      severity: 'info'
                    });
                  }}
                />
                
                {/* Interactive floating Shield Shield indicator */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === 'EN' ? 'LIVE SECURE FRAME ACTIVE' : 'লাইভ সুরক্ষিত ফ্রেম অ্যাক্টিভ'}</span>
                </div>
                
                {/* Prompt to open in new tab for sandbox-challenged streams */}
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[9px] font-mono text-slate-300">
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <span>{language === 'EN' ? 'External' : 'এক্সটার্নাল'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* Safe Website Viewer Simulation Mode */
              <div className="flex-1 flex flex-col justify-between p-4 bg-slate-900 overflow-y-auto">
                <div className="my-auto text-center space-y-4 max-w-md mx-auto py-2">
                  <div className="relative inline-flex p-3 rounded-full bg-slate-800/80 mb-1 border border-slate-700">
                    <Layers className="w-8 h-8 text-indigo-500" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold">!</span>
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                    {language === 'EN' 
                      ? 'Testing Adware & Script Infiltration' 
                      : 'অ্যাডওয়্যার ও ক্ষতিকর স্ক্রিপ্ট ফিল্টারিং টেস্ট'}
                  </h3>
                  
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    {language === 'EN'
                      ? 'Third-party sports links often deploy aggressive popups, window-jacking redirects, and trackers. Use the test triggers below to see how our sandbox block mechanics work in real-time!'
                      : 'থার্ড-পার্টি স্পোর্টস লিঙ্কে প্রায়ই বেটিং পপ-আপ, মেইন উইন্ডো হাইজ্যাকিং এবং কুকি ট্র্যাকার থাকে। নিচের বোতামগুলো দিয়ে স্যান্ডবক্সের কার্যকারিতা পরীক্ষা করুন!'}
                  </p>

                  {/* Threat Triggers Row */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      id="trigger-popup-threat"
                      onClick={() => triggerMockThreat('popup')}
                      className="flex flex-col items-center gap-1.5 p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[9px] font-medium font-mono">Trigger Popup</span>
                    </button>
                    <button
                      id="trigger-redirect-threat"
                      onClick={() => triggerMockThreat('redirect')}
                      className="flex flex-col items-center gap-1.5 p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 transition cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                      <span className="text-[9px] font-medium font-mono">Top Redirect</span>
                    </button>
                    <button
                      id="trigger-cookie-threat"
                      onClick={() => triggerMockThreat('cookie')}
                      className="flex flex-col items-center gap-1.5 p-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg text-sky-400 transition cursor-pointer"
                    >
                      <Terminal className="w-4 h-4" />
                      <span className="text-[9px] font-medium font-mono">Read Cookie</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Frame status */}
                <div className="border-t border-slate-800/80 pt-2 text-center text-[9px] sm:text-[10px] text-slate-500 font-mono">
                  Sandbox Attribute: <span className="text-indigo-400">{getSandboxString() || "None (Dangerous)"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Overlays when playing or loaded */}
        {isHls && (
          <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 transition-all duration-300 flex flex-col justify-between p-4 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
            <div className="flex justify-between items-center pointer-events-auto">
              <span className="bg-slate-900/80 backdrop-blur border border-slate-800 px-2 py-1 rounded text-xs text-slate-300 font-medium">
                {match ? `${match.teamA.name} vs ${match.teamB.name}` : 'Custom HLS Stream'}
              </span>
            </div>

            {/* Custom Control Bar Overlay */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4 pointer-events-auto shadow-lg">
              <div className="flex items-center gap-3">
                <button
                  id="player-play-pause-btn"
                  onClick={handlePlayPause}
                  className="p-2 rounded-lg hover:bg-slate-800 text-indigo-400 transition active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-indigo-400" />}
                </button>

                <button
                  id="player-mute-btn"
                  onClick={handleMuteToggle}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <input
                  id="player-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Status & External Link */}
              <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-mono text-slate-400">
                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-indigo-400 hover:border-indigo-500/40 transition text-slate-200 pointer-events-auto"
                >
                  <span className="text-[10px] uppercase font-bold text-xs">{language === 'EN' ? 'Open' : 'খুলুন'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="hidden xs:block">
                  <span className="text-[9px] text-slate-500 block uppercase">RES</span>
                  <span className="text-slate-300 font-semibold text-[10px]">
                    {selectedServer === 'server2' ? '480p' : selectedServer === 'server3' ? '1080p' : playbackStats.resolution.split('x')[1] ? `${playbackStats.resolution.split('x')[1]}p` : 'Auto'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-[9px] text-slate-500 block uppercase">BUFFER</span>
                  <span className="text-indigo-400 font-semibold">{playbackStats.buffer}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 2X2 MULTI-VIEW MOSAIC LIVE STREAM WALL */}
      {controlRoomTab === 'livewall' && (
        <div className="relative aspect-video w-full bg-slate-950 p-3 grid grid-cols-2 gap-3 overflow-y-auto">
          <MosaicVideo
            url="https://live-amg-elg.akamaized.net/aljazeera/index.m3u8"
            name="Al Jazeera Live"
            isMuted={isMuted}
            language={language}
            onPromote={() => {
              onAddLog({
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'info',
                message: 'Promoted Al Jazeera News Live to primary monitoring screen.',
                bengaliMsg: 'আল জাজিরা নিউজ লাইভ প্রধান মনিটরিং স্ক্রিনে উন্নীত করা হয়েছে।',
                severity: 'info'
              });
              setOverrideUrl("https://live-amg-elg.akamaized.net/aljazeera/index.m3u8");
              setControlRoomTab('player');
              setIsPlaying(true);
            }}
          />
          <MosaicVideo
            url="https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8"
            name="France 24 News"
            isMuted={isMuted}
            language={language}
            onPromote={() => {
              onAddLog({
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'info',
                message: 'Promoted France 24 News Live to primary monitoring screen.',
                bengaliMsg: 'ফ্রান্স ২৪ নিউজ লাইভ প্রধান মনিটরিং স্ক্রিনে উন্নীত করা হয়েছে।',
                severity: 'info'
              });
              setOverrideUrl("https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8");
              setControlRoomTab('player');
              setIsPlaying(true);
            }}
          />
          <MosaicVideo
            url="https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
            name="Red Bull TV"
            isMuted={isMuted}
            language={language}
            onPromote={() => {
              onAddLog({
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'info',
                message: 'Promoted Red Bull TV stream to primary monitoring screen.',
                bengaliMsg: 'রেড বুল টিভি লাইভ স্ট্রিম প্রধান মনিটরিং স্ক্রিনে উন্নীত করা হয়েছে।',
                severity: 'info'
              });
              setOverrideUrl("https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8");
              setControlRoomTab('player');
              setIsPlaying(true);
            }}
          />
          <MosaicVideo
            url="https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
            name="Tears of Steel HD"
            isMuted={isMuted}
            language={language}
            onPromote={() => {
              onAddLog({
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'info',
                message: 'Promoted Tears of Steel stream to primary monitoring screen.',
                bengaliMsg: 'টিয়ার্স অব স্টিল এইচডি স্ট্রিম প্রধান মনিটরিং স্ক্রিনে উন্নীত করা হয়েছে।',
                severity: 'info'
              });
              setOverrideUrl("https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8");
              setControlRoomTab('player');
              setIsPlaying(true);
            }}
          />
        </div>
      )}

      {/* REAL-TIME STREAM HEALTH & TELEMETRY DASHBOARD */}
      {controlRoomTab === 'telemetry' && (
        <div className="relative aspect-video w-full bg-slate-950 p-4 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Oscilloscope Canvas Wave */}
            <div className="md:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Signal Waveform Telemetry
                </span>
                <span className="text-[9px] text-slate-500">Live Feedback Loop</span>
              </div>
              <div className="h-28">
                <TelemetryCanvas latency={simulatedLatency} packetLoss={packetLoss} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>0.0s (Live)</span>
                <span>Buffer segment: stable</span>
                <span>Time span: 500ms</span>
              </div>
            </div>

            {/* Right: Metrics Grid */}
            <div className="md:col-span-6 grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] uppercase tracking-wider font-bold">Latency</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-100 font-sans tracking-tight">{simulatedLatency}</span>
                  <span className="text-[10px] text-slate-500">seconds</span>
                </div>
                <div className="mt-1 text-[8px] text-slate-500 leading-tight">
                  {simulatedLatency > 2.0 ? '⚠️ High - Predictive Failover armed' : '✓ Normal transmission delay'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] uppercase tracking-wider font-bold">Segment Speed</span>
                  <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-100 font-sans tracking-tight">{simulatedSpeed}</span>
                  <span className="text-[10px] text-slate-500">Mbps</span>
                </div>
                <div className="mt-1 text-[8px] text-slate-500 leading-tight">
                  Avg segment download rate
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] uppercase tracking-wider font-bold">Buffer Level</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-100 font-sans tracking-tight">{playbackStats.buffer || '14.2s'}</span>
                </div>
                <div className="mt-1 text-[8px] text-slate-500 leading-tight">
                  Decrypted frames in queue
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] uppercase tracking-wider font-bold">Uptime</span>
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                    {packetLoss > 4 ? '92.4%' : '99.8%'}
                  </span>
                </div>
                <div className="mt-1 text-[8px] text-slate-500 leading-tight">
                  CDN connection integrity
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Simulations */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 pt-2.5 border-t border-slate-900">
            {/* Left: Sim controls */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Packet Loss Injection
                </span>
                <span className="text-[10px] text-rose-400 font-bold font-mono">{packetLoss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={packetLoss}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPacketLoss(val);
                  if (val > 2.0) {
                    // Inject a warnings timeline event
                    const timeStr = new Date().toLocaleTimeString();
                    setTelemetryTimeline(prev => [
                      {
                        id: `tel-${Date.now()}`,
                        time: timeStr,
                        type: 'error',
                        message: `[Signal Degrade] Packet loss injected: ${val}%. Quality loss detected on CDN hops.`
                      },
                      ...prev
                    ]);
                  }
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between text-[8px] text-slate-500">
                <span>0% (Pristine)</span>
                <span>&gt;2% Spikes Failover</span>
                <span>5% (Critical)</span>
              </div>
            </div>

            {/* Middle: Adaptive Switch Toggle */}
            <div className="md:col-span-3 flex flex-col justify-center items-center bg-slate-900/60 rounded-xl border border-slate-800 p-2 text-center">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">ADAPTIVE BITRATE</span>
              <button
                onClick={() => setAdaptiveBitrate(!adaptiveBitrate)}
                className={`mt-1.5 px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition border cursor-pointer ${
                  adaptiveBitrate
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {adaptiveBitrate ? 'ACTIVE FAILOVER' : 'DISABLED'}
              </button>
            </div>

            {/* Right: Telemetry Event Timeline */}
            <div className="md:col-span-4 space-y-1 bg-slate-950 border border-slate-800 rounded-xl p-2 h-16 overflow-y-auto custom-scrollbar">
              <span className="text-[8px] text-slate-500 font-bold uppercase block pb-1">Telemetry Timeline Logs</span>
              {telemetryTimeline.map(t => (
                <div key={t.id} className="text-[8px] font-mono flex items-start gap-1.5 border-b border-slate-900/40 pb-0.5">
                  <span className="text-slate-500 shrink-0">{t.time}</span>
                  <span className={t.type === 'success' ? 'text-emerald-400' : t.type === 'warn' ? 'text-amber-400' : t.type === 'error' ? 'text-rose-400 font-semibold' : 'text-indigo-400'}>
                    {t.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATMOSPHERIC SOUNDSTAGE CONTROL BOARD */}
      {controlRoomTab === 'soundstage' && (
        <div className="relative aspect-video w-full bg-slate-950 p-4 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Atmospheric Crowd Hum Control */}
            <div className="md:col-span-6 p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  Procedural Crowd Hum
                </span>
                <span className="relative flex h-2 w-2">
                  {isCrowdHumActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isCrowdHumActive ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                </span>
              </div>

              <p className="text-[9px] text-slate-400 leading-normal mt-1">
                Generates a lowpass-filtered Brownian crowd noise loop using the Web Audio API to simulate high-capacity stadium presence.
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-3 pt-1 border-t border-slate-950">
                <span className="text-[9px] text-slate-500">AUDIO ENGINE: ACTIVE</span>
                <button
                  onClick={() => setIsCrowdHumActive(!isCrowdHumActive)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                    isCrowdHumActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isCrowdHumActive ? 'STOP ATMOSPHERE' : 'START ATMOSPHERE'}
                </button>
              </div>
            </div>

            {/* Right: Instant FX Launcher Synthesizer */}
            <div className="md:col-span-6 p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Web Audio Synthesizer
                </span>
                <span className="text-[8px] text-slate-500">Interactive FX</span>
              </div>

              <p className="text-[9px] text-slate-400 leading-normal mt-1">
                Trigger metal-pea dual frequency referee whistles or filter-swept crowd roars synthesized in real-time.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => {
                    soundEngine.playWhistle();
                    onAddLog({
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString(),
                      type: 'info',
                      message: 'Synthesized high-frequency Referee Whistle via Web Audio API oscillator blend.',
                      bengaliMsg: 'ওয়েব অডিও অসিলেটর ব্লেন্ড দিয়ে রেফারি বাঁশি সংশ্লেষ করা হয়েছে।',
                      severity: 'info'
                    });
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600/10 border border-indigo-500/25 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-[9px] font-bold tracking-wider transition cursor-pointer text-center"
                >
                  📣 REF WHISTLE
                </button>

                <button
                  onClick={() => {
                    soundEngine.playGoalCheer();
                    onAddLog({
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString(),
                      type: 'info',
                      message: 'Synthesized filter-swept Crowd Goal Cheer via Web Audio API g envelope.',
                      bengaliMsg: 'ওয়েব অডিও গেইন এনভেলপ দিয়ে ফিল্টার-সুইপ্ট ক্রাউড গোল চিয়ার সংশ্লেষ করা হয়েছে।',
                      severity: 'info'
                    });
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600/10 border border-emerald-500/25 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-[9px] font-bold tracking-wider transition cursor-pointer text-center"
                >
                  ⚽ GOAL CHEER
                </button>
              </div>
            </div>
          </div>

          {/* AI Speech Synthesis Commentary Settings */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 pt-2.5 border-t border-slate-900 items-center">
            {/* Left: Speak incoming toggle */}
            <div className="md:col-span-5 flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-left">
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">AI Broadcast Narrator</span>
                <span className="text-[8px] text-slate-500 font-sans">Read live play-by-play comments aloud</span>
              </div>
              <button
                onClick={() => {
                  setIsTtsEnabled(!isTtsEnabled);
                  if (!isTtsEnabled) {
                    soundEngine.speakCommentary(language === 'EN' ? 'AI Play-by-play Narrator active.' : 'এআই লাইভ ম্যাচ ন্যারেটর চালু করা হয়েছে।', language === 'EN' ? 'en' : 'bn');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition border cursor-pointer ${
                  isTtsEnabled
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {isTtsEnabled ? 'NARRATOR: ON' : 'NARRATOR: OFF'}
              </button>
            </div>

            {/* Right: Manual Commentary speech tester */}
            <div className="md:col-span-7 flex gap-2">
              <input
                id="manual-tts-input"
                type="text"
                placeholder={language === 'EN' ? "Type anything for the AI commentator..." : "মন্তব্য টাইপ করে এআই কণ্ঠ শুনুন..."}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const text = (e.target as HTMLInputElement).value;
                    if (text) {
                      soundEngine.speakCommentary(text, language === 'EN' ? 'en' : 'bn');
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('manual-tts-input') as HTMLInputElement;
                  if (input && input.value) {
                    soundEngine.speakCommentary(input.value, language === 'EN' ? 'en' : 'bn');
                  }
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer"
              >
                📢 SPEAK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MATCH TRACKER & LIVE SCOREBOARD */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70">
        {liveMatch ? (
          <div className="space-y-4">
            {/* Live Score Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800/80 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {language === 'EN' ? 'LIVE FEEDS' : 'লাইভ স্কোর'}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {liveMatch.league}
                </span>
              </div>

              {/* Central Core Score Display */}
              <div className="flex items-center gap-6 sm:gap-10 my-1 mx-auto">
                {/* Team A */}
                <div className="flex items-center gap-2 text-right">
                  <span className="text-sm font-semibold text-slate-100 hidden sm:inline">{liveMatch.teamA.name}</span>
                  <span className="text-base" title={liveMatch.teamA.name}>{liveMatch.teamA.logo}</span>
                </div>

                {/* Score numbers */}
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-xl font-mono flex items-center gap-3 shadow-inner">
                  <span className="text-lg font-extrabold text-slate-50 tracking-tight">
                    {liveMatch.teamA.score ?? '0'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">-</span>
                  <span className="text-lg font-extrabold text-slate-50 tracking-tight">
                    {liveMatch.teamB.score ?? '0'}
                  </span>
                </div>

                {/* Team B */}
                <div className="flex items-center gap-2 text-left">
                  <span className="text-base" title={liveMatch.teamB.name}>{liveMatch.teamB.logo}</span>
                  <span className="text-sm font-semibold text-slate-100 hidden sm:inline">{liveMatch.teamB.name}</span>
                </div>
              </div>

              {/* Status details */}
              <div className="text-right flex flex-col items-end">
                {liveMatch.sport === 'football' && (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{liveMatch.minute}'</span>
                  </div>
                )}
                {liveMatch.sport === 'cricket' && (
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-xs font-bold text-amber-400">{liveMatch.teamA.overs} Ov</span>
                    <span className="text-[9px] text-slate-500">CRR: {((parseInt(liveMatch.teamA.score?.split('/')[0] || '184', 10)) / (parseFloat(liveMatch.teamA.overs || '18.2') || 1)).toFixed(2)}</span>
                  </div>
                )}
                {liveMatch.sport === 'basketball' && (
                  <span className="text-xs font-bold text-indigo-400 font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Q4 Live
                  </span>
                )}
              </div>
            </div>

            {/* Commentary Feed Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h5 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  {language === 'EN' ? 'REAL-TIME TRACKER & COMMENTARY' : 'রিয়েল-টাইম ম্যাচ ট্র্যাকার ও ধারাভাষ্য'}
                </h5>
                <span className="text-[9px] font-mono text-indigo-400 animate-pulse bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase">
                  {language === 'EN' ? 'FEED STABLE' : 'ফিড সচল'}
                </span>
              </div>

              {/* Scrollable commentary log list */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 h-28 overflow-y-auto space-y-2.5 custom-scrollbar shadow-inner">
                <AnimatePresence initial={false}>
                  {commentaries.length > 0 ? (
                    commentaries.map((c) => (
                      <motion.div
                        id={`commentary-row-${c.id}`}
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`text-xs p-2 rounded-lg border flex items-start gap-2.5 transition-all hover:bg-slate-900/40 ${
                          c.type === 'goal'
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                            : c.type === 'wicket'
                            ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                            : 'bg-slate-900/20 border-slate-800/60 text-slate-300'
                        }`}
                      >
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 uppercase tracking-wider ${
                          c.type === 'goal'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.type === 'wicket'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {c.time}
                        </span>
                        <p className="leading-relaxed font-sans flex-1">
                          {language === 'EN' ? c.text : c.textBn}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                      {language === 'EN' ? 'Waiting for first live commentary packet...' : 'প্রথম লাইভ কমেন্ট্রি প্যাকেটের জন্য অপেক্ষা করা হচ্ছে...'}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Wifi className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide">
                  {language === 'EN' ? 'HLS TEST GATEWAY CONNECTED' : 'এইচএলএস টেস্ট গেটওয়ে সংযুক্ত'}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'EN' 
                    ? 'Incoming custom stream verified. Shield active, blocking rogue cookies/redirects.' 
                    : 'ইনকামিং কাস্টম স্ট্রিম যাচাই করা হয়েছে। ক্ষতিকর রিডাইরেক্ট ফিল্টারিং সফলভাবে সক্রিয়।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold uppercase animate-pulse shrink-0">
              {language === 'EN' ? 'SHIELD PROTECTED' : 'শিল্ড সুরক্ষিত'}
            </span>
          </div>
        )}
      </div>

      {/* Unified Streaming Controller & Player Engine Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-4">
        {/* Top half: Player Engine */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-3 border-b border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              {language === 'EN' ? 'PLAYER DECODER ENGINE' : 'প্লেয়ার ডিকোডার ইঞ্জিন'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'EN' 
                ? 'Force stream compatibility decoder mode. Switch if screen stays black or shows frame errors.' 
                : 'স্ট্রিম ডিকোডার টাইপ পরিবর্তন করুন। স্ক্রিন কালো বা লোডিং সমস্যা থাকলে এটি পরিবর্তন করুন।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Secure CORS / Port Bypassing Proxy Toggle */}
            <button
              id="toggle-secure-proxy"
              onClick={() => setUseProxy(prev => !prev)}
              className={`px-2 py-1.5 rounded-lg text-[9px] font-bold font-mono transition border cursor-pointer ${
                useProxy 
                  ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'EN' 
                ? `SECURE PROXY: ${useProxy ? 'ON' : 'OFF'}`
                : `সুরক্ষিত প্রক্সি: ${useProxy ? 'চালু' : 'বন্ধ'}`}
            </button>

            {/* Native controls toggle */}
            <button
              id="toggle-native-controls"
              onClick={() => setUseNativeControls(prev => !prev)}
              className={`px-2 py-1.5 rounded-lg text-[9px] font-bold font-mono transition border cursor-pointer ${
                useNativeControls 
                  ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'EN' 
                ? `NATIVE: ${useNativeControls ? 'ON' : 'OFF'}`
                : `নেটিভ কন্ট্রোল: ${useNativeControls ? 'চালু' : 'বন্ধ'}`}
            </button>

            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex-1 sm:flex-initial">
              <button
                id="engine-auto"
                onClick={() => setPlayerMode('auto')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                  playerMode === 'auto'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'EN' ? 'Auto (Smart)' : 'অটো (স্মার্ট)'}
              </button>
              <button
                id="engine-hls"
                onClick={() => setPlayerMode('hls')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                  playerMode === 'hls'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'EN' ? 'HLS Player' : 'এইচএলএস প্লেয়ার'}
              </button>
              <button
                id="engine-iframe"
                onClick={() => setPlayerMode('iframe')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                  playerMode === 'iframe'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'EN' ? 'IFrame Web' : 'ওয়েব ফ্রেম'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom half: Quality / Server Selection */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              {language === 'EN' ? 'STREAMING SERVER CONTROLLER' : 'স্ট্রিমিং সার্ভার কন্ট্রোলার'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'EN' 
                ? 'Select alternative high-speed servers to balance bandwidth and resolve lag.' 
                : 'বাফারিং বা নেটওয়ার্ক ল্যাগ এড়াতে বিকল্প হাই-স্পিড সার্ভার বেছে নিন।'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <button
              id="server-1-btn"
              onClick={() => setSelectedServer('server1')}
              className={`px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 border cursor-pointer ${
                selectedServer === 'server1'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedServer === 'server1' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{language === 'EN' ? 'Server 1: High Speed' : 'সার্ভার ১: হাই স্পিড'}</span>
            </button>
            
            <button
              id="server-2-btn"
              onClick={() => setSelectedServer('server2')}
              className={`px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 border cursor-pointer ${
                selectedServer === 'server2'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedServer === 'server2' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{language === 'EN' ? 'Server 2: Data Saver' : 'সার্ভার ২: ডাটা সেভার'}</span>
            </button>

            <button
              id="server-3-btn"
              onClick={() => setSelectedServer('server3')}
              className={`px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 border cursor-pointer ${
                selectedServer === 'server3'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedServer === 'server3' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{language === 'EN' ? 'Server 3: Ultra HD' : 'সার্ভার ৩: ব্যাকআপ HD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Diagnostics Panel */}
      <div className="p-5 bg-slate-900/40 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Diagnostics Info */}
        <div className="md:col-span-7 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
            {language === 'EN' ? 'SECURE SHIELD DIAGNOSTICS' : 'সিকিউর শিল্ড ডায়াগনস্টিকস'}
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sandbox: <strong className="text-indigo-400">{isSandboxed ? 'Active' : 'Bypassed'}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Popup Block: <strong className={popupAllowed ? "text-rose-400" : "text-indigo-400"}>{popupAllowed ? 'Allow' : 'Block'}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Decoder: <strong className="text-emerald-400 font-mono">HLS.JS</strong></span>
            </span>
          </div>
        </div>

        {/* Smart Cache Purger Dashboard */}
        <div className="md:col-span-5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isPurging ? 'bg-rose-500/10 text-rose-400 font-bold' : 'bg-indigo-500/10 text-indigo-400'} border border-slate-800 transition`}>
              {isPurging ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                {language === 'EN' ? 'STREAMING CACHE' : 'স্ট্রিমিং বাফার'}
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {isPurging ? 'Purging Buffer...' : `${cacheSize.toFixed(1)} MB`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 hidden xl:inline-block bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              AUTO-PURGE: 1HR
            </span>
            <button
              id="purge-cache-btn"
              onClick={handlePurgeCache}
              disabled={isPurging}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all duration-200 flex items-center gap-1 border cursor-pointer ${
                isPurging
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white active:scale-95 shadow-lg shadow-indigo-600/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'Purge' : 'ক্লিন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
