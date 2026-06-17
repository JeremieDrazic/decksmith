/**
 * Brilliant-cut facet paths — 8 triangles lit from top-left + table ring.
 *
 * Geometry (32×32 viewBox):
 *   Outer : T(16,1.5)  R(30.5,16) B(16,30.5) L(1.5,16)
 *   Table : t(16,8.5)  r(23.5,16) b(16,23.5) l(8.5,16)
 *   Core  : c(16,13)   c(19,16)   c(16,19)   c(13,16)   ← evenodd hole
 *
 * Uses currentColor — set color on the parent SVG.
 * Center is a true transparent hole via fillRule="evenodd".
 */
export function BrilliantPaths() {
  return (
    <>
      <path d="M16 1.5 30.5 16 16 30.5 1.5 16Z" fill="currentColor" opacity={0.08} />
      <path
        d="M16 1.5 30.5 16 16 30.5 1.5 16Z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M1.5 16 16 1.5 16 8.5Z" fill="currentColor" opacity={0.75} />
      <path d="M1.5 16 16 8.5 8.5 16Z" fill="currentColor" opacity={0.48} />
      <path d="M16 1.5 23.5 16 16 8.5Z" fill="currentColor" opacity={0.36} />
      <path d="M16 1.5 30.5 16 23.5 16Z" fill="currentColor" opacity={0.16} />
      <path d="M30.5 16 16 23.5 23.5 16Z" fill="currentColor" opacity={0.1} />
      <path d="M30.5 16 16 30.5 16 23.5Z" fill="currentColor" opacity={0.05} />
      <path d="M16 30.5 8.5 16 16 23.5Z" fill="currentColor" opacity={0.08} />
      <path d="M16 30.5 1.5 16 8.5 16Z" fill="currentColor" opacity={0.22} />
      <path
        d="M16 8.5 23.5 16 16 23.5 8.5 16Z M16 13 19 16 16 19 13 16Z"
        fill="currentColor"
        fillRule="evenodd"
        opacity={0.9}
      />
    </>
  );
}
