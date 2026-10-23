import React, { useState } from 'react';
import { Play, Search, Sparkles } from 'lucide-react';
import {
  MeditationPack,
  GuidedMeditation,
  filterMeditationsByPackAndQuery,
} from '../utils/meditationLogic';

interface ThemedPacksSectionProps {
  packs: MeditationPack[];
  customSessions: GuidedMeditation[];
  activeSessionId: string;
  onSelectMeditation: (meditation: GuidedMeditation) => void;
  onOpenCustomStudio: () => void;
}

export const ThemedPacksSection: React.FC<ThemedPacksSectionProps> = ({
  packs,
  customSessions,
  activeSessionId,
  onSelectMeditation,
  onOpenCustomStudio,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('stress-relief');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allPacksWithCustom: MeditationPack[] =
    customSessions.length > 0
      ? [
          ...packs,
          {
            id: 'custom',
            name: 'Your Custom Sessions',
            tagline: 'Personal meditations crafted in the Custom Studio.',
            description:
              'Sessions generated with your bespoke intention, custom Gemini 3 Pro Image visuals, and Gemini 3.8 Flash TTS voiceovers.',
            accentColor: '#34D399',
            coverImageUrl: customSessions[0].imageUrl,
            meditations: customSessions,
          },
        ]
      : packs;

  const currentPack =
    allPacksWithCustom.find((p) => p.id === selectedPackId) || allPacksWithCustom[0];

  const displayedMeditations = filterMeditationsByPackAndQuery(
    allPacksWithCustom,
    selectedPackId,
    searchQuery
  );

  return (
    <section
      id="themed-packs"
      aria-label="Themed Meditation Packs"
      className="mx-auto max-w-[1280px] border-t border-slate-800/80 px-6 py-12"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs text-slate-400">
            <span>Curated Sanctuary Collections</span>
            <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
            <span>4 Themed Packs · 16 Guided Scripts & Visual Directions</span>
          </p>
          <h2 className="mt-1 font-serif-display text-3xl font-semibold text-slate-50">
            Themed Meditation Packs
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Explore curated packs for Stress Relief, Better Sleep, Mindful Eating, and Anxiety Reduction. Each meditation pairs a distinct visual aesthetic with a calming voiceover script.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <label htmlFor="meditation-search" className="sr-only">
            Search guided meditations
          </label>
          <Search className="pointer-events-none left-3 top-2.5 h-4 w-4 text-slate-400 absolute" />
          <input
            id="meditation-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes, visuals, scripts..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Interactive Filter Tabs (Functional Segmented Buttons) */}
      <div
        role="tablist"
        aria-label="Filter meditation packs by theme"
        className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900/90 p-1.5 border border-slate-800/90 w-fit"
      >
        {allPacksWithCustom.map((pack) => {
          const isSelected = selectedPackId === pack.id;
          return (
            <button
              key={pack.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setSelectedPackId(pack.id)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              {pack.name} ({pack.meditations.length})
            </button>
          );
        })}
        <button
          role="tab"
          aria-selected={selectedPackId === 'all'}
          type="button"
          onClick={() => setSelectedPackId('all')}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            selectedPackId === 'all'
              ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
          }`}
        >
          All Meditations ({allPacksWithCustom.reduce((acc, p) => acc + p.meditations.length, 0)})
        </button>
      </div>

      {/* Pack Overview Banner (When a specific pack is active) */}
      {selectedPackId !== 'all' && currentPack && (
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs text-slate-400">
              <span>Theme Collection</span>
              <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono-tabular">{currentPack.meditations.length} Guided Sessions</span>
            </p>
            <h3 className="mt-0.5 font-serif-display text-2xl font-semibold text-slate-100">
              {currentPack.name} — {currentPack.tagline}
            </h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300">
              {currentPack.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCustomStudio}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Generate Custom Session</span>
          </button>
        </div>
      )}

      {/* Meditations Grid */}
      {displayedMeditations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-300">
            No guided meditations matched "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Reset Search Filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayedMeditations.map((meditation) => {
            const isActive = meditation.id === activeSessionId;
            return (
              <article
                key={meditation.id}
                className={`flex flex-col justify-between rounded-2xl border transition-colors overflow-hidden ${
                  isActive
                    ? 'border-emerald-400/70 bg-slate-900/80'
                    : 'border-slate-800/90 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Artwork Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={meditation.imageUrl}
                      alt={`${meditation.title} — ${meditation.visualStyleName}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover opacity-85"
                    />
                    <div className=" inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent absolute" />
                    <div className=" bottom-3 left-4 right-4 flex items-baseline justify-between gap-2 absolute">
                      <p className="text-xs text-slate-300">
                        <span className="font-mono-tabular">{meditation.durationMinutes} min</span>
                        <span className="mx-1.5 text-slate-500" aria-hidden="true">·</span>
                        <span>Voice: {meditation.voiceName}</span>
                        <span className="mx-1.5 text-slate-500" aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{meditation.imageSize} Visual</span>
                      </p>
                      {isActive && (
                        <span className="text-xs font-medium text-emerald-300">
                          Loaded in Sanctuary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Title, Visual Style Proposal, and Calming Voiceover Script Excerpt */}
                  <div className="p-5">
                    <h4 className="font-serif-display text-2xl font-semibold text-slate-50">
                      {meditation.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300">{meditation.subtitle}</p>

                    <div className="mt-4 space-y-2 border-t border-slate-800/70 pt-3 text-xs">
                      <p className="text-slate-300">
                        <span className="font-medium text-slate-100">Visual Style Direction: </span>
                        {meditation.visualStyleName} — <span className="text-slate-400">{meditation.visualPrompt}</span>
                      </p>
                      <div className="rounded-lg bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
                        <span className="font-medium text-slate-200">Voiceover Script ({meditation.voiceName}): </span>
                        <span className="italic">
                          "{meditation.script.replace(/<breath>/g, ' · ').slice(0, 220)}..."
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="flex items-center justify-between border-t border-slate-800/70 px-5 py-3.5 bg-slate-950/40">
                  <span className="text-xs text-slate-400">
                    Sounds: {meditation.recommendedSoundscapes.join(' · ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectMeditation(meditation)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>
                      {isActive ? 'Active in Sanctuary' : `Load "${meditation.title}"`}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
