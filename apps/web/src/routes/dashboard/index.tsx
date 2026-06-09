import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function DashboardPage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('dashboard.title')}</h1>
    </main>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});
