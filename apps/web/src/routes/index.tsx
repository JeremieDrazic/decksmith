import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t('home.title')}</h1>
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
});
