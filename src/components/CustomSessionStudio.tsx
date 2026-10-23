import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  CustomSessionFormInput,
  GuidedMeditation,
  ImageResolutionSize,
  VoicePersonaName,
  VOICE_PERSONAS,
  validateCustomSessionInput,
  buildFallbackCustomMeditation,
  createSanctuarySvgDataUri,
} from '../utils/meditationLogic';

interface CustomSessionStudioProps {
  onSessionCreated: (newSession: GuidedMeditation) => void;
}

const VISUAL_STYLE_PRESETS = [
  'Minimalist Ink & Mist Landscape',
  'Nordic Twilight Fjord & Starlight',
  'Warm Travertine Architectural Sanctuary',
  'Kyoto Moss & Bamboo Courtyard',
  'Golden Hour Coastal Sand Dunes',
];

export const CustomSessionStudio: React.FC<CustomSessionStudioProps> = ({
  onSessionCreated,
}) => {
  const [form, setForm] = useState<CustomSessionFormInput>({
    topic: '',
    durationMinutes: 6,
    visualStyle: VISUAL_STYLE_PRESETS[0],
    visualPrompt: '',
    imageSize: '2K',
    aspectRatio: '16:9',
    voiceName: 'Kore',
    voiceStyle: VOICE_PERSONAS[0].defaultStyle,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleVoiceChange = (voiceName: VoicePersonaName) => {
    const found = VOICE_PERSONAS.find((v) => v.name === voiceName);
    setForm((prev) => ({
      ...prev,
      voiceName,
      voiceStyle: found ? found.defaultStyle : prev.voiceStyle,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const validation = validateCustomSessionInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsGenerating(true);
    setGenerationStep('Crafting meditation script & breath cadence...');

    try {
      // Step 1: Generate bespoke script & visual prompt via /api/gemini/script
      let scriptData: any = null;
      try {
        const scriptRes = await fetch('/api/gemini/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: form.topic,
            durationMinutes: form.durationMinutes,
            visualStyle: form.visualStyle,
            voiceName: form.voiceName,
            voiceStyle: form.voiceStyle,
          }),
        });
        if (scriptRes.ok) {
          scriptData = await scriptRes.json();
        }
      } catch {
        // Fallback handled smoothly below
      }

      const effectiveVisualPrompt =
        form.visualPrompt.trim() ||
        scriptData?.visualPrompt ||
        `${form.visualStyle} inspired by ${form.topic.trim()}, serene sanctuary light`;

      // Step 2: Generate high-resolution sanctuary visual via gemini-3-pro-image-preview (1K / 2K / 4K)
      setGenerationStep(
        `Rendering ${form.imageSize} visual artwork with gemini-3-pro-image-preview...`
      );
      let generatedImageUrl: string | null = null;
      try {
        const imageRes = await fetch('/api/gemini/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: effectiveVisualPrompt,
            imageSize: form.imageSize,
            aspectRatio: form.aspectRatio,
          }),
        });
        if (imageRes.ok) {
          const imgJson = await imageRes.json();
          if (imgJson.imageUrl) {
            generatedImageUrl = imgJson.imageUrl;
          }
        }
      } catch {
        // Fallback SVG artwork used if offline or quota reached
      }

      const fallbackSession = buildFallbackCustomMeditation({
        ...form,
        visualPrompt: effectiveVisualPrompt,
      });

      const finalSession: GuidedMeditation = {
        ...fallbackSession,
        title: scriptData?.title || fallbackSession.title,
        subtitle: scriptData?.subtitle || fallbackSession.subtitle,
        visualStyleName: scriptData?.visualStyleName || form.visualStyle,
        visualPrompt: effectiveVisualPrompt,
        imageUrl:
          generatedImageUrl ||
          createSanctuarySvgDataUri({
            bgStart: '#0B1917',
            bgEnd: '#1E293B',
            orbColor: '#6EE7B7',
            accentColor: '#38BDF8',
            horizonColor: '#0F172A',
            motif: 'custom-aura',
          }),
        imageSize: form.imageSize,
        breathingPattern:
          scriptData?.breathingPattern || fallbackSession.breathingPattern,
        recommendedSoundscapes:
          Array.isArray(scriptData?.recommendedSoundscapes) &&
          scriptData.recommendedSoundscapes.length > 0
            ? scriptData.recommendedSoundscapes
            : fallbackSession.recommendedSoundscapes,
        script: scriptData?.script || fallbackSession.script,
        isCustom: true,
      };

      onSessionCreated(finalSession);
      setStatusMessage(
        `Created "${finalSession.title}" (${form.imageSize} visual · ${form.voiceName} voiceover) and loaded into the Sanctuary player.`
      );
      setForm((prev) => ({ ...prev, topic: '', visualPrompt: '' }));
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <section
      id="custom-studio"
      aria-label="Custom Meditation Session Studio"
      className="mx-auto max-w-[1280px] border-t border-slate-800/80 px-6 py-12"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 5 Columns: Studio Explanation & Specs */}
        <div className="lg:col-span-5">
          <p className="text-xs text-slate-400">
            <span>Bespoke Session Generator</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash TTS + Gemini 3 Pro Image</span>
          </p>
          <h2 className="mt-1 font-serif-display text-3xl font-semibold text-slate-50">
            Custom Session Studio
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Design a personalized guided meditation tailored to your exact emotional state or daily ritual. Choose your voiceover persona, visual aesthetic, and target resolution (1K, 2K, or 4K).
          </p>

          <div className="mt-6 space-y-4 border-t border-slate-800/80 pt-5 text-xs text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-100">
                01. Contemplative Script & Breath Pacing
              </h3>
              <p className="mt-0.5 text-slate-400">
                Writes a sensory meditation script embedded with natural <code className="text-emerald-300">&lt;breath&gt;</code> pauses and a synchronized inhale-hold-exhale cadence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">
                02. High-Resolution Sanctuary Visuals (1K, 2K, 4K)
              </h3>
              <p className="mt-0.5 text-slate-400">
                Generates custom artwork with <code className="text-emerald-300">gemini-3-pro-image-preview</code> at your chosen resolution size.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">
                03. Expressive Voiceover Synthesis
              </h3>
              <p className="mt-0.5 text-slate-400">
                Converts your script to lifelike spoken audio using <code className="text-emerald-300">gemini-3.8-flash-tts</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Interactive Creation Form */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 lg:col-span-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Intention / Topic */}
            <div>
              <label
                htmlFor="custom-topic-input"
                className="block text-xs font-medium text-slate-200"
              >
                Meditation Intention or Focus *
              </label>
              <input
                id="custom-topic-input"
                type="text"
                value={form.topic}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, topic: e.target.value }));
                  if (errors.topic) setErrors((prev) => ({ ...prev, topic: '' }));
                }}
                placeholder="e.g., Releasing pre-presentation nerves and grounding my voice"
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              {errors.topic && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.topic}</span>
                </p>
              )}
            </div>

            {/* Row: Duration + Voice Persona */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="custom-duration-select"
                  className="block text-xs font-medium text-slate-200"
                >
                  Session Duration (Minutes)
                </label>
                <select
                  id="custom-duration-select"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  <option value={3}>3 minutes — Quick Reset</option>
                  <option value={5}>5 minutes — Grounded Pause</option>
                  <option value={6}>6 minutes — Balanced Practice</option>
                  <option value={10}>10 minutes — Deep Immersion</option>
                  <option value={15}>15 minutes — Extended Sanctuary</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="custom-voice-select"
                  className="block text-xs font-medium text-slate-200"
                >
                  Voice Persona (gemini-3.8-flash-tts)
                </label>
                <select
                  id="custom-voice-select"
                  value={form.voiceName}
                  onChange={(e) =>
                    handleVoiceChange(e.target.value as VoicePersonaName)
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {VOICE_PERSONAS.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Visual Style Preset + Image Size (1K, 2K, 4K) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="custom-visual-style"
                  className="block text-xs font-medium text-slate-200"
                >
                  Visual Style Direction
                </label>
                <select
                  id="custom-visual-style"
                  value={form.visualStyle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, visualStyle: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {VISUAL_STYLE_PRESETS.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-200">
                  Image Resolution Size (gemini-3-pro-image-preview)
                </span>
                <div
                  role="group"
                  aria-label="Custom session image resolution size"
                  className="mt-1.5 grid grid-cols-3 gap-2 rounded-lg border border-slate-700 bg-slate-950 p-1"
                >
                  {(['1K', '2K', '4K'] as ImageResolutionSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, imageSize: size }))
                      }
                      className={`rounded-md py-1.5 font-mono-tabular text-xs font-semibold transition-colors ${
                        form.imageSize === size
                          ? 'bg-emerald-400 text-slate-950'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Custom Visual Prompt Details */}
            <div>
              <label
                htmlFor="custom-visual-prompt"
                className="block text-xs font-medium text-slate-200"
              >
                Custom Visual Scene Details (Optional)
              </label>
              <input
                id="custom-visual-prompt"
                type="text"
                value={form.visualPrompt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, visualPrompt: e.target.value }))
                }
                placeholder="e.g., Quiet cedar tea house overlooking a misty canyon at dawn"
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-400">
                Generates custom script, {form.imageSize} sanctuary artwork, and TTS voiceover config.
              </span>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{generationStep || 'Generating Session...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Custom Meditation</span>
                  </>
                )}
              </button>
            </div>

            {statusMessage && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
