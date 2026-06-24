/**
 * Procedural Audio Sound Engine using Web Audio API
 * Generates realistic stadium atmosphere, referee whistles, and crowd cheer effects dynamically.
 */

export class StadiumSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  // Audio Nodes
  private masterGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdFilter: BiquadFilterNode | null = null;
  private crowdSource: AudioWorkletNode | ScriptProcessorNode | null = null;
  private isCrowdBurning: boolean = false;

  constructor() {
    // Lazy initialize to bypass autoplay restrictions
  }

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Setup Crowd Hum Gain
      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0, this.ctx.currentTime);
      
      // Lowpass filter to make noise sound like a crowd hum in a distance
      this.crowdFilter = this.ctx.createBiquadFilter();
      this.crowdFilter.type = 'lowpass';
      this.crowdFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.crowdFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.crowdGain.connect(this.crowdFilter);
      this.crowdFilter.connect(this.masterGain);

      // Generate brown noise for crowd hum
      this.startCrowdNoise();
    } catch (e) {
      console.error('Failed to initialize Web Audio Context', e);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime + 0.1);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime + 0.1);
    }
  }

  private startCrowdNoise() {
    if (!this.ctx || !this.crowdGain) return;

    // Create custom noise buffer (Brownian/Pink Noise)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise approximation formula
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for loss of volume
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseNode.connect(this.crowdGain);
    noiseNode.start();
    this.isCrowdBurning = true;
  }

  /**
   * Start constant stadium atmospheric presence (low frequency rumble)
   */
  startAtmosphere() {
    this.initContext();
    if (!this.ctx || !this.crowdGain || !this.crowdFilter) return;

    // Resume context if suspended (browser security block)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Slowly ramp up crowd atmosphere
    this.crowdGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 2.0);
    this.crowdFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
  }

  /**
   * Stop atmosphere
   */
  stopAtmosphere() {
    if (!this.ctx || !this.crowdGain) return;
    this.crowdGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
  }

  /**
   * Trigger Referee Whistle sound using dual band sine waves and high frequency tremolo
   */
  playWhistle() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    // Create twin oscillators for a realistic metal pea whistle sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1000, t);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1250, t);

    // Dynamic pitch modulation (vibrato)
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.setValueAtTime(32, t); // Tremolo/vib rate
    
    const vibratoGain = this.ctx.createGain();
    vibratoGain.gain.setValueAtTime(45, t); // Vibrato depth (Hz)

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);

    // Whistle gain envelope
    const whistleGain = this.ctx.createGain();
    whistleGain.gain.setValueAtTime(0, t);
    whistleGain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    whistleGain.gain.linearRampToValueAtTime(0.25, t + 0.15);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    // Highpass filter for extra crisp whistle
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(600, t);

    // Connect nodes
    osc1.connect(whistleGain);
    osc2.connect(whistleGain);
    whistleGain.connect(hpFilter);
    hpFilter.connect(this.masterGain);

    vibrato.start(t);
    osc1.start(t);
    osc2.start(t);

    vibrato.stop(t + 0.4);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  /**
   * Trigger crowd goal cheer: dramatic sound wave rise and lowpass bypass
   */
  playGoalCheer() {
    this.initContext();
    if (!this.ctx || !this.crowdGain || !this.crowdFilter) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // Surge volume
    this.crowdGain.gain.cancelScheduledValues(t);
    this.crowdGain.gain.setValueAtTime(0.25, t);
    this.crowdGain.gain.exponentialRampToValueAtTime(0.9, t + 0.3); // Instant surge
    this.crowdGain.gain.linearRampToValueAtTime(0.7, t + 2.5); // Sustained excitement
    this.crowdGain.gain.exponentialRampToValueAtTime(0.25, t + 5.0); // Return to baseline

    // Expand filter frequency (brightens the sound, sounds like higher excitement)
    this.crowdFilter.frequency.cancelScheduledValues(t);
    this.crowdFilter.frequency.setValueAtTime(280, t);
    this.crowdFilter.frequency.exponentialRampToValueAtTime(950, t + 0.4); // Bright scream
    this.crowdFilter.frequency.linearRampToValueAtTime(450, t + 2.5); // Mellowing out
    this.crowdFilter.frequency.exponentialRampToValueAtTime(280, t + 5.0); // Return to hum
  }

  /**
   * Speaks the comment out loud using SpeechSynthesis
   */
  speakCommentary(text: string, langCode: 'en' | 'bn' = 'en') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      // Cancel active speaking to avoid stacking delays
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.isMuted ? 0 : this.volume * 0.9;
      utterance.rate = langCode === 'bn' ? 1.05 : 0.95; // slightly faster for Bengali

      // Match voices
      const voices = window.speechSynthesis.getVoices();
      if (langCode === 'bn') {
        const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('IN'));
        if (bnVoice) utterance.voice = bnVoice;
        utterance.lang = 'bn-BD';
      } else {
        const enVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  }
}

export const soundEngine = new StadiumSoundEngine();
