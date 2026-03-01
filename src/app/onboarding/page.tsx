'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import type { YesNoAnswer } from './types';
import { slideVariants } from './constants';
import { useOnboarding } from './hooks/useOnboarding';
import { AccountScreen } from './components/AccountScreen';
import { YesNoScreen } from './components/YesNoScreen';
import { SingleSelectScreen } from './components/SingleSelectScreen';
import { DatePickerScreen } from './components/DatePickerScreen';
import { TextInputScreen } from './components/TextInputScreen';
import { MultiChipScreen } from './components/MultiChipScreen';
import { CompleteScreen } from './components/CompleteScreen';

export default function OnboardingPage() {
  const {
    direction,
    authError,
    saving,
    showPassword,
    initialized,
    data,
    currentScreen,
    progress,
    showBackButton,
    goForward,
    goBack,
    handleYesNo,
    handleSingleSelect,
    handleChipToggle,
    handleAccountNext,
    handleFinish,
    handleDebugReset,
    togglePassword,
    updateData,
  } = useOnboarding();

  if (!initialized) return null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0D0D2B' }}>
      {/* Header: Back + Progress + Skip */}
      <div
        className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
        style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}
      >
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button onClick={goBack} className="tap-target flex-shrink-0 text-stardust">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div className="w-6 flex-shrink-0" />
            )}
            <CosmicProgressBar progress={progress} className="flex-1" />
            <button onClick={handleDebugReset} className="flex-shrink-0 text-xs text-moon/60 border border-moon/30 rounded-lg px-2 py-1 active:bg-nebula/20">
              RESET
            </button>
          </div>
          {/* Phase label */}
          {currentScreen?.phaseLabel && (
            <p className="text-xs font-bold tracking-widest mt-2 ml-9" style={{ color: currentScreen.phaseColor }}>
              {currentScreen.phaseLabel}
            </p>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex flex-col min-h-screen pt-36 pb-0">
        <div className="flex-1 max-w-[430px] mx-auto w-full px-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen?.id ?? 0}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {currentScreen?.type === 'account' && (
                <AccountScreen
                  data={data}
                  showPassword={showPassword}
                  onTogglePassword={togglePassword}
                  error={authError}
                  saving={saving}
                  onChange={(email, password) => updateData({ email, password })}
                  onNext={handleAccountNext}
                />
              )}
              {currentScreen?.type === 'yes_no' && (
                <YesNoScreen
                  screen={currentScreen}
                  answer={
                    currentScreen.domain
                      ? (data.domainAnswers[currentScreen.domain] as YesNoAnswer | undefined)
                      : currentScreen.dataKey === 'hasEvaluation'
                        ? data.hasEvaluation
                        : undefined
                  }
                  onAnswer={handleYesNo}
                />
              )}
              {currentScreen?.type === 'date_picker' && (
                <DatePickerScreen
                  screen={currentScreen}
                  birthYear={data.birthYear}
                  birthMonth={data.birthMonth}
                  birthDay={data.birthDay}
                  onChange={(y, m, d) => updateData({ birthYear: y, birthMonth: m, birthDay: d })}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'single_select' && (
                <SingleSelectScreen
                  screen={currentScreen}
                  selectedValue={
                    currentScreen.dataKey === 'speechLevel'
                      ? data.speechLevel
                      : ''
                  }
                  onSelect={handleSingleSelect}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'text_input' && (
                <TextInputScreen
                  screen={currentScreen}
                  value={data.childName}
                  onChange={(v) => updateData({ childName: v })}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'multi_chips' && (
                <MultiChipScreen
                  screen={currentScreen}
                  selected={
                    currentScreen.dataKey === 'disabilities' ? data.disabilities
                    : currentScreen.dataKey === 'concerns' ? data.concerns
                    : currentScreen.dataKey === 'behavioralTraits' ? data.behavioralTraits
                    : data.socialTraits
                  }
                  onToggle={handleChipToggle}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'complete' && (
                <CompleteScreen
                  childName={data.childName}
                  error={authError}
                  saving={saving}
                  onFinish={handleFinish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
