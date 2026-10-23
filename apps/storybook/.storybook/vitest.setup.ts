import { setProjectAnnotations } from '@storybook/react-vite';
import { beforeAll } from 'vitest';

import * as projectAnnotations from './preview';

// Applies this Storybook's preview annotations (notably the synchronous dark-theme
// decorator, needed before axe runs its colour-contrast checks) to every story when
// it runs as a Vitest browser test. Without it, auto-provisioning skips the theme and
// a dark-mode contrast assertion fails.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
