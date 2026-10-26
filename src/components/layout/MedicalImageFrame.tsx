import * as React from 'react';
import { MEDICAL_ASSET_REGISTRY } from '@/src/assets/medicalAssetRegistry';
import { cn } from '@/src/lib/cn';

export interface MedicalImageFrameProps {
  slotId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  aspectRatio?: '16/9' | '4/3' | '3/4' | '1/1';
  className?: string;
  priority?: boolean;
  showCaptionOverlay?: boolean;
  customSrc?: string;
}

/**
 * Generates responsive WebP/AVIF-negotiated srcSet & sizes for Unsplash URLs
 * while strictly preserving the exact photograph, crop, and focal point.
 */
function buildResponsiveImageAttributes(
  rawUrl: string | undefined,
  aspectRatio: '16/9' | '4/3' | '3/4' | '1/1'
): {
  src: string | undefined;
  srcSet: string | undefined;
  sizes: string | undefined;
  width: number;
  height: number;
} {
  const dimensions =
    aspectRatio === '16/9'
      ? { width: 960, height: 540 }
      : aspectRatio === '3/4'
        ? { width: 600, height: 800 }
        : aspectRatio === '1/1'
          ? { width: 600, height: 600 }
          : { width: 640, height: 480 };

  if (!rawUrl) {
    return { src: undefined, srcSet: undefined, sizes: undefined, ...dimensions };
  }

  if (!rawUrl.includes('images.unsplash.com/')) {
    return { src: rawUrl, srcSet: undefined, sizes: undefined, ...dimensions };
  }

  try {
    const buildWidthUrl = (w: number, q = 80): string => {
      const u = new URL(rawUrl);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      return u.toString();
    };

    const defaultWidth = aspectRatio === '16/9' ? 960 : 640;
    const src = buildWidthUrl(defaultWidth, 82);
    const srcSet = [
      `${buildWidthUrl(400, 78)} 400w`,
      `${buildWidthUrl(640, 80)} 640w`,
      `${buildWidthUrl(960, 82)} 960w`,
      `${buildWidthUrl(1280, 84)} 1280w`,
    ].join(', ');

    const sizes =
      aspectRatio === '16/9'
        ? '(max-width: 640px) 94vw, (max-width: 1024px) 48vw, 640px'
        : '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 340px';

    return { src, srcSet, sizes, ...dimensions };
  } catch {
    return { src: rawUrl, srcSet: undefined, sizes: undefined, ...dimensions };
  }
}

export function MedicalImageFrame({
  slotId,
  doctorName,
  doctorSpecialty,
  aspectRatio = '4/3',
  className,
  priority = false,
  showCaptionOverlay = true,
  customSrc,
}: MedicalImageFrameProps): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [imgFailed, setImgFailed] = React.useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = React.useState<boolean>(false);
  const [shouldLoadEagerly, setShouldLoadEagerly] = React.useState<boolean>(priority);

  const spec = MEDICAL_ASSET_REGISTRY[slotId] ?? {
    slotId,
    title: doctorName || 'NovaCraft Orbai Clinical Suite',
    subtitle: doctorSpecialty || 'Architectural Medical Sanctuary',
    wingCode: 'NOVACRAFT ORBAI',
    altText: doctorName ? `${doctorName} — ${doctorSpecialty}` : 'NovaCraft Orbai medical visual',
    themePalette: slotId.startsWith('portrait_') ? 'portrait' : 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
  };

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-video'
      : aspectRatio === '3/4'
        ? 'aspect-3/4'
        : aspectRatio === '1/1'
          ? 'aspect-square'
          : 'aspect-4/3';

  const resolvedSrc = customSrc || spec.customImageUrl;
  const isPortrait = slotId.startsWith('portrait_') || Boolean(doctorName);

  const responsiveAttrs = React.useMemo(
    () => buildResponsiveImageAttributes(resolvedSrc, aspectRatio),
    [resolvedSrc, aspectRatio]
  );

  // Pre-load images 900px before they enter the viewport so cards are already loaded when scrolled to
  React.useEffect(() => {
    if (priority || shouldLoadEagerly) return;
    const el = containerRef.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldLoadEagerly(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoadEagerly(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '900px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, shouldLoadEagerly]);

  // Determine deterministic visual variation for doctor portraits
  const portraitIndex = React.useMemo(() => {
    const match = slotId.match(/(\d+)$/);
    return match ? Number(match[1]) : 1;
  }, [slotId]);

  const initials = React.useMemo(() => {
    if (!doctorName) return 'NO';
    return doctorName
      .replace(/^Dr\.\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [doctorName]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/60 dark:border-white/10 bg-subtle/80 shadow-[0_6px_24px_-6px_rgba(7,43,36,0.10)] ring-1 ring-inset ring-white/30 select-none',
        aspectClass,
        className
      )}
    >
      {/* Instant Architectural / Portrait Backdrop (Prevents blank cards while photo decodes or if offline) */}
      {(!resolvedSrc || imgFailed || !imgLoaded) &&
        (isPortrait ? (
          <svg
            viewBox="0 0 600 800"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-orbai-out group-hover:scale-[1.02]"
            role="img"
            aria-label={spec.altText}
          >
            <defs>
              <linearGradient id={`bg-port-${slotId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={portraitIndex % 2 === 0 ? '#EAE4D8' : '#E5ECE9'} />
                <stop offset="55%" stopColor={portraitIndex % 2 === 0 ? '#DCD3C2' : '#CFE0DC'} />
                <stop offset="100%" stopColor="#0D4A3E" stopOpacity="0.28" />
              </linearGradient>
              <radialGradient id={`glow-port-${slotId}`} cx="65%" cy="25%" r="60%">
                <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`coat-${slotId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E9E4DA" />
              </linearGradient>
              <linearGradient id={`attire-${slotId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D4A3E" />
                <stop offset="100%" stopColor="#072B24" />
              </linearGradient>
            </defs>

            <rect width="600" height="800" fill={`url(#bg-port-${slotId})`} />
            <rect width="600" height="800" fill={`url(#glow-port-${slotId})`} />

            <g opacity="0.22" stroke="#0D4A3E" strokeWidth="1.5">
              <line x1="420" y1="0" x2="420" y2="800" />
              <line x1="470" y1="0" x2="470" y2="800" />
              <line x1="520" y1="0" x2="520" y2="800" />
              <line x1="0" y1="180" x2="600" y2="180" />
            </g>

            <circle
              cx="300"
              cy="310"
              r="155"
              fill="none"
              stroke="#C5A059"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              opacity="0.55"
            />
            <circle cx="300" cy="310" r="130" fill="#FAF8F5" opacity="0.45" />

            <path
              d="M105 800 C115 605, 195 520, 300 520 C405 520, 485 605, 495 800 Z"
              fill={`url(#coat-${slotId})`}
              stroke="#CFC8BA"
              strokeWidth="2"
            />
            <path d="M245 522 L300 665 L355 522 Z" fill={`url(#attire-${slotId})`} />

            <path
              d="M235 522 L285 690 L215 690 L195 555 Z"
              fill="#F5F2EB"
              stroke="#D6CFC2"
              strokeWidth="1.5"
            />
            <path
              d="M365 522 L315 690 L385 690 L405 555 Z"
              fill="#F5F2EB"
              stroke="#D6CFC2"
              strokeWidth="1.5"
            />

            <path
              d="M220 535 C210 615, 240 660, 265 685"
              fill="none"
              stroke="#0D4A3E"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M380 535 C390 615, 365 655, 345 675"
              fill="none"
              stroke="#0D4A3E"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="342" cy="682" r="18" fill="#C5A059" stroke="#072B24" strokeWidth="3" />
            <circle cx="342" cy="682" r="8" fill="#FAF8F5" />

            <rect x="272" y="430" width="56" height="105" rx="26" fill="#D5B895" />
            <ellipse cx="300" cy="335" rx="76" ry="96" fill="#DEC3A1" />
            <path
              d="M224 325 C222 245, 260 220, 302 220 C348 220, 378 250, 376 325 C365 280, 338 262, 300 262 C262 262, 235 282, 224 325 Z"
              fill="#1D2422"
            />

            <g transform="translate(36, 36)">
              <rect
                width="68"
                height="68"
                rx="14"
                fill="#072B24"
                fillOpacity="0.9"
                stroke="#C5A059"
                strokeWidth="1.5"
              />
              <text
                x="34"
                y="43"
                textAnchor="middle"
                fill="#FAF8F5"
                fontFamily="Cormorant Garamond, Georgia, serif"
                fontSize="26"
                fontWeight="600"
              >
                {initials}
              </text>
            </g>
          </svg>
        ) : (
          <svg
            viewBox="0 0 1200 800"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-orbai-out group-hover:scale-[1.02]"
            role="img"
            aria-label={spec.altText}
          >
            <defs>
              <linearGradient id={`arch-sky-${slotId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5F0E6" />
                <stop offset="48%" stopColor="#E6DFD1" />
                <stop offset="100%" stopColor="#CFDCD8" />
              </linearGradient>
              <linearGradient id={`arch-emerald-${slotId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D4A3E" />
                <stop offset="100%" stopColor="#072B24" />
              </linearGradient>
              <radialGradient id={`sunbeam-${slotId}`} cx="78%" cy="18%" r="65%">
                <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F7EFE0" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="1200" height="800" fill={`url(#arch-sky-${slotId})`} />
            <rect width="1200" height="800" fill={`url(#sunbeam-${slotId})`} />

            <g stroke="#CFC8BA" strokeWidth="1.5" opacity="0.65">
              <line x1="160" y1="0" x2="160" y2="620" />
              <line x1="340" y1="0" x2="340" y2="620" />
              <line x1="520" y1="0" x2="520" y2="620" />
              <line x1="700" y1="0" x2="700" y2="620" />
              <line x1="880" y1="0" x2="880" y2="620" />
              <line x1="1040" y1="0" x2="1040" y2="620" />
              <line x1="0" y1="620" x2="1200" y2="620" />
            </g>

            <polygon points="0,620 1200,620 1200,800 0,800" fill="#E3DDD1" />
            <polygon points="240,620 960,620 1160,800 40,800" fill="#EFECE4" opacity="0.7" />

            <rect
              x="140"
              y="110"
              width="920"
              height="460"
              rx="18"
              fill="#FAF8F5"
              fillOpacity="0.72"
              stroke="#C5A059"
              strokeWidth="1.5"
            />

            <rect
              x="170"
              y="140"
              width="320"
              height="400"
              rx="12"
              fill={`url(#arch-emerald-${slotId})`}
            />

            <g transform="translate(330, 310)">
              <circle
                cx="0"
                cy="0"
                r="76"
                fill="none"
                stroke="#C5A059"
                strokeWidth="1.75"
                opacity="0.85"
              />
              <circle
                cx="0"
                cy="0"
                r="52"
                fill="none"
                stroke="#FAF8F5"
                strokeWidth="1.2"
                opacity="0.5"
              />
              <line
                x1="-88"
                y1="0"
                x2="88"
                y2="0"
                stroke="#C5A059"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <line
                x1="0"
                y1="-88"
                x2="0"
                y2="88"
                stroke="#C5A059"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <circle cx="0" cy="0" r="8" fill="#C5A059" />
            </g>

            <rect
              x="530"
              y="165"
              width="490"
              height="250"
              rx="10"
              fill="#FFFFFF"
              stroke="#E4DFD5"
              strokeWidth="2"
            />

            <path
              d="M570 295 L650 295 L675 240 L705 345 L735 210 L765 325 L790 275 L830 295 L980 295"
              fill="none"
              stroke="#0D4A3E"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="735" cy="210" r="6" fill="#C5A059" />

            <rect x="530" y="445" width="490" height="22" rx="6" fill="#B89768" />
            <rect x="570" y="467" width="16" height="72" fill="#8C6B3F" />
            <rect x="960" y="467" width="16" height="72" fill="#8C6B3F" />
          </svg>
        ))}

      {/* Primary Medical Photograph with Responsive WebP/AVIF Negotiation & Explicit Dimensions */}
      {responsiveAttrs.src && !imgFailed ? (
        <img
          src={responsiveAttrs.src}
          srcSet={responsiveAttrs.srcSet}
          sizes={responsiveAttrs.sizes}
          width={responsiveAttrs.width}
          height={responsiveAttrs.height}
          alt={spec.altText}
          loading={priority || shouldLoadEagerly ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          style={{ objectPosition: spec.objectPosition || (isPortrait ? 'center top' : 'center') }}
          className="relative z-10 h-full w-full object-cover transition-transform duration-700 ease-orbai-out group-hover:scale-[1.03]"
        />
      ) : null}

      {/* Measured Scrim & Architectural Glass Wing Caption */}
      {showCaptionOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#072B24]/90 via-[#072B24]/60 to-transparent backdrop-blur-[2px] p-4 pt-10 text-[#FAF8F5]">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono tracking-wider text-[#D4B475]">
            <span>{spec.wingCode}</span>
            <span>NOVACRAFT ORBAI</span>
          </div>
          <p className="mt-0.5 font-display text-base font-semibold leading-snug text-[#FAF8F5]">
            {doctorName || spec.title}
          </p>
        </div>
      ) : null}
    </div>
  );
}
