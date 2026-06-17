import { useId, useRef } from 'react';

import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';

type TiltMarkProps = {
  size: number;
  'aria-hidden'?: true;
  role?: 'img';
  'aria-label'?: string;
};

/**
 * Diamond tilt mark — pointer-tracked parallax + outer-ring glow + specular glare.
 *
 * Technique: each layer has its own ref. onPointerMove applies an explicit translate()
 * proportional to depth alongside the global rotateX/Y. This makes parallax unconditionally
 * visible — CSS preserve-3d alone produces ~3px projected separation on concentric shapes
 * (imperceptible). The manual offset creates a measurable gap between layers.
 *
 * Parameters tuned for subtlety:
 *   rotation  3° max — tilt is felt, not seen
 *   maxShift  1px    — layers separate without visible gaps
 *   no preserve-3d   — avoids projection gaps between concentric layer divs
 *
 * Respects prefers-reduced-motion: pointer tracking and glare are disabled when set.
 *
 * @param size - total width/height in pixels
 */
export function TiltMark({ size, ...a11y }: TiltMarkProps) {
  const filterId = `glow-tilt-${useId()}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const l0 = useRef<HTMLDivElement>(null); // glow  Z=-8
  const l1 = useRef<HTMLDivElement>(null); // base  Z=0
  const l2 = useRef<HTMLDivElement>(null); // mid   Z=5
  const l3 = useRef<HTMLDivElement>(null); // lit   Z=12
  const l4 = useRef<HTMLDivElement>(null); // table Z=20
  const isMotionReduced = usePrefersReducedMotion();

  const ZMAP: [React.RefObject<HTMLDivElement | null>, number][] = [
    [l0, -8],
    [l1, 0],
    [l2, 5],
    [l3, 12],
    [l4, 20],
    [glareRef, 26],
  ];

  const zMid = 9;
  const zHalf = 17;
  const maxShift = 1;

  const layer = (z: number): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    top: 0,
    width: size,
    height: size,
    transform: `translateZ(${z}px)`,
  });

  return (
    <div
      ref={containerRef}
      style={{ perspective: `${size * 2.5}px`, display: 'inline-block', cursor: 'crosshair' }}
      {...a11y}
      onPointerMove={(e) => {
        if (isMotionReduced) return;
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        wrapper.style.transform = `rotateX(${(-y * 3).toFixed(1)}deg) rotateY(${(x * 3).toFixed(1)}deg)`;
        wrapper.style.transition = 'none';

        for (const [ref, z] of ZMAP) {
          if (!ref.current) continue;
          const n = (z - zMid) / zHalf;
          const tx = (x * n * maxShift).toFixed(1);
          const ty = (y * n * maxShift).toFixed(1);
          ref.current.style.transform = `translateZ(${z}px) translate(${tx}px, ${ty}px)`;
          ref.current.style.transition = 'none';
        }

        const gx = (50 - x * 35).toFixed(1);
        const gy = (50 - y * 35).toFixed(1);
        const glare = glareRef.current;
        if (glare) {
          glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5) 0%, transparent 60%)`;
          glare.style.opacity = '1';
        }
      }}
      onPointerLeave={() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
        wrapper.style.transition = 'transform 0.5s ease-out';
        for (const [ref, z] of ZMAP) {
          if (!ref.current) continue;
          ref.current.style.transform = `translateZ(${z}px)`;
          ref.current.style.transition = 'transform 0.5s ease-out';
        }
        const glare = glareRef.current;
        if (glare) {
          glare.style.opacity = '0';
          glare.style.transition = 'opacity 0.5s ease-out';
        }
      }}
    >
      <div
        ref={wrapperRef}
        style={{ position: 'relative', width: size, height: size, willChange: 'transform' }}
      >
        {/* Z=-8: outer-ring glow halo */}
        <div ref={l0} style={{ ...layer(-8), overflow: 'visible' }}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className="text-accent"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id={filterId} x="-70%" y="-70%" width="240%" height="240%">
                <feGaussianBlur in="SourceAlpha" stdDeviation={2.5} result="blurred">
                  {isMotionReduced ? null : (
                    <animate
                      attributeName="stdDeviation"
                      values="2.5;5;2.5"
                      dur="3.6s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                      keyTimes="0;0.5;1"
                    />
                  )}
                </feGaussianBlur>
                <feFlood
                  result="flood"
                  style={{ floodColor: 'var(--accent)', floodOpacity: 0.85 }}
                />
                <feComposite in="flood" in2="blurred" operator="in" result="coloredHalo" />
                <feComposite in="coloredHalo" in2="SourceAlpha" operator="out" />
              </filter>
            </defs>
            <path
              d="M16 1.5 30.5 16 16 30.5 1.5 16Z"
              fill="currentColor"
              filter={`url(#${filterId})`}
            />
          </svg>
        </div>

        {/* Z=0: ambient silhouette + shadow/bounce facets (zones 3–4) */}
        <div ref={l1} style={layer(0)}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className="text-accent"
          >
            <path d="M16 1.5 30.5 16 16 30.5 1.5 16Z" fill="currentColor" opacity={0.08} />
            <path
              d="M16 1.5 30.5 16 16 30.5 1.5 16Z"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <path d="M30.5 16 16 23.5 23.5 16Z" fill="currentColor" opacity={0.1} />
            <path d="M30.5 16 16 30.5 16 23.5Z" fill="currentColor" opacity={0.05} />
            <path d="M16 30.5 8.5 16 16 23.5Z" fill="currentColor" opacity={0.08} />
            <path d="M16 30.5 1.5 16 8.5 16Z" fill="currentColor" opacity={0.22} />
          </svg>
        </div>

        {/* Z=5: mid-lit facets — zone 2 top-right */}
        <div ref={l2} style={layer(5)}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className="text-accent"
          >
            <path d="M16 1.5 23.5 16 16 8.5Z" fill="currentColor" opacity={0.36} />
            <path d="M16 1.5 30.5 16 23.5 16Z" fill="currentColor" opacity={0.16} />
          </svg>
        </div>

        {/* Z=12: lit facets — zone 1 top-left */}
        <div ref={l3} style={layer(12)}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className="text-accent"
          >
            <path d="M1.5 16 16 1.5 16 8.5Z" fill="currentColor" opacity={0.75} />
            <path d="M1.5 16 16 8.5 8.5 16Z" fill="currentColor" opacity={0.48} />
          </svg>
        </div>

        {/* Z=20: table ring — crown plateau */}
        <div ref={l4} style={layer(20)}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className="text-accent"
          >
            <path
              d="M16 8.5 23.5 16 16 23.5 8.5 16Z M16 13 19 16 16 19 13 16Z"
              fill="currentColor"
              fillRule="evenodd"
              opacity={0.9}
            />
          </svg>
        </div>

        {/* Z=26: specular glare */}
        <div
          ref={glareRef}
          style={{
            ...layer(26),
            opacity: 0,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            clipPath: 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)',
          }}
        />
      </div>
    </div>
  );
}
