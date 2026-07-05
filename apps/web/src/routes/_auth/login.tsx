import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { makePageHead } from '../../lib/head/make-page-head';
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
import { makeSubmitHandler } from '../../lib/form/make-submit-handler';

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, errorCode } = useLogin();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: () => void navigate({ to: '/dashboard' }),
      });
    },
  });

  return (
    <div>
      <Text as="p" size="sm" tone="muted" className="mb-4 text-center">
        {t('auth.login.subtitle')}
      </Text>

      <Heading as="h1" size="xl" weight="semibold">
        {t('auth.login.title')}
      </Heading>
      <Separator className="my-4" />

      <form onSubmit={makeSubmitHandler(form.handleSubmit)}>
        <FieldGroup>
          <form.Field name="email" validators={{ onChange: LoginInputSchema.shape.email }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('auth.login.email')}</FieldLabel>
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
                <FieldLabel htmlFor={field.name}>{t('auth.login.password')}</FieldLabel>
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
                    {t('auth.login.forgotPassword')}
                  </AppLink>
                </div>
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        {isError ? (
          <FieldError className="mt-4 text-center">
            {errorCode === 'INVALID_CREDENTIALS'
              ? t('auth.login.invalidCredentials')
              : t('auth.login.errorFallback')}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          isLoading={isPending}
          loadingLabel={t('auth.login.loading')}
        >
          {t('auth.login.submit')}
        </Button>
      </form>

      <Text as="p" size="sm" tone="muted" className="mt-6 text-center">
        {t('auth.login.noAccount')}{' '}
        <AppLink to="/register">{t('auth.login.createAccount')}</AppLink>
      </Text>
    </div>
  );
}

export const Route = createFileRoute('/_auth/login')({
  head: () => makePageHead('Sign in'),
  component: LoginPage,
});
