import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { makePageHead } from '../../lib/head/make-page-head';

function DashboardPage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('dashboard.title')}</h1>
    </main>
  );
}

export const Route = createFileRoute('/dashboard/')({
  head: () => makePageHead('Dashboard'),
  component: DashboardPage,
});
