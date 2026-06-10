/* global React */
// Lucide-style stroke icons (24×24, stroke 2, round) — matches the brand's
// stated Lucide usage without a CDN dependency in the kit.
const I =
  (paths, vb = 24) =>
  ({ size = 20, style, ...rest }) =>
    React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: `0 0 ${vb} ${vb}`,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style,
        ...rest,
      },
      paths.map((d, i) =>
        Array.isArray(d)
          ? React.createElement(d[0], { key: i, ...d[1] })
          : React.createElement('path', { key: i, d })
      )
    );

const Icons = {
  dashboard: I([
    ['rect', { x: 3, y: 3, width: 7, height: 8, rx: 1 }],
    ['rect', { x: 14, y: 3, width: 7, height: 5, rx: 1 }],
    ['rect', { x: 14, y: 11, width: 7, height: 10, rx: 1 }],
    ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }],
  ]),
  decks: I(['m12 2 9 5v10l-9 5-9-5V7l9-5Z', 'M12 22V12', 'm21 7-9 5-9-5']),
  collection: I([
    ['rect', { x: 3, y: 4, width: 18, height: 5, rx: 1 }],
    ['rect', { x: 3, y: 9, width: 18, height: 11, rx: 1 }],
    'M8 13h8',
  ]),
  search: I([['circle', { cx: 11, cy: 11, r: 7 }], 'm20 20-3.5-3.5']),
  settings: I([
    ['circle', { cx: 12, cy: 12, r: 3 }],
    'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 14a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 3.6 1.65 1.65 0 0 0 10 2.09V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 9c.36.14.62.46.69.85V10a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.6 1Z',
  ]),
  plus: I(['M5 12h14', 'M12 5v14']),
  grid: I([
    ['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }],
    ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }],
    ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }],
    ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }],
  ]),
  list: I(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01']),
  filter: I(['M22 3H2l8 9.46V19l4 2v-8.54L22 3Z']),
  chevron: I(['m9 18 6-6-6-6']),
  panelLeft: I([['rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }], 'M9 3v18']),
  bell: I(['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0']),
  edit: I(['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z']),
  box: I(['m21 8-9-5-9 5 9 5 9-5Z', 'M3 8v8l9 5 9-5V8', 'M12 13v8']),
  warn: I([
    'm10.29 3.86-8.17 14a1.5 1.5 0 0 0 1.29 2.25h16.34a1.5 1.5 0 0 0 1.29-2.25l-8.17-14a1.5 1.5 0 0 0-2.6 0Z',
    'M12 9v4',
    'M12 17h.01',
  ]),
  x: I(['M18 6 6 18', 'm6 6 12 12']),
  trash: I([
    'M3 6h18',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  ]),
  copy: I([
    ['rect', { x: 9, y: 9, width: 13, height: 13, rx: 2 }],
    'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  ]),
  more: I([
    ['circle', { cx: 12, cy: 5, r: 1 }],
    ['circle', { cx: 12, cy: 12, r: 1 }],
    ['circle', { cx: 12, cy: 19, r: 1 }],
  ]),
};

function Logo({ size = 26, withWord = true, color = 'var(--brand)' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span style={{ color, display: 'inline-flex' }}>
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M16 1.5 30.5 16 16 30.5 1.5 16 16 1.5Z" fill="currentColor" opacity=".15" />
          <path
            d="M16 1.5 30.5 16 16 30.5 1.5 16Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M16 8.5 23.5 16 16 23.5 8.5 16Z" fill="currentColor" />
          <path d="M16 13 19 16 16 19 13 16Z" fill="var(--bg)" />
        </svg>
      </span>
      {withWord && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: '-0.015em',
            color: 'var(--text)',
          }}
        >
          Decksmith
        </span>
      )}
    </span>
  );
}

window.DSKit = Object.assign(window.DSKit || {}, { Icons, Logo });
