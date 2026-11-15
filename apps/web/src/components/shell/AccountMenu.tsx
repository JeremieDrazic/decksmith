import { useNavigate } from '@tanstack/react-router';
import { Globe, LogOut, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@decksmith/query';
import type { User } from '@decksmith/schema/user/user';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ONE_YEAR_SECONDS,
  ResponsiveMenu,
  ResponsiveMenuContent,
  ResponsiveMenuItem,
  ResponsiveMenuSeparator,
  ResponsiveMenuTrigger,
  useTheme,
  writeCookie,
} from '@decksmith/web-ui';

import { LANGUAGE_COOKIE } from '../../i18n';

type AccountMenuProps = {
  /** The signed-in user, for the avatar initials. Absent in the isolated preview. */
  user?: User;
};

/** Up to two letters from the display name / username / email, for the avatar fallback. */
function userInitials(user: User): string {
  const source = (user.displayName ?? user.username ?? user.email).trim();
  const words = source.split(/\s+/).filter((word) => word.length > 0);
  if (words.length >= 2) {
    return ((words.at(0) ?? '').charAt(0) + (words.at(-1) ?? '').charAt(0)).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * The shell's account + tools control: a dropdown on desktop, a bottom sheet on
 * mobile (via `ResponsiveMenu`). The trigger is the user's avatar (initials, or
 * their picture). Holds the appearance toggles (theme, language) and sign-out —
 * the home for these until a real settings page earns its place.
 *
 * Theme and language are plain click items, not embedded widgets, so they stay
 * well-behaved inside a Base UI menu and a drawer alike.
 */
export function AccountMenu({ user }: AccountMenuProps) {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { theme, toggleTheme } = useTheme();

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  function switchLanguage() {
    const next = lang === 'fr' ? 'en' : 'fr';
    void i18n.changeLanguage(next);
    writeCookie(LANGUAGE_COOKIE, next, { maxAgeSeconds: ONE_YEAR_SECONDS });
  }

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => navigate({ to: '/login', search: { redirectTo: undefined } }),
    });
  }

  return (
    <ResponsiveMenu>
      <ResponsiveMenuTrigger
        render={
          <button
            type="button"
            aria-label={t('account.title')}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          />
        }
      >
        <Avatar size="md">
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback>{user ? userInitials(user) : '?'}</AvatarFallback>
        </Avatar>
      </ResponsiveMenuTrigger>
      <ResponsiveMenuContent title={t('account.title')}>
        <ResponsiveMenuItem onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Moon className="size-4" aria-hidden={true} />
          ) : (
            <Sun className="size-4" aria-hidden={true} />
          )}
          {theme === 'dark' ? t('theme.dark') : t('theme.light')}
        </ResponsiveMenuItem>
        <ResponsiveMenuItem onClick={switchLanguage}>
          <Globe className="size-4" aria-hidden={true} />
          {lang === 'fr' ? 'Français' : 'English'}
        </ResponsiveMenuItem>
        <ResponsiveMenuSeparator />
        <ResponsiveMenuItem onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden={true} />
          {t('account.logout')}
        </ResponsiveMenuItem>
      </ResponsiveMenuContent>
    </ResponsiveMenu>
  );
}
