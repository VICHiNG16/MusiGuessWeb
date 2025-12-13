// Sound effects utility for UI feedback
// Uses Web Audio API for browser-based sounds

type SoundType = 'correct' | 'wrong' | 'tick' | 'start' | 'end';

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;

        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.log('Web Audio API not supported');
                return null;
            }
        }
        return this.audioContext;
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    // Generate simple tones for UI feedback
    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
        if (!this.enabled) return;

        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            // Envelope
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    play(sound: SoundType) {
        switch (sound) {
            case 'correct':
                // Happy ascending tone
                this.playTone(523.25, 0.15, 'sine', 0.3); // C5
                setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 100); // E5
                setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
                break;

            case 'wrong':
                // Sad descending buzz
                this.playTone(200, 0.3, 'sawtooth', 0.2);
                break;

            case 'tick':
                // Short click
                this.playTone(800, 0.05, 'square', 0.15);
                break;

            case 'start':
                // Game start fanfare
                this.playTone(440, 0.1, 'sine', 0.25);
                setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.25), 100);
                setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 200);
                setTimeout(() => this.playTone(880, 0.3, 'sine', 0.35), 300);
                break;

            case 'end':
                // Game over chord
                this.playTone(440, 0.4, 'triangle', 0.25);
                this.playTone(554.37, 0.4, 'triangle', 0.2);
                this.playTone(659.25, 0.4, 'triangle', 0.2);
                break;
        }
    }

    // Resume audio context (needed after user gesture on some browsers)
    async resume() {
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
            await ctx.resume();
        }
    }
}

// Singleton instance
export const sounds = new SoundManager();
