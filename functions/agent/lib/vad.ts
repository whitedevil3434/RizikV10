
/**
 * 🎙️ Adaptive Voice Activity Detector (VAD)
 * 
 * Professional-grade VAD inspired by WebRTC and Silero.
 * Uses adaptive noise floor estimation and state-machine hysteresis
 * to distinguish speech from background noise.
 */
export class AdaptiveVAD {
    private noiseFloor: number = 20; // Initial guess (Lowered to adapt to 50x gain noise profile)
    private alpha: number = 0.05;    // Adaptation rate (0.05 = Slow adaptation to background)

    // Adjusted Constants for "Balanced" Response
    private speechThresholdMultiplier: number = 3.0; // Strict again to prevent "Stuck on YES"
    private silenceThresholdMultiplier: number = 0.8;

    // Hysteresis State
    private hangoverFrames: number = 0;
    private readonly HANGOVER_DURATION_FRAMES: number = 10; // ~300ms

    private isSpeaking: boolean = false;
    get isSpeech(): boolean { return this.isSpeaking; }

    /**
     * Process a single audio frame's RMS energy.
     * @param rms Root Mean Square of the audio frame
     * @returns {boolean} True if speech is detected, False otherwise
     */
    process(rms: number): boolean {
        // 1. Adapt Noise Floor (Only when NOT speaking)
        // This allows the VAD to learn the "Room Tone" (Fan, AC, Traffic)
        if (!this.isSpeaking) {
            this.noiseFloor = (this.noiseFloor * (1 - this.alpha)) + (rms * this.alpha);
        }

        // Clamp noise floor to sane limits to prevent getting stuck
        this.noiseFloor = Math.max(2, Math.min(this.noiseFloor, 100));

        // 2. Determine Thresholds
        const speechThreshold = this.noiseFloor * this.speechThresholdMultiplier;
        const silenceThreshold = this.noiseFloor * this.silenceThresholdMultiplier;

        // 3. State Machine Transition
        if (rms > speechThreshold) {
            // SPEECH START
            this.isSpeaking = true;
            this.hangoverFrames = this.HANGOVER_DURATION_FRAMES; // Reset hangover timer
            return true;
        } else {
            // POTENTIAL SILENCE
            if (this.isSpeaking) {
                // Check Hysteresis (Hangover)
                if (rms > silenceThreshold) {
                    // "Weak Speech" or "Trailing Consonant" -> Sustain
                    this.hangoverFrames = this.HANGOVER_DURATION_FRAMES;
                    return true;
                } else {
                    // True Silence?
                    if (this.hangoverFrames > 0) {
                        this.hangoverFrames--; // Decrement timer
                        return true; // Keep channel open
                    } else {
                        // Hangover depleted -> SPEECH END
                        this.isSpeaking = false;
                        return false;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Get current internal stats for debugging.
     */
    getStats() {
        return {
            noise: this.noiseFloor.toFixed(1),
            speaking: this.isSpeaking,
            hangover: this.hangoverFrames
        };
    }
}
