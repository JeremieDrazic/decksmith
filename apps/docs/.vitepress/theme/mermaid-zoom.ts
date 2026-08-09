let closeOverlay: (() => void) | null = null;

// Loaded lazily (only when a diagram is actually clicked), not as a static
// top-level import: svg-pan-zoom references `window` at module-evaluation
// time, which crashes VitePress's SSR build pass (`vitepress build` renders
// every page in Node first, no window/document — a static import here would
// run regardless of whether anything in this file gets called).
async function openOverlay(sourceSvg: SVGSVGElement) {
  closeOverlay?.();

  const { default: svgPanZoom } = await import('svg-pan-zoom');

  const backdrop = document.createElement('div');
  backdrop.className = 'mermaid-zoom-backdrop';

  // Mermaid scopes its embedded <style> rules to the source SVG's own id
  // (e.g. "#mermaid-25 .actor { fill: ... }"). Keeping the clone's id
  // identical — rather than stripping it — is what lets those rules keep
  // matching inside the clone; a duplicate DOM id is otherwise harmless
  // here since nothing looks it up via getElementById.
  const svg = sourceSvg.cloneNode(true) as SVGSVGElement;
  svg.classList.add('mermaid-zoom-svg');
  backdrop.appendChild(svg);

  const closeButton = document.createElement('button');
  closeButton.className = 'mermaid-zoom-close';
  closeButton.setAttribute('aria-label', 'Close diagram zoom');
  closeButton.textContent = '×';
  backdrop.appendChild(closeButton);

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  const instance = svgPanZoom(svg, {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    minZoom: 0.5,
    maxZoom: 10,
  });

  const close = () => {
    instance.destroy();
    backdrop.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    closeOverlay = null;
  };

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);

  closeOverlay = close;
}

// lucide's "maximize-2" glyph — same icon language as packages/web-ui.
const ZOOM_BADGE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>`;

/** Decorative only — pointer-events: none in custom.css lets clicks fall through to the diagram. */
function ensureZoomBadge(mermaidEl: Element) {
  if (mermaidEl.querySelector(':scope > .mermaid-zoom-badge')) return;
  const badge = document.createElement('div');
  badge.className = 'mermaid-zoom-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML = ZOOM_BADGE_ICON;
  mermaidEl.appendChild(badge);
}

function watchMermaidDiagrams() {
  document.querySelectorAll('.mermaid').forEach(ensureZoomBadge);

  // Mermaid.vue fully replaces its own innerHTML (v-html) on every re-render
  // — including on dark/light toggle, which it watches for independently —
  // wiping out a previously-injected badge along with the old SVG. Watching
  // childList mutations on `document.body` catches both a brand new
  // `.mermaid` container appearing (SPA navigation) and an existing one
  // having its children swapped (theme toggle): the latter reports the
  // `.mermaid` div itself as `mutation.target`, not as an added node.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target;
      if (target instanceof Element && target.matches('.mermaid')) {
        ensureZoomBadge(target);
      }
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('.mermaid')) ensureZoomBadge(node);
        else node.querySelectorAll('.mermaid').forEach(ensureZoomBadge);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Click-to-zoom for rendered Mermaid diagrams, plus a hover badge marking
 * them as zoomable. A single delegated click listener on `document` handles
 * opening the overlay (Mermaid SVGs mount asynchronously and VitePress never
 * re-invokes `enhanceApp` on SPA navigation, so delegation sidesteps timing
 * entirely). The badge needs an actual DOM node per diagram — Mermaid.vue
 * only renders the <svg> — so that part still needs the observer above.
 */
export function setupMermaidZoom() {
  if (typeof window === 'undefined') return;

  watchMermaidDiagrams();

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const svg = target.closest('.mermaid svg');
    if (svg) void openOverlay(svg as SVGSVGElement);
  });
}
