// Phase 14 — React Native token values
// Generated from the same TypeScript primitives as web/tokens.css.
// See ADR-0017 for the dual-output strategy and Style Dictionary deferral.
import { semanticColors } from '../semantic/colors.js';
import { motion } from '../primitives/motion.js';
import { radius } from '../primitives/radius.js';
import { shadows } from '../primitives/shadows.js';
import { zIndex } from '../primitives/z-index.js';

export const tokens = {
  color: semanticColors,
  motion,
  radius,
  shadows,
  zIndex,
} as const;
