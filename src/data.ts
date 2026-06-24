import { Match } from './types';

export const mockMatches: Match[] = [
  {
    id: 'm-sportzfy-1',
    sport: 'football',
    league: 'Sportzfy Premium CDN',
    status: 'live',
    teamA: {
      name: 'Sportzfy Server 1',
      logo: '⚡',
      score: 'LIVE'
    },
    teamB: {
      name: 'xBeat CDN Stream',
      logo: '🎥',
      score: '1080p'
    },
    time: 'Live',
    minute: 90,
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'Sportzfy Premium CDN'
  },
  {
    id: 'm-sportzfy-2',
    sport: 'cricket',
    league: 'Sportzfy Backup Server',
    status: 'live',
    teamA: {
      name: 'Sportzfy Server 2',
      logo: '🔥',
      score: 'LIVE'
    },
    teamB: {
      name: 'AGL002 Gateway',
      logo: '🏏',
      score: 'HD'
    },
    time: 'Live',
    streamUrl: 'https://cvt-s2.agl002.online',
    category: 'Sportzfy Backup Server'
  },
  {
    id: 'm-sportzfy-3',
    sport: 'cricket',
    league: 'Spix Streaming Portal',
    status: 'live',
    teamA: {
      name: 'Sportzfy Server 3',
      logo: '🔮',
      score: 'LIVE'
    },
    teamB: {
      name: 'Spix CDN Gateway',
      logo: '⚾',
      score: 'Auto'
    },
    time: 'Live',
    streamUrl: 'https://spix.agl002.online',
    category: 'Spix Streaming Portal'
  },
  {
    id: 'm1',
    sport: 'football',
    league: 'UEFA Champions League',
    status: 'live',
    teamA: {
      name: 'Real Madrid',
      logo: '👑',
      score: '2'
    },
    teamB: {
      name: 'Manchester City',
      logo: '🩵',
      score: '1'
    },
    time: 'Live',
    minute: 74,
    streamUrl: 'https://test-streams.mux.dev/x36xhg/movie.m3u8',
    category: 'Champions League'
  },
  {
    id: 'm2',
    sport: 'cricket',
    league: 'IPL 2026',
    status: 'live',
    teamA: {
      name: 'Kolkata Knight Riders',
      logo: '💜',
      score: '184/4',
      overs: '18.2',
      wickets: '4'
    },
    teamB: {
      name: 'Mumbai Indians',
      logo: '💙',
      score: '0/0',
      overs: '0.0',
      wickets: '0'
    },
    time: 'Live',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'T20 Cricket'
  },
  {
    id: 'm3',
    sport: 'football',
    league: 'FIFA World Cup 2026 Qualifiers',
    status: 'upcoming',
    teamA: {
      name: 'Argentina',
      logo: '🩵',
      score: '0'
    },
    teamB: {
      name: 'Brazil',
      logo: '💛',
      score: '0'
    },
    time: 'Today, 11:30 PM',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    category: 'World Cup Qualifier'
  },
  {
    id: 'm4',
    sport: 'cricket',
    league: 'T20 International',
    status: 'upcoming',
    teamA: {
      name: 'Bangladesh',
      logo: '💚',
      score: '0'
    },
    teamB: {
      name: 'India',
      logo: '💙',
      score: '0'
    },
    time: 'Tomorrow, 7:00 PM',
    streamUrl: 'https://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8',
    category: 'T20 Asia'
  },
  {
    id: 'm5',
    sport: 'basketball',
    league: 'NBA Finals',
    status: 'finished',
    teamA: {
      name: 'Boston Celtics',
      logo: '🟢',
      score: '108'
    },
    teamB: {
      name: 'Dallas Mavericks',
      logo: '🔵',
      score: '96'
    },
    time: 'Finished',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/movie.m3u8',
    category: 'NBA Basketball'
  }
];

export const initialSecurityOptions = [
  {
    id: 'sandbox',
    name: 'Enable Iframe Sandbox',
    description: 'Enables the strict iframe sandboxing to prevent the external page from gaining full control.',
    bengaliDesc: 'এক্সটার্নাল পেজটিকে পূর্ণ কন্ট্রোল দেওয়া থেকে বিরত রাখতে কঠোর স্যান্ডবক্সিং সক্রিয় করে।',
    value: true
  },
  {
    id: 'allowScripts',
    name: 'Allow Scripts (allow-scripts)',
    description: 'Enables Javascript inside the streaming frame. Required for many video players but enables ads.',
    bengaliDesc: 'স্ট্রিমিং ফ্রেমের ভেতর জাভাস্ক্রিপ্ট সক্রিয় করে। অনেক প্লেয়ারের জন্য এটি জরুরি হলেও এটি বিজ্ঞাপন ও রিডাইরেক্ট রান করে।',
    value: true
  },
  {
    id: 'allowSameOrigin',
    name: 'Allow Same Origin (allow-same-origin)',
    description: 'Allows the frame to maintain its cookie/local storage context. Highly recommended to DISABLE for untrusted domains.',
    bengaliDesc: 'ফ্রেমটিকে তার কুকি এবং লোকাল স্টোরেজ এক্সেস করার অনুমতি দেয়। অবিস্তৃত ডোমেইনের জন্য এটি নিষ্ক্রিয় (DISABLE) রাখা সাজেস্টেড।',
    value: false
  },
  {
    id: 'allowPopups',
    name: 'Allow Popups (allow-popups)',
    description: 'Allows opening new tabs/windows. Disable this to block annoying automatic redirections and betting site popups!',
    bengaliDesc: 'নতুন ট্যাব/উইন্ডো খোলার অনুমতি দেয়। বিরক্তিকর অটোমেটিক রিডাইরেক্ট এবং বেটিং সাইটের পপ-আপ ব্লক করতে এটি নিষ্ক্রিয় রাখুন!',
    value: false
  },
  {
    id: 'allowForms',
    name: 'Allow Forms (allow-forms)',
    description: 'Allows form submission inside the iframe. Best disabled if the stream has rogue login fields.',
    bengaliDesc: 'আইফ্রেমের ভেতরে ফর্ম সাবমিট করার অনুমতি দেয়। কোনো ক্ষতিকর লগইন ফিল্ড থাকলে এটি বন্ধ রাখা উত্তম।',
    value: false
  }
];

export const sampleLogs = [
  {
    id: 'log-1',
    timestamp: '10:22:05 AM',
    type: 'info',
    message: 'Secure sandbox environment initialized.',
    bengaliMsg: 'নিরাপদ স্যান্ডবক্স এনভায়রনমেন্ট সফলভাবে প্রস্তুত করা হয়েছে।',
    severity: 'info'
  },
  {
    id: 'log-2',
    timestamp: '10:22:12 AM',
    type: 'blocked_popup',
    message: 'Blocked automatic popup attempt to "https://bet-casino-win.xyz".',
    bengaliMsg: '"https://bet-casino-win.xyz" এ যাওয়ার অটোমেটিক পপ-আপ চেষ্টা ব্লক করা হয়েছে।',
    severity: 'high'
  },
  {
    id: 'log-3',
    timestamp: '10:22:18 AM',
    type: 'blocked_redirect',
    message: 'Intercepted main window navigation request from streaming frame.',
    bengaliMsg: 'স্ট্রিমিং ফ্রেম থেকে মেইন উইন্ডো রিডাইরেক্টের চেষ্টা সফলভাবে প্রতিহত করা হয়েছে।',
    severity: 'high'
  }
];
