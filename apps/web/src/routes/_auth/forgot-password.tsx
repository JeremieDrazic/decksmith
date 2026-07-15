import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useForgotPassword } from '@decksmith/query';
import { ForgotPasswordInputSchema } from '@decksmith/schema/auth';
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

function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tError } = useTranslation('errors');
  const { mutate: forgotPassword, isPending, isSuccess, isError } = useForgotPassword();

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: ({ value }) => {
      forgotPassword(value);
    },
  });

  if (isSuccess) {
    return (
      <div className="text-center">
        <Heading as="h1" size="xl" weight="semibold" className="mb-2">
          {t('forgotPassword.successTitle')}
        </Heading>
        <Text as="p" tone="muted">
          {t('forgotPassword.successMessage')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Heading as="h1" size="xl" weight="semibold">
        {t('forgotPassword.title')}
      </Heading>
      <Separator className="my-4" />

      <Text as="p" size="sm" tone="muted" className="mb-6">
        {t('forgotPassword.description')}
      </Text>

      <form onSubmit={makeSubmitHandler(form.handleSubmit)}>
        <FieldGroup>
          <form.Field name="email" validators={{ onChange: ForgotPasswordInputSchema.shape.email }}>
            {(field) => {
              const { hasError, errors } = getFieldError(field.state.meta, tError);
              return (
                <Field invalid={hasError}>
                  <FieldLabel htmlFor={field.name}>{t('forgotPassword.email')}</FieldLabel>
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
        </FieldGroup>

        {isError ? (
          <FieldError className="mt-4 text-center">{tError('REQUEST_ERROR')}</FieldError>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          isLoading={isPending}
          loadingLabel={t('forgotPassword.loading')}
        >
          {t('forgotPassword.submit')}
        </Button>
      </form>

      <Text as="p" size="sm" tone="muted" className="mt-6">
        <AppLink to="/login">{t('forgotPassword.back')}</AppLink>
      </Text>
    </div>
  );
}

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => makePageHead('Reset password'),
  component: ForgotPasswordPage,
});
