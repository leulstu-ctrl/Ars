import { SoundscapeChannel, SoundscapeId } from './meditationLogic';

interface ActiveSoundNode {
  gainNode: GainNode;
  cleanup: () => void;
}

class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channels: Map<SoundscapeId, ActiveSoundNode> = new Map();
  private isPlaying = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext, pink = true): AudioBuffer {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (!pink) {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private buildChannelNode(ctx: AudioContext, id: SoundscapeId, dest: AudioNode): ActiveSoundNode {
    const channelGain = ctx.createGain();
    channelGain.gain.value = 0;
    channelGain.connect(dest);

    const disposers: Array<() => void> = [];

    if (id === 'rain') {
      const source = ctx.createBufferSource();
      source.buffer = this.createNoiseBuffer(ctx, true);
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1150;
      bandpass.Q.value = 0.65;

      source.connect(bandpass);
      bandpass.connect(channelGain);
      source.start();
      disposers.push(() => {
        try { source.stop(); source.disconnect(); } catch {}
      });
    } else if (id === 'ocean') {
      const source = ctx.createBufferSource();
      source.buffer = this.createNoiseBuffer(ctx, true);
      source.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 360;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12; // 8.3s wave cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 240;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      source.connect(lowpass);
      lowpass.connect(channelGain);
      source.start();
      lfo.start();
      disposers.push(() => {
        try { source.stop(); lfo.stop(); source.disconnect(); } catch {}
      });
    } else if (id === 'forest') {
      const source = ctx.createBufferSource();
      source.buffer = this.createNoiseBuffer(ctx, true);
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 620;
      filter.Q.value = 1.4;

      const chimeOsc = ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.value = 528;
      const chimeGain = ctx.createGain();
      chimeGain.gain.value = 0.04;

      source.connect(filter);
      filter.connect(channelGain);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(channelGain);

      source.start();
      chimeOsc.start();
      disposers.push(() => {
        try { source.stop(); chimeOsc.stop(); source.disconnect(); } catch {}
      });
    } else if (id === 'fire') {
      const source = ctx.createBufferSource();
      source.buffer = this.createNoiseBuffer(ctx, false);
      source.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 240;

      const rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'triangle';
      rumbleOsc.frequency.value = 82;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.08;

      source.connect(lowpass);
      lowpass.connect(channelGain);
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(channelGain);

      source.start();
      rumbleOsc.start();
      disposers.push(() => {
        try { source.stop(); rumbleOsc.stop(); source.disconnect(); } catch {}
      });
    } else if (id === 'wind') {
      const source = ctx.createBufferSource();
      source.buffer = this.createNoiseBuffer(ctx, true);
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 320;
      bandpass.Q.value = 3.5;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 140;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      source.connect(bandpass);
      bandpass.connect(channelGain);
      source.start();
      lfo.start();
      disposers.push(() => {
        try { source.stop(); lfo.stop(); source.disconnect(); } catch {}
      });
    } else if (id === 'bowls') {
      const rootOsc = ctx.createOscillator();
      rootOsc.type = 'sine';
      rootOsc.frequency.value = 216; // 432Hz sub-octave

      const fifthOsc = ctx.createOscillator();
      fifthOsc.type = 'sine';
      fifthOsc.frequency.value = 324;

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.value = 0.16;

      rootOsc.connect(harmonicGain);
      fifthOsc.connect(harmonicGain);
      harmonicGain.connect(channelGain);

      rootOsc.start();
      fifthOsc.start();
      disposers.push(() => {
        try { rootOsc.stop(); fifthOsc.stop(); rootOsc.disconnect(); } catch {}
      });
    }

    return {
      gainNode: channelGain,
      cleanup: () => {
        disposers.forEach((fn) => fn());
        try { channelGain.disconnect(); } catch {}
      },
    };
  }

  public syncChannels(channels: SoundscapeChannel[], masterEnabled: boolean, masterVolume = 80) {
    this.isPlaying = masterEnabled;
    if (!masterEnabled) {
      if (this.ctx && this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      }
      return;
    }

    const ctx = this.ensureContext();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime((masterVolume / 100) * 0.9, ctx.currentTime, 0.15);
    }

    for (const ch of channels) {
      let node = this.channels.get(ch.id);
      if (ch.active && ch.volume > 0) {
        if (!node && this.masterGain) {
          node = this.buildChannelNode(ctx, ch.id, this.masterGain);
          this.channels.set(ch.id, node);
        }
        if (node) {
          const targetGain = (ch.volume / 100) * 0.55;
          node.gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.18);
        }
      } else if (node) {
        node.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      }
    }
  }

  public stopAll() {
    this.isPlaying = false;
    this.channels.forEach((node) => node.cleanup());
    this.channels.clear();
  }
}

export const soundscapeEngine = new AmbientSoundscapeEngine();
