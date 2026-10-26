import React, { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '../../../hooks/useReducedMotionPreference';

const HERO_VIDEO_SRC =
  '/assets/aistudio/Website_intro_animation_for_heal__1080p_20261026150733_932f4049.mp4';
const HERO_POSTER_SRC = '/assets/aistudio/hero_sanctuary_poster.jpg';

/**
 * Plays the complete hero animation from the very beginning (0.00s -> end) at natural speed (1.0x),
 * holds on the settled final frame for 5 seconds (5000ms), and then replays the full animation
 * from 0.00s in a clean, repeatable cycle with zero zoom (scale-100).
 */
const HOLD_DURATION_MS = 5000;
const NORMAL_PLAYBACK_RATE = 1.0;

export interface HeroSanctuaryVideoProps {
  ariaLabel: string;
}

export const HeroSanctuaryVideo: React.FC<HeroSanctuaryVideoProps> = ({
  ariaLabel,
}) => {
  const reducedMotion = useReducedMotionPreference();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);

  // Full-hero zero-zoom (scale-100 / transform-none) framing across desktop, tablet, and mobile
  const mediaFramingClass =
    'h-full w-full object-cover object-[72%_center] sm:object-[66%_center] lg:object-[56%_center] xl:object-center scale-100 transform-none';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const clearHoldTimer = () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    if (reducedMotion) {
      clearHoldTimer();
      video.pause();
      return () => clearHoldTimer();
    }

    const startFromBeginning = () => {
      const v = videoRef.current;
      if (!v || document.hidden) return;
      clearHoldTimer();
      try {
        v.currentTime = 0;
        v.playbackRate = NORMAL_PLAYBACK_RATE;
      } catch {
        // Ignore seek errors before media is ready
      }
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Autoplay blocked by browser power mode; poster remains visible
        });
      }
    };

    const handleEnded = () => {
      clearHoldTimer();
      video.pause();
      // Hold on the completed final frame of the animation for 5 seconds (5000ms), then replay from 0.00s
      holdTimerRef.current = window.setTimeout(() => {
        startFromBeginning();
      }, HOLD_DURATION_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearHoldTimer();
        video.pause();
      } else if (!reducedMotion) {
        startFromBeginning();
      }
    };

    // Start the full animation from 0.00s at normal 1.0x speed
    startFromBeginning();

    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearHoldTimer();
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden pointer-events-none select-none transform-none bg-transparent">
      {/* Base Layer: Settled sanctuary poster for instant load & reduced-motion fallback */}
      <img
        src={HERO_POSTER_SRC}
        alt={ariaLabel}
        fetchPriority="high"
        decoding="async"
        className={`
          ${mediaFramingClass}
          absolute inset-0
        `}
      />

      {/* Active Video Layer: Plays full animation from 0.00s -> holds 5s on end frame -> repeats */}
      {!reducedMotion && (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          muted
          playsInline
          preload="auto"
          aria-label={ariaLabel}
          className={`
            ${mediaFramingClass}
            relative z-10
          `}
        />
      )}
    </div>
  );
};
