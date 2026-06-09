import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function RegisterPage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('auth.register.title')}</h1>
    </main>
  );
}

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});
