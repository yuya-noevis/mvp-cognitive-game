import type { DifficultyParams } from '@/types';
import { shuffle, randomInt } from '@/lib/utils';

/** Creature types mapped to PNG stimulus images */
const CREATURES = ['star', 'rocket', 'ufo', 'planet'] as const;
const COLORS = ['yellow', 'blue', 'green', 'pink'] as const;

/** Get PNG image path for a creature */
export function getCreatureImagePath(creature: string): string {
  const creatureMap: Record<string, string> = {
    star: '/assets/game/stimulus-star.png',
    rocket: '/assets/game/stimulus-rocket.png',
    ufo: '/assets/game/stimulus-ufo.png',
    planet: '/assets/game/stimulus-planet.png',
    alien: '/assets/game/stimulus-alien.png',
    sun: '/assets/game/stimulus-sun.png',
    moon: '/assets/game/stimulus-moon.png',
    comet: '/assets/game/stimulus-comet.png',
    'shooting-star': '/assets/game/stimulus-shooting-star.png',
  };
  return creatureMap[creature] || '/assets/game/stimulus-star.png';
}

export interface HikariStimulus {
  items: HikariItem[];
  targetIndex: number;
}

export interface HikariItem {
  id: string;
  creature: string;
  color: string;
  isTarget: boolean;
  position: { x: number; y: number };
}

/** Generate stimulus for one trial */
export function generateHikariStimulus(difficulty: DifficultyParams): {
  stimulus: HikariStimulus;
  correctAnswer: { targetId: string };
} {
  const distractorCount = (difficulty.distractor_count as number) || 0;
  const similarity = (difficulty.similarity as string) || 'low';

  // Target is always the first creature/color combo
  const targetCreature = CREATURES[0];
  const targetColor = COLORS[0];

  const items: HikariItem[] = [];

  // Create target
  const targetId = `target_${randomInt(0, 9999)}`;
  items.push({
    id: targetId,
    creature: targetCreature,
    color: targetColor,
    isTarget: true,
    position: randomPosition(),
  });

  // Create distractors
  for (let i = 0; i < distractorCount; i++) {
    const distractor = createDistractor(
      targetCreature,
      targetColor,
      similarity,
      i,
    );
    items.push(distractor);
  }

  const shuffled = shuffle(items);
  const targetIndex = shuffled.findIndex(item => item.isTarget);

  return {
    stimulus: { items: shuffled, targetIndex },
    correctAnswer: { targetId },
  };
}

function createDistractor(
  targetCreature: string,
  targetColor: string,
  similarity: string,
  index: number,
): HikariItem {
  let creature: string;
  let color: string;

  if (similarity === 'high') {
    // Same creature, different color (hard to distinguish)
    creature = targetCreature;
    color = COLORS[(index + 1) % COLORS.length];
  } else if (similarity === 'mid') {
    // Different creature, same color family
    creature = CREATURES[(index + 1) % CREATURES.length];
    color = COLORS[(index + 1) % COLORS.length];
  } else {
    // Very different (easy)
    creature = CREATURES[(index + 2) % CREATURES.length];
    color = COLORS[(index + 2) % COLORS.length];
  }

  return {
    id: `distractor_${index}_${randomInt(0, 9999)}`,
    creature,
    color,
    isTarget: false,
    position: randomPosition(),
  };
}

function randomPosition(): { x: number; y: number } {
  // Keep items within safe zone (10-90% of screen)
  return {
    x: randomInt(15, 85),
    y: randomInt(20, 80),
  };
}
