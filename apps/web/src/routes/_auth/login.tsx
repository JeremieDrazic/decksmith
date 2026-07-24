import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useLogin } from '@decksmith/query';
import { LoginInputSchema } from '@decksmith/schema/auth';
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Heading,
  Input,
  Separator,
  Text,
} from '@decksmith/web-ui';

import { AppLink } from '../../components/AppLink';
import { getFieldError } from '../../lib/form/get-field-error';
import { makePageHead } from '../../lib/head/make-page-head';
import { makeSubmitHandler } from '../../lib/form/make-submit-handler';

function LoginPage() {
  const { t } = useTranslation('auth');
  const { t: tError } = useTranslation('errors');
  const navigate = useNavigate();
  const { redirectTo } = useSearch({ from: '/_auth/login' });
  const { mutate: login, isPending, isError, errorCode } = useLogin();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: () => void navigate({ to: redirectTo ?? '/dashboard' }),
      });
    },
  });

  return (
    <div>
      <Text as="p" size="sm" tone="muted" className="mb-4 text-center">
        {t('login.subtitle')}
      </Text>

      <Heading as="h1" size="xl" weight="semibold">
        {t('login.title')}
      </Heading>
      <Separator className="my-4" />

      <form onSubmit={makeSubmitHandler(form.handleSubmit)}>
        <FieldGroup>
          <form.Field name="email" validators={{ onChange: LoginInputSchema.shape.email }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta, tError);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('login.email')}</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError ? true : undefined}
                  />
                  <FieldError errors={errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t('login.password')}</FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <div className="flex justify-end">
                  <AppLink to="/forgot-password" variant="subtle" className="text-sm">
                    {t('login.forgotPassword')}
                  </AppLink>
                </div>
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        {isError ? (
          <FieldError className="mt-4 text-center">
            {tError(errorCode ?? 'REQUEST_ERROR')}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          isLoading={isPending}
          loadingLabel={t('login.loading')}
        >
          {t('login.submit')}
        </Button>
      </form>

      <Text as="p" size="sm" tone="muted" className="mt-6 text-center">
        {t('login.noAccount')} <AppLink to="/register">{t('login.createAccount')}</AppLink>
      </Text>
    </div>
  );
}

export const Route = createFileRoute('/_auth/login')({
  head: () => makePageHead('Sign in'),
  component: LoginPage,
});
