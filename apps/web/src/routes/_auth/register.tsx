import { useForm } from '@tanstack/react-form';
import { Link, createFileRoute } from '@tanstack/react-router';
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

import { getFieldError } from '../../lib/form/get-field-error';
import { makeSubmitHandler } from '../../lib/form/make-submit-handler';

function RegisterPage() {
  const { t } = useTranslation();
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
          {t('auth.register.title')}
        </Heading>
        <Text as="p" tone="muted">
          {t('auth.register.successMessage')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Heading as="h1" size="xl" weight="semibold">
        {t('auth.register.title')}
      </Heading>
      <Separator className="my-4" />

      <form onSubmit={makeSubmitHandler(form.handleSubmit)}>
        <FieldGroup>
          <form.Field name="email" validators={{ onChange: RegisterInputSchema.shape.email }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('auth.register.email')}</FieldLabel>
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
              const { hasError, errors } = getFieldError(field.state.meta);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('auth.register.password')}</FieldLabel>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError ? true : undefined}
                  />
                  <FieldDescription>{t('auth.register.passwordHint')}</FieldDescription>
                  <FieldError errors={errors} />
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        {isError ? (
          <FieldError className="mt-4 text-center">
            {errorCode === 'EMAIL_ALREADY_TAKEN'
              ? t('auth.register.emailTaken')
              : t('auth.register.errorFallback')}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          isLoading={isPending}
          loadingLabel={t('auth.register.loading')}
        >
          {t('auth.register.submit')}
        </Button>
      </form>

      <Text as="p" size="sm" tone="muted" className="mt-6 text-center">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="text-accent-text hover:underline">
          {t('auth.register.signIn')}
        </Link>
      </Text>
    </div>
  );
}

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});
