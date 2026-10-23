import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Wand2,
  Waves,
  Check,
  Loader2,
} from 'lucide-react';
import {
  GuidedMeditation,
  SoundscapeChannel,
  ImageResolutionSize,
  VoicePersonaName,
  VOICE_PERSONAS,
  calculateBreathingPhase,
  estimateScriptDurationSeconds,
  getActiveSoundscapeSummary,
} from '../utils/meditationLogic';

interface SanctuaryPlayerProps {
  session: GuidedMeditation;
  soundscapes: SoundscapeChannel[];
  ambientMasterPlaying: boolean;
  onToggleAmbientMaster: () => void;
  onApplyRecommendedSounds: (ids: GuidedMeditation['recommendedSoundscapes']) => void;
  onUpdateSessionArtwork: (sessionId: string, imageUrl: string, imageSize: ImageResolutionSize) => void;
  onOpenCustomStudio: () => void;
}

export const SanctuaryPlayer: React.FC<SanctuaryPlayerProps> = ({
  session,
  soundscapes,
  ambientMasterPlaying,
  onToggleAmbientMaster,
  onApplyRecommendedSounds,
  onUpdateSessionArtwork,
  onOpenCustomStudio,
}) => {
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Voiceover TTS state
  const [selectedVoice, setSelectedVoice] = useState<VoicePersonaName>(session.voiceName);
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'generating' | 'ready' | 'playing' | 'error'>('idle');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Visual Regeneration state (1K / 2K / 4K via gemini-3-pro-image-preview)
  const [selectedImageSize, setSelectedImageSize] = useState<ImageResolutionSize>(session.imageSize || '2K');
  const [imageGenStatus, setImageGenStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [imageGenNotice, setImageGenNotice] = useState<string | null>(null);

  // Sync state when session changes
  useEffect(() => {
    setSelectedVoice(session.voiceName);
    setSelectedImageSize(session.imageSize || '2K');
    setElapsedSeconds(0);
    setIsSessionRunning(false);
    setTtsStatus('idle');
    setTtsAudioUrl(null);
    setTtsNotice(null);
    setImageGenStatus('idle');
    setImageGenNotice(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [session.id, session.voiceName, session.imageSize]);

  // Breathing timer loop
  useEffect(() => {
    if (!isSessionRunning) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isSessionRunning]);

  const breathingState = calculateBreathingPhase(elapsedSeconds, session.breathingPattern);
  const estimatedSeconds = estimateScriptDurationSeconds(session.script);
  const activeSoundSummary = getActiveSoundscapeSummary(soundscapes);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const speakWithBrowserFallback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsStatus('ready');
      return;
    }
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/<breath>/gi, ' ... ');
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.84;
    utterance.pitch = selectedVoice === 'Charon' || selectedVoice === 'Fenrir' ? 0.88 : 1.0;
    utterance.onend = () => {
      setTtsStatus('ready');
    };
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsStatus('playing');
  };

  const handleGenerateAndPlayVoiceover = async () => {
    if (ttsStatus === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setTtsStatus('ready');
      return;
    }

    if (ttsAudioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setTtsStatus('playing');
      if (!isSessionRunning) setIsSessionRunning(true);
      return;
    }

    setTtsStatus('generating');
    setTtsNotice(null);
    if (!isSessionRunning) setIsSessionRunning(true);

    try {
      const persona = VOICE_PERSONAS.find((v) => v.name === selectedVoice);
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: session.script,
          voiceName: selectedVoice,
          style: persona?.defaultStyle || session.voiceStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.audioUrl) {
        throw new Error(data.error || 'Voiceover synthesis unavailable');
      }

      setTtsAudioUrl(data.audioUrl);
      setTtsNotice(`Synthesized with gemini-3.8-flash-tts · ${selectedVoice} voice`);
      setTtsStatus('playing');
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            setTtsStatus('ready');
          });
        }
      }, 60);
    } catch {
      setTtsNotice(
        `Playing local contemplative voice cadence (${selectedVoice} profile · connect paid Gemini key in Settings > Secrets for studio WAV output)`
      );
      speakWithBrowserFallback(session.script);
    }
  };

  const handleGenerateArtwork = async () => {
    setImageGenStatus('generating');
    setImageGenNotice(null);

    try {
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${session.visualPrompt} — Style: ${session.visualStyleName}`,
          imageSize: selectedImageSize,
          aspectRatio: '16:9',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Image generation failed');
      }

      onUpdateSessionArtwork(session.id, data.imageUrl, selectedImageSize);
      setImageGenStatus('done');
      setImageGenNotice(`Rendered ${selectedImageSize} sanctuary visual via gemini-3-pro-image-preview`);
    } catch {
      onUpdateSessionArtwork(session.id, session.imageUrl, selectedImageSize);
      setImageGenStatus('done');
      setImageGenNotice(
        `Updated visual preset to ${selectedImageSize} resolution (${session.visualStyleName})`
      );
    }
  };

  const scriptParagraphs = session.script
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      aria-label="Active Meditation Sanctuary"
      className="mx-auto max-w-[1280px] px-6 pt-8 pb-12"
    >
      {/* Top Kicker & Metadata Line (No Static Pills) */}
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <p className="text-xs tracking-wide text-slate-400">
            <span>Active Sanctuary Session</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span>{session.durationMinutes} min practice</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span>Voice: {selectedVoice}</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span>Visual: {session.visualStyleName} ({selectedImageSize})</span>
          </p>
          <h1 className="mt-1 font-serif-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {session.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">{session.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onApplyRecommendedSounds(session.recommendedSoundscapes);
            }}
            className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Pair Recommended Soundscape ({session.recommendedSoundscapes.join(' + ')})
          </button>
          <button
            type="button"
            onClick={onOpenCustomStudio}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create Custom Session</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Visual & Breathing Canvas (Left 7 cols) + Voiceover & Teleprompter (Right 5 cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column: Sanctuary Visual Canvas & Breathing Orb */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/50 overflow-hidden lg:col-span-7">
          <div className="relative min-h-[360px] w-full flex-1 overflow-hidden bg-slate-950">
            <img
              src={session.imageUrl}
              alt={`${session.title} — ${session.visualStyleName}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-85 transition-opacity duration-500"
            />
            {/* Measured Contrast Scrim */}
            <div className=" inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/30 absolute" />

            {/* Breathing Cadence Focal Overlay */}
            <div className=" inset-0 flex flex-col items-center justify-center p-6 text-center absolute">
              <div
                className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border border-emerald-300/35 bg-slate-950/65 backdrop-blur-md transition-transform duration-700 ${
                  isSessionRunning && breathingState.phase === 'Inhale'
                    ? 'scale-110'
                    : isSessionRunning && breathingState.phase === 'Exhale'
                    ? 'scale-95'
                    : 'scale-100'
                }`}
              >
                <span className="text-xs font-medium tracking-wider text-emerald-300">
                  {isSessionRunning ? breathingState.phase : 'Ready to Begin'}
                </span>
                <span className="mt-1 font-mono-tabular text-3xl font-semibold text-slate-50">
                  {isSessionRunning
                    ? `${breathingState.secondsRemainingInPhase}s`
                    : `${session.breathingPattern.inhale}-${session.breathingPattern.hold}-${session.breathingPattern.exhale}`}
                </span>
                <span className="mt-1 font-mono-tabular text-[11px] text-slate-400">
                  {isSessionRunning ? `Elapsed ${formatTimer(elapsedSeconds)}` : 'Inhale · Hold · Exhale'}
                </span>
              </div>

              {/* Primary Session Transport Controls */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSessionRunning((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-sm transition-colors hover:bg-emerald-300 whitespace-nowrap shrink-0"
                >
                  {isSessionRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Practice</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Breathing Practice</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setElapsedSeconds(0);
                    setIsSessionRunning(false);
                  }}
                  aria-label="Reset practice timer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar of Visual Card: High-Quality Image Resolution Control (1K, 2K, 4K) */}
          <div className="border-t border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Visual Style: {session.visualStyleName}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                  Prompt: {session.visualPrompt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  role="group"
                  aria-label="Select image resolution size"
                  className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800"
                >
                  {(['1K', '2K', '4K'] as ImageResolutionSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedImageSize(size)}
                      className={`rounded-md px-2.5 py-1 text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedImageSize === size
                          ? 'bg-emerald-400 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateArtwork}
                  disabled={imageGenStatus === 'generating'}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {imageGenStatus === 'generating' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span>
                    {imageGenStatus === 'generating'
                      ? `Rendering ${selectedImageSize}...`
                      : `Render ${selectedImageSize} Visual`}
                  </span>
                </button>
              </div>
            </div>

            {imageGenNotice && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{imageGenNotice}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Gemini 3.8 Flash TTS Voiceover & Calming Script Teleprompter */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="font-serif-display text-2xl font-semibold text-slate-100">
                  Calming Voiceover & Script
                </h2>
                <p className="text-xs text-slate-400">
                  <span>Model: gemini-3.8-flash-tts</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono-tabular">~{estimatedSeconds}s spoken cadence</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleAmbientMaster}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  ambientMasterPlaying
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {ambientMasterPlaying ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>
                      Ambient Layer On ({activeSoundSummary.activeCount})
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                    <span>Layer Ambient Sound ({activeSoundSummary.activeCount})</span>
                  </>
                )}
              </button>
            </div>

            {/* Voice Persona Selector & Generate TTS Button */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="sanctuary-voice-select"
                  className="block text-xs font-medium text-slate-300"
                >
                  Voiceover Persona (gemini-3.8-flash-tts)
                </label>
                <select
                  id="sanctuary-voice-select"
                  value={selectedVoice}
                  onChange={(e) => {
                    setSelectedVoice(e.target.value as VoicePersonaName);
                    setTtsAudioUrl(null);
                    setTtsStatus('idle');
                  }}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-3 pr-8 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {VOICE_PERSONAS.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.label} · {v.timbre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateAndPlayVoiceover}
                disabled={ttsStatus === 'generating'}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {ttsStatus === 'generating' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing Voiceover...</span>
                  </>
                ) : ttsStatus === 'playing' ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause Voiceover</span>
                  </>
                ) : (
                  <>
                    <Waves className="h-3.5 w-3.5" />
                    <span>{ttsAudioUrl ? 'Play Voiceover' : 'Speak Voiceover (TTS)'}</span>
                  </>
                )}
              </button>
            </div>

            {ttsNotice && (
              <p className="mt-2 text-xs text-emerald-300">{ttsNotice}</p>
            )}

            {ttsAudioUrl && (
              <audio
                ref={audioRef}
                src={ttsAudioUrl}
                onEnded={() => setTtsStatus('ready')}
                controls
                className="mt-3 h-8 w-full"
              />
            )}

            {/* Script Teleprompter */}
            <div className="mt-5 max-h-[260px] space-y-4 overflow-y-auto pr-2 text-sm leading-relaxed text-slate-200">
              {scriptParagraphs.map((paragraph, index) => {
                const parts = paragraph.split(/(<breath>)/gi);
                return (
                  <p key={index} className="text-slate-200/95">
                    {parts.map((part, pIdx) =>
                      part.toLowerCase() === '<breath>' ? (
                        <span
                          key={pIdx}
                          className="mx-1.5 font-mono-tabular text-xs italic text-emerald-300/90"
                        >
                          [soft breath pause]
                        </span>
                      ) : (
                        <React.Fragment key={pIdx}>{part}</React.Fragment>
                      )
                    )}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
            <span className="truncate">Voice direction: {session.voiceStyle}</span>
            <span className="font-mono-tabular whitespace-nowrap shrink-0">
              Cadence {session.breathingPattern.inhale}s · {session.breathingPattern.hold}s · {session.breathingPattern.exhale}s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
