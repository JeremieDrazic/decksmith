import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { setupMermaidZoom } from './mermaid-zoom';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp() {
    setupMermaidZoom();
  },
} satisfies Theme;
