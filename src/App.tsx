/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MEDITATION_PACKS,
  INITIAL_SOUNDSCAPES,
  MeditationPack,
  GuidedMeditation,
  SoundscapeChannel,
  SoundscapeId,
  ImageResolutionSize,
  updateSoundscapeMix,
} from './utils/meditationLogic';
import { soundscapeEngine } from './utils/soundscapeEngine';
import { SanctuaryPlayer } from './components/SanctuaryPlayer';
import { ThemedPacksSection } from './components/ThemedPacksSection';
import { AmbientMixerSection } from './components/AmbientMixerSection';
import { CustomSessionStudio } from './components/CustomSessionStudio';
import { MindfulnessCoachSection } from './components/MindfulnessCoachSection';

export default function App() {
  const [packs, setPacks] = useState<MeditationPack[]>(MEDITATION_PACKS);
  const [customSessions, setCustomSessions] = useState<GuidedMeditation[]>([]);
  const [activeSession, setActiveSession] = useState<GuidedMeditation>(
    MEDITATION_PACKS[0].meditations[0]
  );

  // Ambient Soundscape State
  const [soundscapes, setSoundscapes] = useState<SoundscapeChannel[]>(INITIAL_SOUNDSCAPES);
  const [ambientMasterPlaying, setAmbientMasterPlaying] = useState<boolean>(false);
  const [ambientMasterVolume, setAmbientMasterVolume] = useState<number>(80);

  // Sync Web Audio Engine whenever channels or master playback change
  useEffect(() => {
    soundscapeEngine.syncChannels(soundscapes, ambientMasterPlaying, ambientMasterVolume);
  }, [soundscapes, ambientMasterPlaying, ambientMasterVolume]);

  useEffect(() => {
    return () => {
      soundscapeEngine.stopAll();
    };
  }, []);

  const handleSelectMeditation = (meditation: GuidedMeditation) => {
    setActiveSession(meditation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSessionArtwork = (
    sessionId: string,
    newImageUrl: string,
    newImageSize: ImageResolutionSize
  ) => {
    setActiveSession((prev) =>
      prev.id === sessionId
        ? { ...prev, imageUrl: newImageUrl, imageSize: newImageSize }
        : prev
    );

    setPacks((prevPacks) =>
      prevPacks.map((pack) => ({
        ...pack,
        meditations: pack.meditations.map((m) =>
          m.id === sessionId
            ? { ...m, imageUrl: newImageUrl, imageSize: newImageSize }
            : m
        ),
      }))
    );

    setCustomSessions((prevCustom) =>
      prevCustom.map((m) =>
        m.id === sessionId
          ? { ...m, imageUrl: newImageUrl, imageSize: newImageSize }
          : m
      )
    );
  };

  const handleApplyRecommendedSounds = (recommendedIds: SoundscapeId[]) => {
    setSoundscapes((prev) =>
      prev.map((ch) => ({
        ...ch,
        active: recommendedIds.includes(ch.id),
        volume: recommendedIds.includes(ch.id) ? Math.max(ch.volume, 35) : ch.volume,
      }))
    );
    setAmbientMasterPlaying(true);
  };

  const handleToggleChannel = (id: SoundscapeId) => {
    setSoundscapes((prev) => {
      const target = prev.find((c) => c.id === id);
      const nextActive = target ? !target.active : true;
      return updateSoundscapeMix(prev, id, {
        active: nextActive,
        volume: nextActive && target && target.volume === 0 ? 35 : target?.volume,
      });
    });
  };

  const handleChangeChannelVolume = (id: SoundscapeId, volume: number) => {
    setSoundscapes((prev) =>
      updateSoundscapeMix(prev, id, {
        volume,
        active: volume > 0,
      })
    );
  };

  const handleApplyPreset = (_presetName: string, activeIds: SoundscapeId[]) => {
    setSoundscapes((prev) =>
      prev.map((ch) => ({
        ...ch,
        active: activeIds.includes(ch.id),
        volume: activeIds.includes(ch.id) ? Math.max(ch.volume, 40) : ch.volume,
      }))
    );
    setAmbientMasterPlaying(true);
  };

  const handleResetMix = () => {
    setSoundscapes(INITIAL_SOUNDSCAPES);
    setAmbientMasterPlaying(false);
  };

  const handleCustomSessionCreated = (newSession: GuidedMeditation) => {
    setCustomSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    handleApplyRecommendedSounds(newSession.recommendedSoundscapes);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-800/80 bg-[#090D16]/90 px-6 py-4 backdrop-blur-md">
        {/* Zone 1: Single text element brand wordmark */}
        <a
          href="#top"
          className="font-serif-display text-2xl font-semibold tracking-tight text-slate-50 whitespace-nowrap shrink-0"
        >
          Aether Sanctuary
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
        >
          <a
            href="#themed-packs"
            className="hover:text-slate-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Themed Packs
          </a>
          <a
            href="#ambient-soundscapes"
            className="hover:text-slate-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Soundscapes
          </a>
          <a
            href="#custom-studio"
            className="hover:text-slate-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Custom Studio
          </a>
          <a
            href="#mindfulness-coach"
            className="hover:text-slate-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mindfulness Coach
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('custom-studio')}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 whitespace-nowrap shrink-0"
          >
            New Custom Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="top">
        <SanctuaryPlayer
          session={activeSession}
          soundscapes={soundscapes}
          ambientMasterPlaying={ambientMasterPlaying}
          onToggleAmbientMaster={() => setAmbientMasterPlaying((prev) => !prev)}
          onApplyRecommendedSounds={handleApplyRecommendedSounds}
          onUpdateSessionArtwork={handleUpdateSessionArtwork}
          onOpenCustomStudio={() => scrollToSection('custom-studio')}
        />

        <ThemedPacksSection
          packs={packs}
          customSessions={customSessions}
          activeSessionId={activeSession.id}
          onSelectMeditation={handleSelectMeditation}
          onOpenCustomStudio={() => scrollToSection('custom-studio')}
        />

        <AmbientMixerSection
          channels={soundscapes}
          masterPlaying={ambientMasterPlaying}
          masterVolume={ambientMasterVolume}
          onToggleMaster={() => setAmbientMasterPlaying((prev) => !prev)}
          onChangeMasterVolume={setAmbientMasterVolume}
          onToggleChannel={handleToggleChannel}
          onChangeChannelVolume={handleChangeChannelVolume}
          onApplyPreset={handleApplyPreset}
          onResetMix={handleResetMix}
        />

        <CustomSessionStudio onSessionCreated={handleCustomSessionCreated} />

        <MindfulnessCoachSection />
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span>Aether — Guided Meditation & Contemplative Soundscape Studio</span>
          <div className="flex items-center gap-6">
            <a href="#themed-packs" className="hover:text-slate-200">
              Themed Packs
            </a>
            <a href="#ambient-soundscapes" className="hover:text-slate-200">
              Soundscapes
            </a>
            <a href="#custom-studio" className="hover:text-slate-200">
              Custom Studio
            </a>
            <a href="#mindfulness-coach" className="hover:text-slate-200">
              Mindfulness Coach
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
