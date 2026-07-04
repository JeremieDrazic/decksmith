import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../../hooks/use-theme';
import { Switch, type SwitchProps } from '../Switch/Switch';

export type ThemeToggleProps = Omit<SwitchProps, 'checked' | 'onCheckedChange' | 'thumbIcon'>;

/**
 * A Switch that toggles between light and dark mode.
 * Must be used within a `<ThemeProvider>`.
 *
 * @example
 * <ThemeToggle aria-label="Dark mode" />
 */
export function ThemeToggle({ ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Switch
      checked={isDark}
      onCheckedChange={toggleTheme}
      thumbIcon={
        isDark ? (
          <Moon className="size-2.5 text-accent-icon" />
        ) : (
          <Sun className="size-2.5 text-accent-icon" />
        )
      }
      {...props}
    />
  );
}
