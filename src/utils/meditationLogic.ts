export type ImageResolutionSize = '1K' | '2K' | '4K';
export type VoicePersonaName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';
export type SoundscapeId = 'rain' | 'ocean' | 'forest' | 'fire' | 'wind' | 'bowls';
export type ChatTaskMode = 'fast' | 'general' | 'complex';

export interface BreathingPattern {
  inhale: number;
  hold: number;
  exhale: number;
}

export interface GuidedMeditation {
  id: string;
  packId: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  voiceName: VoicePersonaName;
  voiceStyle: string;
  visualStyleName: string;
  visualPrompt: string;
  imageUrl: string;
  imageSize: ImageResolutionSize;
  breathingPattern: BreathingPattern;
  recommendedSoundscapes: SoundscapeId[];
  script: string;
  isCustom?: boolean;
}

export interface MeditationPack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  coverImageUrl: string;
  meditations: GuidedMeditation[];
}

export interface SoundscapeChannel {
  id: SoundscapeId;
  name: string;
  category: string;
  description: string;
  frequencyProfile: string;
  active: boolean;
  volume: number; // 0 to 100
}

export interface CustomSessionFormInput {
  topic: string;
  durationMinutes: number;
  visualStyle: string;
  visualPrompt: string;
  imageSize: ImageResolutionSize;
  aspectRatio: '16:9' | '1:1' | '4:3' | '3:4' | '9:16';
  voiceName: VoicePersonaName;
  voiceStyle: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Generates a deterministic, serene SVG data URI artwork so every meditation pack and session
 * renders a crisp, atmospheric visual even offline or in hermetic sandboxes.
 */
export function createSanctuarySvgDataUri(config: {
  bgStart: string;
  bgEnd: string;
  orbColor: string;
  accentColor: string;
  horizonColor: string;
  motif: 'moss-pond' | 'nordic-fjord' | 'ceramic-tea' | 'coastal-dunes' | 'custom-aura';
  title?: string;
}): string {
  const { bgStart, bgEnd, orbColor, accentColor, horizonColor, motif } = config;

  let motifLayer = '';
  if (motif === 'moss-pond') {
    motifLayer = `
      <ellipse cx="600" cy="540" rx="460" ry="120" fill="${horizonColor}" opacity="0.45" />
      <ellipse cx="600" cy="540" rx="320" ry="74" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.4" />
      <ellipse cx="600" cy="540" rx="190" ry="42" fill="none" stroke="${orbColor}" stroke-width="1.2" opacity="0.55" />
      <path d="M180 120 Q220 280 190 460" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.35" />
      <path d="M220 90 Q260 270 235 450" stroke="${accentColor}" stroke-width="1.5" fill="none" opacity="0.25" />
      <circle cx="600" cy="310" r="115" fill="url(#orbGrad)" opacity="0.85" />
    `;
  } else if (motif === 'nordic-fjord') {
    motifLayer = `
      <circle cx="880" cy="190" r="72" fill="url(#orbGrad)" opacity="0.8" />
      <circle cx="320" cy="150" r="2" fill="#F8FAFC" opacity="0.7" />
      <circle cx="480" cy="110" r="1.5" fill="#F8FAFC" opacity="0.5" />
      <circle cx="710" cy="135" r="2" fill="#F8FAFC" opacity="0.6" />
      <path d="M0 460 L340 290 L610 430 L940 260 L1200 450 L1200 675 L0 675 Z" fill="${horizonColor}" opacity="0.65" />
      <path d="M0 510 L1200 510 L1200 675 L0 675 Z" fill="${bgStart}" opacity="0.75" />
      <line x1="200" y1="555" x2="1000" y2="555" stroke="${accentColor}" stroke-width="1" opacity="0.35" />
      <line x1="340" y1="590" x2="860" y2="590" stroke="${orbColor}" stroke-width="1" opacity="0.3" />
    `;
  } else if (motif === 'ceramic-tea') {
    motifLayer = `
      <circle cx="600" cy="320" r="165" fill="url(#orbGrad)" opacity="0.65" />
      <path d="M440 420 Q445 545 600 545 Q755 545 760 420 Z" fill="${horizonColor}" opacity="0.85" />
      <ellipse cx="600" cy="420" rx="160" ry="26" fill="${accentColor}" opacity="0.45" />
      <path d="M565 360 Q545 290 580 230" stroke="${orbColor}" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round" />
      <path d="M615 350 Q635 280 605 215" stroke="${orbColor}" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round" />
    `;
  } else if (motif === 'coastal-dunes') {
    motifLayer = `
      <circle cx="600" cy="250" r="130" fill="url(#orbGrad)" opacity="0.85" />
      <path d="M0 450 Q320 360 660 435 T1200 400 L1200 675 L0 675 Z" fill="${horizonColor}" opacity="0.6" />
      <path d="M0 515 Q420 445 780 510 T1200 485 L1200 675 L0 675 Z" fill="${accentColor}" opacity="0.32" />
    `;
  } else {
    motifLayer = `
      <circle cx="600" cy="338" r="185" fill="url(#orbGrad)" opacity="0.85" />
      <circle cx="600" cy="338" r="245" fill="none" stroke="${accentColor}" stroke-width="1.2" opacity="0.35" />
      <circle cx="600" cy="338" r="305" fill="none" stroke="${orbColor}" stroke-width="0.8" opacity="0.22" />
      <path d="M0 520 Q600 440 1200 520 L1200 675 L0 675 Z" fill="${horizonColor}" opacity="0.45" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
      <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${orbColor}" stop-opacity="0.95" />
        <stop offset="65%" stop-color="${accentColor}" stop-opacity="0.35" />
        <stop offset="100%" stop-color="${bgEnd}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bgGrad)" />
    ${motifLayer}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const VOICE_PERSONAS: Array<{
  name: VoicePersonaName;
  label: string;
  timbre: string;
  defaultStyle: string;
}> = [
  {
    name: 'Kore',
    label: 'Kore — Warm & Grounding',
    timbre: 'Soft alto, steady presence',
    defaultStyle: 'Warm, unhurried mindfulness teacher with gentle breath pauses',
  },
  {
    name: 'Zephyr',
    label: 'Zephyr — Airy & Ethereal',
    timbre: 'Light, spacious cadence',
    defaultStyle: 'Serene, whisper-soft contemplative guide for deep relaxation',
  },
  {
    name: 'Charon',
    label: 'Charon — Deep & Resonant',
    timbre: 'Low baritone, nocturnal calm',
    defaultStyle: 'Deep, reassuring nocturnal narrator with slow pacing',
  },
  {
    name: 'Puck',
    label: 'Puck — Clear & Uplifting',
    timbre: 'Crisp, attentive clarity',
    defaultStyle: 'Gentle, encouraging morning mindfulness facilitator',
  },
  {
    name: 'Fenrir',
    label: 'Fenrir — Earthy & Somber',
    timbre: 'Grounded, resonant texture',
    defaultStyle: 'Steady, somatic body-scan guide with tranquil authority',
  },
];

export const INITIAL_SOUNDSCAPES: SoundscapeChannel[] = [
  {
    id: 'rain',
    name: 'Rain on Moss',
    category: 'Precipitation',
    description: 'Soft rainfall pattering on Kyoto temple moss and cedar eaves.',
    frequencyProfile: 'Pink noise · 350Hz–3.2kHz droplet veil',
    active: true,
    volume: 42,
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: 'Tidal Rhythm',
    description: 'Long, rhythmic swells rolling onto a quiet pebble shoreline.',
    frequencyProfile: '0.12Hz tidal LFO · 90Hz–800Hz surf wash',
    active: false,
    volume: 35,
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    category: 'Biophilia',
    description: 'High pine breeze with distant harmonic woodland resonance.',
    frequencyProfile: '620Hz canopy filter · organic harmonic chimes',
    active: false,
    volume: 30,
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    category: 'Hearth',
    description: 'Warm birchwood embers settling in a quiet stone hearth.',
    frequencyProfile: '110Hz hearth warmth · micro-ember transients',
    active: false,
    volume: 28,
  },
  {
    id: 'wind',
    name: 'Gentle Wind',
    category: 'High Altitude',
    description: 'Slow valley air moving across coastal dunes and tall reeds.',
    frequencyProfile: 'Dual resonant sweep · 180Hz–540Hz',
    active: false,
    volume: 25,
  },
  {
    id: 'bowls',
    name: 'Singing Bowls',
    category: 'Harmonic Drone',
    description: 'Hand-hammered bronze bowls tuned to a warm 432Hz fifth.',
    frequencyProfile: '432Hz + 648Hz pure harmonic sustain',
    active: true,
    volume: 22,
  },
];

export const MEDITATION_PACKS: MeditationPack[] = [
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    tagline: 'Dissolve accumulated tension and reset your nervous system.',
    description:
      'Four somatic and breath-led journeys crafted to lower cortisol, soften physical bracing in the neck and jaw, and restore quiet mental spaciousness.',
    accentColor: '#6EE7B7',
    coverImageUrl: createSanctuarySvgDataUri({
      bgStart: '#0B1917',
      bgEnd: '#152E2A',
      orbColor: '#A7F3D0',
      accentColor: '#34D399',
      horizonColor: '#064E3B',
      motif: 'moss-pond',
    }),
    meditations: [
      {
        id: 'sr-bamboo-rain',
        packId: 'stress-relief',
        title: 'Bamboo Rain Release',
        subtitle: 'Let each exhalation wash away mental urgency like warm rain on bamboo leaves.',
        durationMinutes: 6,
        voiceName: 'Kore',
        voiceStyle: 'Warm, unhurried mindfulness teacher with soft breath pauses',
        visualStyleName: 'Kyoto Moss & Morning Mist Photography',
        visualPrompt:
          'Minimalist Japanese moss garden at dawn with soft mist rising over a still dark reflection pond, smooth river stones, warm diffused bamboo light.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0B1917',
          bgEnd: '#152E2A',
          orbColor: '#A7F3D0',
          accentColor: '#34D399',
          horizonColor: '#064E3B',
          motif: 'moss-pond',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
        recommendedSoundscapes: ['rain', 'bowls'],
        script: `Allow your posture to settle into effortless support. <breath> You do not need to hold yourself up with tension right now. Notice where your body meets the surface beneath you, and let your weight drop downward by just five percent more.

Picture a quiet courtyard bordered by tall, slender bamboo. <breath> A gentle, warm rain is falling—not a storm, only a steady mist that beads upon each green leaf before slipping softly into the moss below.

Inhale slowly through your nose for a count of four, drawing in cool, rain-washed air. <breath> Hold gently at the top, feeling the ribcage buoyant and wide. Now exhale for a count of six, allowing the shoulders to melt away from the ears. <breath> Every task waiting for you outside this moment can rest on the wet stone path.`,
      },
      {
        id: 'sr-shoulder-jaw',
        packId: 'stress-relief',
        title: 'Shoulder & Jaw Unwinding',
        subtitle: 'Targeted somatic release for the places where daily pressure hides.',
        durationMinutes: 5,
        voiceName: 'Fenrir',
        voiceStyle: 'Steady, somatic body-scan guide with tranquil authority',
        visualStyleName: 'Warm Travertine & Diffused Shadow Study',
        visualPrompt:
          'Architectural minimalist sanctuary of warm travertine stone arches bathed in late afternoon golden light, soft diffused shadows, tranquil stillness.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#181512',
          bgEnd: '#2A231D',
          orbColor: '#FDE68A',
          accentColor: '#D97706',
          horizonColor: '#451A03',
          motif: 'custom-aura',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 2, exhale: 6 },
        recommendedSoundscapes: ['bowls', 'wind'],
        script: `Bring your kind attention to the hinges of your jaw. <breath> Part your lips ever so slightly, and allow the tongue to rest wide and heavy on the floor of the mouth. Notice how softening the jaw sends a quiet signal down the sides of the neck.

Now draw a slow breath into the upper back, right between the shoulder blades. <breath> Pause for two beats. As you breathe out, imagine warm sunlight pouring across your collarbones, widening them from the center outward. <breath> There is nothing you need to brace against in this room.`,
      },
      {
        id: 'sr-pond-stillness',
        packId: 'stress-relief',
        title: 'Quiet Pond Stillness',
        subtitle: 'Watch racing thoughts settle like silt to the bottom of a clear mountain pool.',
        durationMinutes: 8,
        voiceName: 'Zephyr',
        voiceStyle: 'Serene, whisper-soft contemplative guide',
        visualStyleName: 'Sumi-e Ink Wash & Alpine Water Reflection',
        visualPrompt:
          'Still alpine mirror lake surrounded by soft ink-wash silhouettes of distant ridges, single ripple expanding in glass-like water at twilight.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0C1622',
          bgEnd: '#162A3E',
          orbColor: '#93C5FD',
          accentColor: '#38BDF8',
          horizonColor: '#082F49',
          motif: 'moss-pond',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 5, hold: 3, exhale: 7 },
        recommendedSoundscapes: ['forest', 'rain'],
        script: `When a mountain stream enters a deep basin, the water stops rushing and grows mirror-still. <breath> Your mind works in the very same way when you stop stirring the surface.

With your next inhalation, feel the cool clarity of the breath entering your nostrils. <breath> As you exhale slowly, imagine tiny grains of sand and river silt drifting gently to the bottom of a clear pool. <breath> You do not force the water to become clear; you simply allow it to rest until transparency returns on its own.`,
      },
      {
        id: 'sr-cortisol-reset',
        packId: 'stress-relief',
        title: 'Evening Cortisol Reset',
        subtitle: 'Mark the boundary between your workday and your personal sanctuary.',
        durationMinutes: 7,
        voiceName: 'Charon',
        voiceStyle: 'Deep, reassuring narrator with slow pacing',
        visualStyleName: 'Amber Hearth & Cedar Sanctuary',
        visualPrompt:
          'Cozy minimalist timber cabin interior looking out at twilight pines, warm amber glow from a low stone fireplace, serene evening transition.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#1A120F',
          bgEnd: '#2B1B15',
          orbColor: '#FDBA74',
          accentColor: '#EA580C',
          horizonColor: '#431407',
          motif: 'ceramic-tea',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 8 },
        recommendedSoundscapes: ['fire', 'rain'],
        script: `The hours of striving are complete for today. <breath> Whatever remained unfinished can wait for tomorrow's light. Right now, your only responsibility is to return home to your own body.

Take a full breath into the low belly, letting the abdomen expand softly. <breath> Hold for four calm counts. Now release a long, unhurried exhalation for eight counts, feeling your heart rate slow and your hands grow warm. <breath> You have arrived in the quiet evening.`,
      },
    ],
  },
  {
    id: 'better-sleep',
    name: 'Better Sleep',
    tagline: 'Slip effortlessly across the threshold of deep, restorative slumber.',
    description:
      'Nocturnal sound and voice meditations designed with extended exhalations, progressive weightlessness, and soft twilight imagery to quiet late-night rumination.',
    accentColor: '#A5B4FC',
    coverImageUrl: createSanctuarySvgDataUri({
      bgStart: '#090D1A',
      bgEnd: '#151C36',
      orbColor: '#C7D2FE',
      accentColor: '#818CF8',
      horizonColor: '#1E1B4B',
      motif: 'nordic-fjord',
    }),
    meditations: [
      {
        id: 'bs-nordic-fjord',
        packId: 'better-sleep',
        title: 'Nordic Fjord Drift',
        subtitle: 'Float beneath a velvet indigo sky as starlight reflects on glass-calm water.',
        durationMinutes: 10,
        voiceName: 'Charon',
        voiceStyle: 'Deep, reassuring nocturnal narrator with slow pacing',
        visualStyleName: 'Nocturnal Indigo Fjord & Starlight Grain',
        visualPrompt:
          'Quiet Nordic fjord under a deep twilight indigo sky, calm mirror-like water reflecting faint starlight and distant soft amber glow on the horizon.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#090D1A',
          bgEnd: '#151C36',
          orbColor: '#C7D2FE',
          accentColor: '#818CF8',
          horizonColor: '#1E1B4B',
          motif: 'nordic-fjord',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 7, exhale: 8 },
        recommendedSoundscapes: ['ocean', 'wind'],
        script: `Let your eyelids grow heavy and soft, like dark velvet curtains drawing shut at the end of a long performance. <breath> Beneath you, the mattress supports every ounce of your body's weight.

Imagine drifting in a wooden boat across a glass-still northern fjord at midnight. <breath> The water is completely calm, reflecting a canopy of quiet silver stars. Breathe in gently for four counts... hold softly in the stillness... <breath> and release for eight slow counts as the boat glides into deeper, darker peace.`,
      },
      {
        id: 'bs-weightless-body',
        packId: 'better-sleep',
        title: 'Weightless Body Scan',
        subtitle: 'Extinguish physical tension from the tips of your toes to the crown of your head.',
        durationMinutes: 12,
        voiceName: 'Kore',
        voiceStyle: 'Warm, whisper-soft sleep guide',
        visualStyleName: 'Deep Bioluminescent Ocean Dusk',
        visualPrompt:
          'Subtle bioluminescent horizon on a calm midnight sea, soft sapphire and violet gradients, tranquil weightless atmosphere.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#070B19',
          bgEnd: '#111A3A',
          orbColor: '#A5F3FC',
          accentColor: '#6366F1',
          horizonColor: '#0F172A',
          motif: 'nordic-fjord',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 8 },
        recommendedSoundscapes: ['rain', 'bowls'],
        script: `Bring a soft awareness to your feet and ankles. <breath> Feel them growing warm, heavy, and completely still, as if sinking into warm dark sand.

Let that wave of heaviness travel slowly up through the calves, the knees, and the thighs. <breath> With every breath out, your hips and lower back release their hold. Your hands are soft and open. <breath> Your forehead is smooth and cool, drifting gently toward deep rest.`,
      },
      {
        id: 'bs-starlight-breath',
        packId: 'better-sleep',
        title: 'Starlight Breath Count',
        subtitle: 'A gentle descending cadence from ten to one to quiet an active mind.',
        durationMinutes: 8,
        voiceName: 'Zephyr',
        voiceStyle: 'Serene, whisper-soft contemplative guide for deep relaxation',
        visualStyleName: 'Observatory Dome & Midnight Nebula',
        visualPrompt:
          'Minimalist desert horizon under a clear night sky dusted with soft warm starlight, smooth dark silhouettes of hills, tranquil stillness.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0C0A1D',
          bgEnd: '#1D183B',
          orbColor: '#DDD6FE',
          accentColor: '#A78BFA',
          horizonColor: '#2E1065',
          motif: 'nordic-fjord',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 6, exhale: 8 },
        recommendedSoundscapes: ['wind', 'bowls'],
        script: `With each breath out, we will step down a quiet staircase into sleep. <breath> Inhale softly... and as you exhale, silently whisper the number ten, watching a single star fade into the velvet night.

Inhale again without effort... <breath> and exhale nine, feeling the space behind your eyes grow wide and dark. <breath> If you lose track of the numbers, simply smile inwardly and let yourself drift deeper into stillness.`,
      },
      {
        id: 'bs-velvet-horizon',
        packId: 'better-sleep',
        title: 'Velvet Horizon Slumber',
        subtitle: 'Surrender tomorrow’s plans to the quiet rhythm of nocturnal rain.',
        durationMinutes: 9,
        voiceName: 'Charon',
        voiceStyle: 'Deep, reassuring nocturnal narrator',
        visualStyleName: 'Rain-Softened Window & Midnight Amber',
        visualPrompt:
          'Soft out-of-focus raindrops on a dark window pane at night with warm distant amber streetlamp bokeh, cozy quiet bedroom sanctuary.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#090D16',
          bgEnd: '#161F33',
          orbColor: '#FDE68A',
          accentColor: '#60A5FA',
          horizonColor: '#1E293B',
          motif: 'moss-pond',
        }),
        imageSize: '4K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 8 },
        recommendedSoundscapes: ['rain', 'fire'],
        script: `Listen to the steady hush of rain outside the window. <breath> Inside this sanctuary, everything is warm, dry, and unhurried.

Breathe in slowly... <breath> and as you breathe out, let every unfinished thought dissolve into the sound of the rain. <breath> Night is keeping watch for you; you are free to rest completely.`,
      },
    ],
  },
  {
    id: 'mindful-eating',
    name: 'Mindful Eating',
    tagline: 'Awaken sensory presence, gratitude, and calm digestion at the table.',
    description:
      'Grounded contemplative practices to shift your nervous system into rest-and-digest mode, savor textures and aromas, and honor your body’s natural hunger cues.',
    accentColor: '#FCD34D',
    coverImageUrl: createSanctuarySvgDataUri({
      bgStart: '#1C1612',
      bgEnd: '#2E231C',
      orbColor: '#FDE68A',
      accentColor: '#F59E0B',
      horizonColor: '#451A03',
      motif: 'ceramic-tea',
    }),
    meditations: [
      {
        id: 'me-tea-ritual',
        packId: 'mindful-eating',
        title: 'First Sip Tea Ritual',
        subtitle: 'Anchor your senses in warmth, aroma, and stillness before a meal.',
        durationMinutes: 4,
        voiceName: 'Kore',
        voiceStyle: 'Warm, tactile mindfulness guide',
        visualStyleName: 'Kinfolk Linen & Ceramic Tea Still Life',
        visualPrompt:
          'Artisanal ceramic tea bowl and fresh figs on warm natural linen cloth over unfinished oak wood table, gentle morning sunlight casting soft shadows.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#1C1612',
          bgEnd: '#2E231C',
          orbColor: '#FDE68A',
          accentColor: '#F59E0B',
          horizonColor: '#451A03',
          motif: 'ceramic-tea',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 2, exhale: 5 },
        recommendedSoundscapes: ['forest', 'bowls'],
        script: `Before lifting your cup or utensil, rest both palms lightly on the table. <breath> Feel the solid grain of the surface and the quiet pause before nourishment begins.

Take a slow breath in, noticing any subtle aromas rising in the air. <breath> Exhale gently, allowing your stomach and solar plexus to soften. <breath> When we eat from a place of calm presence, the body receives every flavor as a gift.`,
      },
      {
        id: 'me-sensory-gratitude',
        packId: 'mindful-eating',
        title: 'Sensory Gratitude Pause',
        subtitle: 'Trace the sunlight, rain, and soil woven into the meal before you.',
        durationMinutes: 5,
        voiceName: 'Puck',
        voiceStyle: 'Gentle, appreciative mindfulness facilitator',
        visualStyleName: 'Sunlit Orchard & Warm Terracotta',
        visualPrompt:
          'Golden hour sunlight filtering through olive tree branches onto a rustic terracotta plate and woven linen napkin, warm Mediterranean serenity.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#1F1811',
          bgEnd: '#36281B',
          orbColor: '#FEF08A',
          accentColor: '#D97706',
          horizonColor: '#78350F',
          motif: 'ceramic-tea',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 3, exhale: 5 },
        recommendedSoundscapes: ['forest', 'wind'],
        script: `Look softly at the colors and textures resting on your plate. <breath> Notice the shades of earth, leaf, and sunlight gathered right in front of you.

Breathe in for four counts, activating the body's rest-and-digest response. <breath> Breathe out for five counts, letting go of any rush to finish or multitask. <breath> Let your first bite be unhurried, noticing temperature, texture, and subtle sweetness.`,
      },
      {
        id: 'me-hunger-attunement',
        packId: 'mindful-eating',
        title: 'Hunger & Fullness Attunement',
        subtitle: 'Listen to somatic signals of nourishment without judgment or rules.',
        durationMinutes: 6,
        voiceName: 'Kore',
        voiceStyle: 'Compassionate, somatic mindfulness teacher',
        visualStyleName: 'Soft Botanical Watercolor & Warm Parchment',
        visualPrompt:
          'Minimalist botanical study of wheat stems and sage leaves on warm handmade paper, soft natural window light, calm organic balance.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#171A14',
          bgEnd: '#262C20',
          orbColor: '#D9F99D',
          accentColor: '#84CC16',
          horizonColor: '#365314',
          motif: 'ceramic-tea',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
        recommendedSoundscapes: ['bowls'],
        script: `Place one hand gently over the center of your abdomen. <breath> Without judging what you find, ask your body what kind of nourishment it is asking for in this moment.

Is it physical energy, warmth, hydration, or simply a five-minute pause from the day's demands? <breath> Breathe in with curiosity... and breathe out with kindness toward your body's honest signals.`,
      },
      {
        id: 'me-nourishing-earth',
        packId: 'mindful-eating',
        title: 'Nourishing Earth Connection',
        subtitle: 'Settle post-meal digestion with gentle diaphragmatic breathing.',
        durationMinutes: 5,
        voiceName: 'Fenrir',
        voiceStyle: 'Grounded, warm somatic guide',
        visualStyleName: 'Warm Clay & Hearth Light',
        visualPrompt:
          'Handcrafted stoneware vessels arranged in quiet balance on a dark wood shelf with warm golden rim lighting, serene wabi-sabi aesthetic.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#191412',
          bgEnd: '#2B211D',
          orbColor: '#FDBA74',
          accentColor: '#F97316',
          horizonColor: '#431407',
          motif: 'ceramic-tea',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 2, exhale: 6 },
        recommendedSoundscapes: ['fire', 'bowls'],
        script: `Sit comfortably with your spine tall yet relaxed. <breath> Allow your belly to be completely soft as your body begins the quiet work of digestion.

Inhale gently through the nose, feeling a subtle warmth at the center of the body. <breath> Exhale slowly, letting gratitude settle through every cell. <breath> Carry this unhurried rhythm into the next part of your day.`,
      },
    ],
  },
  {
    id: 'anxiety-reduction',
    name: 'Anxiety Reduction',
    tagline: 'Anchor a racing mind in immediate sensory safety and steady breath.',
    description:
      'Evidence-informed grounding meditations combining physiological sighs, 5-4-3-2-1 sensory orientation, and expansive horizon imagery to calm acute overwhelm.',
    accentColor: '#7DD3FC',
    coverImageUrl: createSanctuarySvgDataUri({
      bgStart: '#0B1724',
      bgEnd: '#172C42',
      orbColor: '#BAE6FD',
      accentColor: '#38BDF8',
      horizonColor: '#0C4A6E',
      motif: 'coastal-dunes',
    }),
    meditations: [
      {
        id: 'ar-coastal-dune',
        packId: 'anxiety-reduction',
        title: 'Coastal Dune Grounding',
        subtitle: 'Widen your visual and mental horizon when thoughts feel constricted.',
        durationMinutes: 6,
        voiceName: 'Kore',
        voiceStyle: 'Calm, steady, reassuring trauma-informed guide',
        visualStyleName: 'Golden Hour Coastal Dunes & Sea Grass',
        visualPrompt:
          'Expansive coastal sand dunes at golden hour with soft wind-sculpted ripples, gentle ocean horizon in the distance, muted sage sea grass.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0B1724',
          bgEnd: '#172C42',
          orbColor: '#BAE6FD',
          accentColor: '#38BDF8',
          horizonColor: '#0C4A6E',
          motif: 'coastal-dunes',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 2, exhale: 6 },
        recommendedSoundscapes: ['ocean', 'wind'],
        script: `When anxiety rises, our attention narrows like a tight spotlight. <breath> Right now, we are going to gently widen the lens.

Feel the firm ground beneath your feet. Press your heels down slightly and notice the unshakeable support of the floor. <breath> Imagine standing atop a quiet coastal dune looking out at a wide, unbroken ocean horizon.

Inhale smoothly for four counts... <breath> and exhale for six counts, letting your peripheral vision soften and expand. <breath> In this exact second, you are safe, supported, and breathing.`,
      },
      {
        id: 'ar-sensory-anchor',
        packId: 'anxiety-reduction',
        title: '5-4-3-2-1 Sensory Anchor',
        subtitle: 'Return from future "what-ifs" into the tangible reality of right now.',
        durationMinutes: 5,
        voiceName: 'Puck',
        voiceStyle: 'Clear, grounding, compassionate facilitator',
        visualStyleName: 'Sunlit Pebble Beach & Clear Shallows',
        visualPrompt:
          'Smooth colorful coastal pebbles beneath crystal clear shallow tide water, gentle sunlight refraction patterns, grounding tactile clarity.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0E1B24',
          bgEnd: '#1B3442',
          orbColor: '#A7F3D0',
          accentColor: '#2DD4BF',
          horizonColor: '#115E59',
          motif: 'coastal-dunes',
        }),
        imageSize: '1K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
        recommendedSoundscapes: ['ocean', 'bowls'],
        script: `Let us anchor your awareness in the physical room around you. <breath> Keep your eyes softly open or resting downward.

Silently notice three textures you can feel right now—perhaps the fabric resting against your sleeves, the warmth of your hands, or the cool air at the tip of your nose. <breath> Now listen to the furthest sound in the background, and then the closest sound. <breath> Breathe in for four... hold for four... and exhale for six. Your body is here in the present moment.`,
      },
      {
        id: 'ar-safe-harbor',
        packId: 'anxiety-reduction',
        title: 'Safe Harbor Breathwork',
        subtitle: 'Use an extended exhalation cadence to engage your vagal brake.',
        durationMinutes: 7,
        voiceName: 'Charon',
        voiceStyle: 'Deep, steady, protective calm',
        visualStyleName: 'Misty Lighthouse Cove at Dawn',
        visualPrompt:
          'Sheltered coastal cove with calm turquoise water protected by smooth granite cliffs at dawn, soft pink and slate sky, tranquil safe harbor.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0F172A',
          bgEnd: '#1E293B',
          orbColor: '#FBCFE8',
          accentColor: '#38BDF8',
          horizonColor: '#0F172A',
          motif: 'coastal-dunes',
        }),
        imageSize: '2K',
        breathingPattern: { inhale: 4, hold: 4, exhale: 8 },
        recommendedSoundscapes: ['ocean', 'rain'],
        script: `Even when the open sea is choppy, a sheltered harbor remains calm within its stone breakwater. <breath> Your breath is that breakwater.

Take a steady breath in through the nose for four counts, filling the low ribs. <breath> Pause gently for four counts. Now part your lips slightly and breathe out as if blowing through a thin straw for eight slow counts. <breath> Feel the chest settle and the nervous system step down from high alert.`,
      },
      {
        id: 'ar-passing-clouds',
        packId: 'anxiety-reduction',
        title: 'Passing Clouds Observation',
        subtitle: 'Practice cognitive defusion by watching anxious thoughts drift by like weather.',
        durationMinutes: 6,
        voiceName: 'Zephyr',
        voiceStyle: 'Spacious, unhurried contemplative voice',
        visualStyleName: 'High Alpine Meadow & Drifting Cumulus',
        visualPrompt:
          'Wide alpine meadow with soft wildflowers looking up at a vast serene sky with slow drifting white clouds, spacious perspective.',
        imageUrl: createSanctuarySvgDataUri({
          bgStart: '#0D192B',
          bgEnd: '#1C3557',
          orbColor: '#E0F2FE',
          accentColor: '#60A5FA',
          horizonColor: '#1E3A8A',
          motif: 'coastal-dunes',
        }),
        imageSize: '4K',
        breathingPattern: { inhale: 4, hold: 3, exhale: 6 },
        recommendedSoundscapes: ['wind', 'forest'],
        script: `You are not the weather; you are the wide sky in which the weather appears. <breath> However dark or fast a cloud moves across the valley, it never stains or damages the sky itself.

When an anxious thought arises during this breath, simply label it softly: "thinking." <breath> Place it on a passing cloud and watch it drift toward the horizon while you remain anchored in the steady rhythm of your breathing.`,
      },
    ],
  },
];

export function validateCustomSessionInput(input: Partial<CustomSessionFormInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const trimmedTopic = (input.topic || '').trim();
  if (!trimmedTopic) {
    errors.topic = 'Please enter an intention, mood, or focus for your custom session.';
  } else if (trimmedTopic.length < 3) {
    errors.topic = 'Intention must be at least 3 characters long.';
  }

  const duration = Number(input.durationMinutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 60) {
    errors.durationMinutes = 'Duration must be between 1 and 60 minutes.';
  }

  const validSizes: ImageResolutionSize[] = ['1K', '2K', '4K'];
  if (!input.imageSize || !validSizes.includes(input.imageSize)) {
    errors.imageSize = 'Please select a valid image resolution (1K, 2K, or 4K).';
  }

  const validVoices: VoicePersonaName[] = ['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'];
  if (!input.voiceName || !validVoices.includes(input.voiceName)) {
    errors.voiceName = 'Please select a valid voice persona.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterMeditationsByPackAndQuery(
  packs: MeditationPack[],
  selectedPackId: string,
  searchQuery: string
): GuidedMeditation[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const targetPacks =
    selectedPackId === 'all' ? packs : packs.filter((p) => p.id === selectedPackId);

  const allMeditations = targetPacks.flatMap((p) => p.meditations);
  if (!normalizedQuery) {
    return allMeditations;
  }

  return allMeditations.filter(
    (m) =>
      m.title.toLowerCase().includes(normalizedQuery) ||
      m.subtitle.toLowerCase().includes(normalizedQuery) ||
      m.visualStyleName.toLowerCase().includes(normalizedQuery) ||
      m.script.toLowerCase().includes(normalizedQuery)
  );
}

export function calculateBreathingPhase(
  elapsedSeconds: number,
  pattern: BreathingPattern
): {
  phase: 'Inhale' | 'Hold' | 'Exhale';
  secondsRemainingInPhase: number;
  phaseProgress: number;
  cycleLength: number;
} {
  const inhale = Math.max(1, pattern.inhale);
  const hold = Math.max(0, pattern.hold);
  const exhale = Math.max(1, pattern.exhale);
  const cycleLength = inhale + hold + exhale;

  const safeElapsed = Math.max(0, elapsedSeconds);
  const pos = safeElapsed % cycleLength;

  if (pos < inhale) {
    return {
      phase: 'Inhale',
      secondsRemainingInPhase: Math.ceil(inhale - pos),
      phaseProgress: pos / inhale,
      cycleLength,
    };
  }

  if (hold > 0 && pos < inhale + hold) {
    const holdPos = pos - inhale;
    return {
      phase: 'Hold',
      secondsRemainingInPhase: Math.ceil(hold - holdPos),
      phaseProgress: holdPos / hold,
      cycleLength,
    };
  }

  const exhalePos = pos - inhale - hold;
  return {
    phase: 'Exhale',
    secondsRemainingInPhase: Math.ceil(exhale - exhalePos),
    phaseProgress: exhalePos / exhale,
    cycleLength,
  };
}

export function updateSoundscapeMix(
  channels: SoundscapeChannel[],
  soundId: SoundscapeId,
  updates: { active?: boolean; volume?: number }
): SoundscapeChannel[] {
  return channels.map((ch) => {
    if (ch.id !== soundId) return ch;
    const nextVolume =
      updates.volume !== undefined
        ? Math.max(0, Math.min(100, Math.round(updates.volume)))
        : ch.volume;
    const nextActive = updates.active !== undefined ? updates.active : ch.active;
    return {
      ...ch,
      active: nextActive,
      volume: nextVolume,
    };
  });
}

export function getActiveSoundscapeSummary(channels: SoundscapeChannel[]): {
  activeCount: number;
  activeNames: string[];
  averageVolume: number;
} {
  const active = channels.filter((c) => c.active && c.volume > 0);
  if (active.length === 0) {
    return { activeCount: 0, activeNames: [], averageVolume: 0 };
  }
  const sum = active.reduce((acc, c) => acc + c.volume, 0);
  return {
    activeCount: active.length,
    activeNames: active.map((c) => c.name),
    averageVolume: Math.round(sum / active.length),
  };
}

export function estimateScriptDurationSeconds(script: string): number {
  const cleaned = script.replace(/<breath>/gi, ' ').trim();
  if (!cleaned) return 0;
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  const breathCount = (script.match(/<breath>/gi) || []).length;
  // ~110 words per minute for slow meditative pacing + 3 seconds per <breath> pause
  return Math.max(15, Math.round((words / 110) * 60 + breathCount * 3));
}

export function buildFallbackCustomMeditation(input: CustomSessionFormInput): GuidedMeditation {
  const cleanTopic = input.topic.trim();
  const customSvg = createSanctuarySvgDataUri({
    bgStart: '#0D1726',
    bgEnd: '#1E293B',
    orbColor: '#A7F3D0',
    accentColor: '#38BDF8',
    horizonColor: '#0F172A',
    motif: 'custom-aura',
  });

  return {
    id: `custom-${Date.now()}`,
    packId: 'custom',
    title: cleanTopic.length > 32 ? `${cleanTopic.slice(0, 32)}...` : cleanTopic,
    subtitle: `Custom ${input.durationMinutes}-minute sanctuary session crafted with ${input.voiceName} voiceover and ${input.imageSize} visual direction.`,
    durationMinutes: input.durationMinutes,
    voiceName: input.voiceName,
    voiceStyle: input.voiceStyle,
    visualStyleName: input.visualStyle || 'Atmospheric Sanctuary Horizon',
    visualPrompt:
      input.visualPrompt ||
      `Serene meditation sanctuary inspired by ${cleanTopic}, ${input.visualStyle}, atmospheric light.`,
    imageUrl: customSvg,
    imageSize: input.imageSize,
    breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
    recommendedSoundscapes: ['rain', 'bowls'],
    script: `Welcome to your personal sanctuary for ${cleanTopic}. <breath> Allow your eyes to soften and your shoulders to drop away from your ears.

Take a slow, deliberate breath in through the nose for four counts, inviting spaciousness into the chest. <breath> Hold gently at the top... and release a long, unhurried exhalation for six counts.

As you visualize ${input.visualStyle.toLowerCase()}, notice how every breath anchors you deeper into calm clarity. <breath> Whenever your attention wanders, gently return to the steady rhythm of this breath.`,
    isCustom: true,
  };
}
