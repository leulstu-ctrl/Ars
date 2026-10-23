import React from 'react';
import { Volume2, VolumeX, RotateCcw, Sliders } from 'lucide-react';
import {
  SoundscapeChannel,
  SoundscapeId,
  getActiveSoundscapeSummary,
} from '../utils/meditationLogic';

interface AmbientMixerSectionProps {
  channels: SoundscapeChannel[];
  masterPlaying: boolean;
  masterVolume: number;
  onToggleMaster: () => void;
  onChangeMasterVolume: (vol: number) => void;
  onToggleChannel: (id: SoundscapeId) => void;
  onChangeChannelVolume: (id: SoundscapeId, vol: number) => void;
  onApplyPreset: (presetName: string, activeIds: SoundscapeId[]) => void;
  onResetMix: () => void;
}

const AMBIENT_PRESETS: Array<{
  name: string;
  subtitle: string;
  ids: SoundscapeId[];
}> = [
  {
    name: 'Kyoto Temple Rain',
    subtitle: 'Rain on Moss + Singing Bowls',
    ids: ['rain', 'bowls'],
  },
  {
    name: 'Midnight Coastal Tide',
    subtitle: 'Ocean Waves + Gentle Wind',
    ids: ['ocean', 'wind'],
  },
  {
    name: 'Nordic Hearth Retreat',
    subtitle: 'Crackling Fire + Rain on Moss',
    ids: ['fire', 'rain'],
  },
  {
    name: 'Deep Woodland Sanctuary',
    subtitle: 'Forest Canopy + Gentle Wind + Bowls',
    ids: ['forest', 'wind', 'bowls'],
  },
];

export const AmbientMixerSection: React.FC<AmbientMixerSectionProps> = ({
  channels,
  masterPlaying,
  masterVolume,
  onToggleMaster,
  onChangeMasterVolume,
  onToggleChannel,
  onChangeChannelVolume,
  onApplyPreset,
  onResetMix,
}) => {
  const summary = getActiveSoundscapeSummary(channels);

  return (
    <section
      id="ambient-soundscapes"
      aria-label="Ambient Soundscapes Mixer"
      className="mx-auto max-w-[1280px] border-t border-slate-800/80 px-6 py-12"
    >
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs text-slate-400">
            <span>Acoustic Sanctuary Layer</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {summary.activeCount} of {channels.length} channels active
            </span>
            {summary.activeCount > 0 && (
              <>
                <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
                <span>{summary.activeNames.join(' + ')}</span>
              </>
            )}
          </p>
          <h2 className="mt-1 font-serif-display text-3xl font-semibold text-slate-50">
            Ambient Soundscape Mixer
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Play natural soundscapes independently for focused work and sleep, or layer them seamlessly beneath your guided meditation voiceover.
          </p>
        </div>

        {/* Master Playback & Volume Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
            <label
              htmlFor="master-ambient-volume"
              className="text-xs font-medium text-slate-300 whitespace-nowrap"
            >
              Master Gain
            </label>
            <input
              id="master-ambient-volume"
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => onChangeMasterVolume(Number(e.target.value))}
              className="h-1.5 w-24 cursor-pointer accent-emerald-400"
            />
            <span className="w-9 text-right font-mono-tabular text-xs text-slate-300">
              {masterVolume}%
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMaster}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              masterPlaying
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                : 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
            }`}
          >
            {masterPlaying ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Pause Ambient Audio</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Play Ambient Soundscapes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetMix}
            aria-label="Reset soundscape mix"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Mix</span>
          </button>
        </div>
      </div>

      {/* Curated Soundscape Mix Presets */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
          <Sliders className="h-3.5 w-3.5" />
          <span>Acoustic Presets:</span>
        </span>
        {AMBIENT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onApplyPreset(preset.name, preset.ids)}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            {preset.name} ({preset.subtitle})
          </button>
        ))}
      </div>

      {/* 6-Channel Soundscape Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
              channel.active
                ? 'border-emerald-400/60 bg-slate-900/80'
                : 'border-slate-800/80 bg-slate-900/35 hover:border-slate-700/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">
                    <span>{channel.category}</span>
                    <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      {channel.active ? `Active (${channel.volume}%)` : 'Muted'}
                    </span>
                  </p>
                  <h3 className="mt-0.5 font-serif-display text-xl font-semibold text-slate-100">
                    {channel.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleChannel(channel.id)}
                  aria-pressed={channel.active}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    channel.active
                      ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                      : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {channel.active ? 'Enabled' : 'Enable'}
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {channel.description}
              </p>
              <p className="mt-1.5 font-mono-tabular text-[11px] text-slate-400">
                {channel.frequencyProfile}
              </p>
            </div>

            <div className="mt-4 border-t border-slate-800/70 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label htmlFor={`volume-${channel.id}`}>Channel Level</label>
                <span className="font-mono-tabular text-slate-200">{channel.volume}%</span>
              </div>
              <input
                id={`volume-${channel.id}`}
                type="range"
                min={0}
                max={100}
                value={channel.volume}
                onChange={(e) =>
                  onChangeChannelVolume(channel.id, Number(e.target.value))
                }
                aria-label={`${channel.name} volume level`}
                className="mt-1.5 h-1.5 w-full cursor-pointer accent-emerald-400"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
