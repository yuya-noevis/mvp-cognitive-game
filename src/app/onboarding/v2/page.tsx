'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { useOnboardingV2 } from './hooks/useOnboardingV2';
import { BirthDateScreen, NameScreen, SpeechLevelScreen } from './components/Phase1Screens';
import { Phase2GameDemo } from './components/Phase2GameDemo';
import { Phase3Signup } from './components/Phase3Signup';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingV2Page() {
  const {
    state,
    initialized,
    authError,
    saving,
    direction,
    progress,
    showBackButton,
    updateData,
    goToNextPhase1Screen,
    goToPrevPhase1Screen,
    handlePhase2Complete,
    handleSkipSignup,
    handleSignup,
    handleDebugReset,
  } = useOnboardingV2();

  if (!initialized) return null;

  const showProgressBar = state.phase === 'phase1_info';

  // Compute a unique key for AnimatePresence transitions
  const animationKey =
    state.phase === 'phase1_info'
      ? `phase1_${state.phase1ScreenIndex}`
      : state.phase;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0D0D2B' }}>
      {/* Header */}
      {showProgressBar && (
        <div
          className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
          style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}
        >
          <div className="max-w-[430px] mx-auto">
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  onClick={goToPrevPhase1Screen}
                  className="tap-target flex-shrink-0 text-stardust"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}
              <CosmicProgressBar progress={progress} className="flex-1" />
              <button
                onClick={handleDebugReset}
                className="flex-shrink-0 text-xs text-moon/60 border border-moon/30 rounded-lg px-2 py-1 active:bg-nebula/20"
              >
                RESET
              </button>
            </div>

            {/* Step indicator */}
            <p className="text-xs font-bold tracking-widest mt-2 ml-9" style={{ color: '#6C3CE1' }}>
              {state.phase1ScreenIndex + 1} / 3
            </p>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className={`relative z-10 flex flex-col min-h-screen ${showProgressBar ? 'pt-36' : 'pt-8'} pb-0`}>
        <div className="flex-1 max-w-[430px] mx-auto w-full px-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={animationKey}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {/* Phase 1: 3-screen info collection */}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 0 && (
                <BirthDateScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 1 && (
                <NameScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 2 && (
                <SpeechLevelScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}

              {/* Phase 2: Game demo / calibration */}
              {state.phase === 'phase2_game' && (
                <Phase2GameDemo
                  ageGroup={state.data.ageGroup ?? '6-9'}
                  childName={state.data.childName}
                  onComplete={handlePhase2Complete}
                />
              )}

              {/* Phase 3: Optional signup */}
              {state.phase === 'phase3_signup' && (
                <Phase3Signup
                  data={state.data}
                  authError={authError}
                  saving={saving}
                  onUpdate={updateData}
                  onSignup={handleSignup}
                  onSkip={handleSkipSignup}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
