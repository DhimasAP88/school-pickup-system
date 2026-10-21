/**
 * Voice Announcer using Web Audio API (Chime) and Web Speech API (Indonesian TTS)
 */

class AudioAnnouncer {
  private isMuted: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Lazy init audio context on user interaction
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play pleasant dual-tone airport/school bell chime
  private playChime(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve();

      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Tone 1 (High: 880Hz / A5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        // Tone 2 (Mid: 587.33Hz / D5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(587.33, now + 0.25);
        gain2.gain.setValueAtTime(0.25, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.7);

        setTimeout(() => resolve(), 600);
      } catch (err) {
        console.warn('Audio chime error:', err);
        resolve();
      }
    });
  }

  public async announceStudents(students: { name: string; classGrade: string }[]): Promise<void> {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Play chime sound first
    await this.playChime();

    // Prepare message
    let messageText = '';
    if (students.length === 1) {
      const s = students[0];
      messageText = `Perhatian. Orang tua dari ananda ${s.name}, kelas ${s.classGrade}, telah tiba di gerbang penjemputan.`;
    } else {
      const names = students.map(s => `ananda ${s.name} kelas ${s.classGrade}`).join(' dan ');
      messageText = `Perhatian. Orang tua dari ${names}, telah tiba di gerbang penjemputan.`;
    }

    const utterance = new SpeechSynthesisUtterance(messageText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.05;

    // Pick Indonesian voice if present
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public testVoice() {
    this.announceStudents([
      { name: 'Farhan', classGrade: '4B' },
      { name: 'Aisyah', classGrade: '1A' }
    ]);
  }
}

export const announcer = new AudioAnnouncer();
