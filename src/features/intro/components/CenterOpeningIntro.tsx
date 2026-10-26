import * as React from 'react';
import { motion } from 'motion/react';
import { OrbaiSanctumEmblem } from './OrbaiSanctumEmblem';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';

const INTRO_SESSION_KEY = 'nco_intro_seen_v1';

export interface CenterOpeningIntroProps {
  brandName?: string;
  headline?: string;
  subheadline?: string;
  leftPanelAssetUrl?: string;
  rightPanelAssetUrl?: string;
  forceReplayCounter?: number;
  onIntroComplete?: () => void;
}

export function CenterOpeningIntro({
  brandName = 'NovaCraft Orbai',
  headline = 'Your Health. Our Priority.',
  subheadline = 'Exceptional care, designed around you.',
  leftPanelAssetUrl,
  rightPanelAssetUrl,
  forceReplayCounter = 0,
  onIntroComplete,
}: CenterOpeningIntroProps): React.JSX.Element | null {
  const prefersReducedMotion = useReducedMotionPreference();

  const [phase, setPhase] = React.useState<'holding' | 'splitting' | 'complete'>(() => {
    if (typeof window === 'undefined') return 'complete';
    try {
      const alreadySeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
      return alreadySeen ? 'complete' : 'holding';
    } catch {
      return 'holding';
    }
  });

  // Trigger replay when user clicks "Replay Opening Intro" in the footer or header
  React.useEffect(() => {
    if (forceReplayCounter > 0) {
      setPhase('holding');
    }
  }, [forceReplayCounter]);

  const finishIntro = React.useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // Ignore storage restrictions
    }
    setPhase('complete');
    onIntroComplete?.();
  }, [onIntroComplete]);

  React.useEffect(() => {
    if (phase === 'complete') return;

    if (prefersReducedMotion) {
      const reducedTimer = window.setTimeout(() => {
        finishIntro();
      }, 250);
      return () => window.clearTimeout(reducedTimer);
    }

    if (phase === 'holding') {
      // Hold for ~1.0 second before panels separate from the exact center
      const holdTimer = window.setTimeout(() => {
        setPhase('splitting');
      }, 980);
      return () => window.clearTimeout(holdTimer);
    }

    if (phase === 'splitting') {
      // Complete within ~1.25 seconds of panel separation
      const splitTimer = window.setTimeout(() => {
        finishIntro();
      }, 1250);
      return () => window.clearTimeout(splitTimer);
    }
  }, [phase, prefersReducedMotion, finishIntro]);

  // Allow keyboard Escape to skip immediately
  React.useEffect(() => {
    if (phase === 'complete') return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, finishIntro]);

  if (phase === 'complete') {
    return null;
  }

  const isSplitting = phase === 'splitting';

  return (
    <div
      role="dialog"
      aria-label={`${brandName} entrance reveal`}
      aria-modal="false"
      className={`fixed inset-0 z-50 overflow-hidden select-none ${
        isSplitting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Left Symmetrical Panel (0vw -> 50vw) */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '-100%' : '0%' }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 1.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#072B24] border-r border-[#C5A059]/35 overflow-hidden will-change-transform"
      >
        {leftPanelAssetUrl ? (
          <img
            src={leftPanelAssetUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,rgba(197,160,89,0.16),transparent_65%)]"
          />
        )}
        {/* Architectural Subtle Grid Lines on Left Panel */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-12 w-px bg-[#FAF8F5]/6 hidden sm:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/4 h-px bg-[#FAF8F5]/6"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-1/4 h-px bg-[#FAF8F5]/6"
        />
      </motion.div>

      {/* Right Symmetrical Panel (50vw -> 100vw) */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '100%' : '0%' }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 1.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#072B24] border-l border-[#C5A059]/35 overflow-hidden will-change-transform"
      >
        {rightPanelAssetUrl ? (
          <img
            src={rightPanelAssetUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(197,160,89,0.16),transparent_65%)]"
          />
        )}
        {/* Architectural Subtle Grid Lines on Right Panel */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-12 w-px bg-[#FAF8F5]/6 hidden sm:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/4 h-px bg-[#FAF8F5]/6"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-1/4 h-px bg-[#FAF8F5]/6"
        />
      </motion.div>

      {/* Center Lockup Overlaid Across the Exact Seam */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{
          opacity: isSplitting ? 0 : 1,
          scale: isSplitting ? 1.03 : 1,
        }}
        transition={{
          duration: isSplitting ? 0.32 : 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center text-[#FAF8F5]"
      >
        <div className="mb-5 flex flex-col items-center">
          <OrbaiSanctumEmblem size="intro" className="text-[#FAF8F5]" />
          <span className="mt-4 font-mono text-xs tracking-[0.26em] text-[#D4B475]">
            {brandName.toUpperCase()}
          </span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#FAF8F5] max-w-xl">
          {headline}
        </h2>

        <p className="mt-3 font-sans text-sm sm:text-base text-[#D5EAE4]/90 max-w-md">
          {subheadline}
        </p>

        {!isSplitting ? (
          <button
            type="button"
            onClick={finishIntro}
            className="mt-10 rounded-lg border border-[#FAF8F5]/20 bg-[#0A3A31]/70 px-4 py-2 font-mono text-xs text-[#FAF8F5]/80 transition-colors hover:border-[#C5A059] hover:text-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
          >
            Enter Sanctuary · Esc
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}
