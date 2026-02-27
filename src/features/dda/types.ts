// Re-export DDA-related types from central types
export type {
  DDAConfig,
  DDAParameterDef,
  DifficultyParams,
  AdaptiveChange,
  AdaptiveChangeReason,
} from '@/types';

// Disability profile types
export type { DisabilityType, DDAProfile } from './disability-profile';
export { DDA_PROFILES } from './disability-profile';
export { deriveDisabilityType } from './derive-profile';
export {
  saveDisabilityType,
  loadDisabilityType,
  setDevDisabilityType,
  getDevDisabilityType,
} from './disability-profile-store';
