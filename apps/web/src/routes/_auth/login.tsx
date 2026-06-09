import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('auth.login.title')}</h1>
    </main>
  );
}

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});
