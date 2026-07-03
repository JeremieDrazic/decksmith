import type { FormEvent } from 'react';

/**
 * Wraps a TanStack Form `handleSubmit` call in a native form submit handler.
 *
 * Prevents the browser's default form submission (page reload) and stops
 * the event from bubbling to ancestor elements that may have their own
 * submit handlers (e.g. dialogs, nested forms).
 *
 * @param handleSubmit - `form.handleSubmit` from `useForm()`.
 */
export function makeSubmitHandler(handleSubmit: () => unknown) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void handleSubmit();
  };
}
