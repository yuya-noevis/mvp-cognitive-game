'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { useOnboardingV2 } from './hooks/useOnboardingV2';
import { AgeNameScreen, SpeechLevelScreen, TabletOperationScreen, AuditorySensitivityScreen, DiagnosisScreen } from './components/Phase1Screens';
import { ConcernSelectionScreen, SeverityScreen } from './components/Phase2Assessment';
import { CalibrationGuidance } from './components/CalibrationGuidance';
import { MascotSelection } from './components/MascotSelection';
import { Phase2GameDemo } from './components/Phase2GameDemo';
import { GoalSetting } from './components/GoalSetting';
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
    currentScreenNumber,
    totalInfoScreens,
    showProgressBar,
    showBackButton,
    computedTier,
    updateData,
    goToNextPhase1Screen,
    goToNextPhase2Screen,
    goBack,
    handleGuidanceStart,
    handleCalibrationSkip,
    handleMascotConfirm,
    handleCalibrationComplete,
    handleGoalComplete,
    handleSkipSignup,
    handleSignup,
    handleDebugReset,
  } = useOnboardingV2();

  if (!initialized) return null;

  // Compute a unique key for AnimatePresence transitions
  const animationKey = (() => {
    if (state.phase === 'phase1_info') return `phase1_${state.phase1ScreenIndex}`;
    if (state.phase === 'phase2_assessment') return `phase2_${state.phase2ScreenIndex}`;
    if (state.phase === 'phase3_calibration') return `phase3_${state.phase3Step}`;
    return state.phase;
  })();

  // Phase 2: screen 0 = concern selection, screens 1..N = severity
  const isSeverityScreen = state.phase === 'phase2_assessment' && state.phase2ScreenIndex > 0;
  const severityConcernIndex = state.phase2ScreenIndex - 1;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0D0D2B' }}>
      {/* Header with progress bar */}
      {showProgressBar && (
        <div
          className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
          style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}
        >
          <div className="max-w-[430px] mx-auto">
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  onClick={goBack}
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
              {currentScreenNumber} / {totalInfoScreens}
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
              {/* Phase 1: 5-screen info collection */}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 0 && (
                <AgeNameScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 1 && (
                <SpeechLevelScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 2 && (
                <TabletOperationScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 3 && (
                <AuditorySensitivityScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}
              {state.phase === 'phase1_info' && state.phase1ScreenIndex === 4 && (
                <DiagnosisScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase1Screen}
                />
              )}

              {/* Phase 2: concern selection + severity screens */}
              {state.phase === 'phase2_assessment' && state.phase2ScreenIndex === 0 && (
                <ConcernSelectionScreen
                  data={state.data}
                  onUpdate={updateData}
                  onNext={goToNextPhase2Screen}
                />
              )}
              {isSeverityScreen && (
                <SeverityScreen
                  data={state.data}
                  concernIndex={severityConcernIndex}
                  totalConcerns={state.data.concernTags.length}
                  onUpdate={updateData}
                  onNext={goToNextPhase2Screen}
                />
              )}

              {/* Phase 3: Guidance → Character selection → Calibration → Goal */}
              {state.phase === 'phase3_calibration' && state.phase3Step === 'guidance' && (
                <CalibrationGuidance
                  childName={state.data.childName}
                  honorific={state.data.honorific}
                  onStart={handleGuidanceStart}
                  onSkip={handleCalibrationSkip}
                />
              )}
              {state.phase === 'phase3_calibration' && state.phase3Step === 'mascot' && (
                <MascotSelection
                  selected={state.data.selectedMascot}
                  onSelect={(mascot) => updateData({ selectedMascot: mascot })}
                  onConfirm={handleMascotConfirm}
                  childName={state.data.childName}
                />
              )}
              {state.phase === 'phase3_calibration' && state.phase3Step === 'calibration' && (
                <Phase2GameDemo
                  ageGroup={state.data.ageGroup ?? '6-9'}
                  childName={state.data.childName}
                  honorific={state.data.honorific}
                  onComplete={handleCalibrationComplete}
                />
              )}
              {state.phase === 'phase3_calibration' && state.phase3Step === 'goal' && (
                <GoalSetting
                  childName={state.data.childName}
                  honorific={state.data.honorific}
                  tier={computedTier}
                  selectedMinutes={state.data.dailyGoalMinutes}
                  onSelect={(minutes) => updateData({ dailyGoalMinutes: minutes })}
                  onNext={handleGoalComplete}
                />
              )}

              {/* Phase 4: Optional signup */}
              {state.phase === 'phase4_signup' && (
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
