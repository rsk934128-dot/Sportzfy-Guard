export interface Match {
  id: string;
  sport: 'football' | 'cricket' | 'basketball';
  league: string;
  status: 'live' | 'upcoming' | 'finished';
  teamA: {
    name: string;
    logo: string;
    score?: string;
    overs?: string; // for cricket
    wickets?: string; // for cricket
  };
  teamB: {
    name: string;
    logo: string;
    score?: string;
    overs?: string; // for cricket
    wickets?: string; // for cricket
  };
  time: string;
  minute?: number; // for football live minute
  streamUrl: string; // HLS or external test URL
  category: string;
}

export interface SecurityOption {
  id: string;
  name: string;
  description: string;
  value: boolean;
  bengaliDesc: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'blocked_redirect' | 'blocked_popup' | 'cookie_access' | 'script_execution' | 'info';
  message: string;
  bengaliMsg: string;
  severity: 'high' | 'medium' | 'info';
}
