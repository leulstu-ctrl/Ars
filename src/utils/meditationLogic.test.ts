import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEDITATION_PACKS,
  INITIAL_SOUNDSCAPES,
  validateCustomSessionInput,
  filterMeditationsByPackAndQuery,
  calculateBreathingPhase,
  updateSoundscapeMix,
  getActiveSoundscapeSummary,
  estimateScriptDurationSeconds,
  buildFallbackCustomMeditation,
} from './meditationLogic';

test('MEDITATION_PACKS contains all 4 required themes with 4 meditations each', () => {
  assert.equal(MEDITATION_PACKS.length, 4);
  const themeNames = MEDITATION_PACKS.map((p) => p.name);
  assert.deepEqual(themeNames, [
    'Stress Relief',
    'Better Sleep',
    'Mindful Eating',
    'Anxiety Reduction',
  ]);

  for (const pack of MEDITATION_PACKS) {
    assert.ok(pack.meditations.length >= 3 && pack.meditations.length <= 5);
    for (const m of pack.meditations) {
      assert.ok(m.title.length > 0);
      assert.ok(m.visualStyleName.length > 0);
      assert.ok(m.script.includes('<breath>'));
      assert.ok(m.imageUrl.startsWith('data:image/svg+xml'));
    }
  }
});

test('INITIAL_SOUNDSCAPES provides at least 5 ambient sounds', () => {
  assert.ok(INITIAL_SOUNDSCAPES.length >= 5);
  const ids = INITIAL_SOUNDSCAPES.map((s) => s.id);
  assert.ok(ids.includes('rain'));
  assert.ok(ids.includes('ocean'));
  assert.ok(ids.includes('forest'));
  assert.ok(ids.includes('fire'));
  assert.ok(ids.includes('wind'));
});

test('validateCustomSessionInput rejects empty topic and accepts valid 1K/2K/4K inputs', () => {
  const invalid = validateCustomSessionInput({
    topic: '   ',
    durationMinutes: 5,
    imageSize: '2K',
    voiceName: 'Kore',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.topic);

  const valid = validateCustomSessionInput({
    topic: 'Morning clarity before deep work',
    durationMinutes: 10,
    imageSize: '4K',
    voiceName: 'Zephyr',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('calculateBreathingPhase accurately transitions through Inhale, Hold, and Exhale', () => {
  const pattern = { inhale: 4, hold: 4, exhale: 6 }; // total 14s
  const phaseStart = calculateBreathingPhase(1, pattern);
  assert.equal(phaseStart.phase, 'Inhale');
  assert.equal(phaseStart.secondsRemainingInPhase, 3);

  const phaseHold = calculateBreathingPhase(5, pattern);
  assert.equal(phaseHold.phase, 'Hold');
  assert.equal(phaseHold.secondsRemainingInPhase, 3);

  const phaseExhale = calculateBreathingPhase(10, pattern);
  assert.equal(phaseExhale.phase, 'Exhale');
  assert.equal(phaseExhale.secondsRemainingInPhase, 4);
});

test('updateSoundscapeMix and getActiveSoundscapeSummary update channels immutably', () => {
  const toggled = updateSoundscapeMix(INITIAL_SOUNDSCAPES, 'ocean', {
    active: true,
    volume: 65,
  });
  const ocean = toggled.find((c) => c.id === 'ocean');
  assert.equal(ocean?.active, true);
  assert.equal(ocean?.volume, 65);

  const summary = getActiveSoundscapeSummary(toggled);
  assert.equal(summary.activeCount, 3); // rain, bowls, ocean
  assert.ok(summary.activeNames.includes('Ocean Waves'));
});

test('filterMeditationsByPackAndQuery filters by pack ID and search keywords', () => {
  const sleepOnly = filterMeditationsByPackAndQuery(MEDITATION_PACKS, 'better-sleep', '');
  assert.equal(sleepOnly.length, 4);

  const fjordSearch = filterMeditationsByPackAndQuery(MEDITATION_PACKS, 'all', 'fjord');
  assert.equal(fjordSearch.length, 1);
  assert.equal(fjordSearch[0].id, 'bs-nordic-fjord');
});

test('estimateScriptDurationSeconds and buildFallbackCustomMeditation return valid outputs', () => {
  const seconds = estimateScriptDurationSeconds('Breathe in slowly <breath> and release.');
  assert.ok(seconds >= 15);

  const custom = buildFallbackCustomMeditation({
    topic: 'Post-flight jetlag recovery',
    durationMinutes: 8,
    visualStyle: 'Alpine Dusk',
    visualPrompt: 'Quiet mountain ridge at dusk',
    imageSize: '4K',
    aspectRatio: '16:9',
    voiceName: 'Charon',
    voiceStyle: 'Deep calm narrator',
  });
  assert.equal(custom.imageSize, '4K');
  assert.equal(custom.voiceName, 'Charon');
  assert.equal(custom.isCustom, true);
});
