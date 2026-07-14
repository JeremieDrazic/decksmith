import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useRegister } from '@decksmith/query';
import { PasswordSchema, RegisterInputSchema } from '@decksmith/schema/auth';
import {
  Button,
  Field,
  FieldDescription,
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

function RegisterPage() {
  const { t } = useTranslation('auth');
  const { t: tError } = useTranslation('errors');
  const { mutate: register, isPending, isSuccess, isError, data, errorCode } = useRegister();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => {
      register(value);
    },
  });

  if (isSuccess && data) {
    return (
      <div className="text-center">
        <Heading as="h1" size="xl" weight="semibold" className="mb-4">
          {t('register.title')}
        </Heading>
        <Text as="p" tone="muted">
          {t('register.successMessage')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Heading as="h1" size="xl" weight="semibold">
        {t('register.title')}
      </Heading>
      <Separator className="my-4" />

      <form onSubmit={makeSubmitHandler(form.handleSubmit)}>
        <FieldGroup>
          <form.Field name="email" validators={{ onChange: RegisterInputSchema.shape.email }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta, tError);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('register.email')}</FieldLabel>
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

          <form.Field name="password" validators={{ onChange: PasswordSchema }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta, tError);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('register.password')}</FieldLabel>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError ? true : undefined}
                  />
                  <FieldDescription>{t('register.passwordHint')}</FieldDescription>
                  <FieldError errors={errors} />
                </Field>
              );
            }}
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
          loadingLabel={t('register.loading')}
        >
          {t('register.submit')}
        </Button>
      </form>

      <Text as="p" size="sm" tone="muted" className="mt-6 text-center">
        {t('register.haveAccount')} <AppLink to="/login">{t('register.signIn')}</AppLink>
      </Text>
    </div>
  );
}

export const Route = createFileRoute('/_auth/register')({
  head: () => makePageHead('Create account'),
  component: RegisterPage,
});
