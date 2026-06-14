import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../InputGroup/InputGroup';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './Field';

const meta = {
  title: 'Components/UI/Field',
  component: Field,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" placeholder="your-handle" />
    </Field>
  ),
};

// ─── WithDescription ──────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" type="email" placeholder="you@example.com" />
      <FieldDescription>We'll use this to send your export confirmation.</FieldDescription>
    </Field>
  ),
};

// ─── WithError ────────────────────────────────────────────────────────────────

export const WithError: Story = {
  render: () => (
    <Field invalid className="w-80">
      <FieldLabel htmlFor="email-error">Email</FieldLabel>
      <Input
        id="email-error"
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        aria-describedby="email-err"
      />
      <FieldError id="email-err">Please enter a valid email address.</FieldError>
    </Field>
  ),
};

// ─── WithErrorArray ───────────────────────────────────────────────────────────

export const WithErrorArray: Story = {
  render: () => (
    <Field invalid className="w-80">
      <FieldLabel htmlFor="password-err">Password</FieldLabel>
      <Input id="password-err" type="password" defaultValue="abc" aria-invalid />
      <FieldError
        errors={[
          'Must be at least 8 characters',
          'Must contain at least one number',
          'Must contain at least one number', // duplicate — deduplicated automatically
        ]}
      />
    </Field>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Field disabled className="w-80">
      <FieldLabel htmlFor="deck-name-disabled">Deck name</FieldLabel>
      <Input id="deck-name-disabled" defaultValue="Atraxa EDH" disabled />
      <FieldDescription>You cannot edit a locked deck.</FieldDescription>
    </Field>
  ),
};

// ─── WithTextarea ─────────────────────────────────────────────────────────────

export const WithTextarea: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="strategy">Strategy notes</FieldLabel>
      <Textarea id="strategy" placeholder="Describe your deck's win condition…" rows={3} />
      <FieldDescription>Optional — helps you remember the gameplan.</FieldDescription>
    </Field>
  ),
};

// ─── WithInputGroup ───────────────────────────────────────────────────────────

export const WithInputGroup: Story = {
  render: () => (
    <Field invalid className="w-80">
      <FieldLabel htmlFor="site-url">Website</FieldLabel>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput
          id="site-url"
          aria-invalid
          aria-describedby="site-url-err"
          defaultValue="not a url"
        />
      </InputGroup>
      <FieldError id="site-url-err">Please enter a valid URL.</FieldError>
    </Field>
  ),
};

// ─── FieldGroup ───────────────────────────────────────────────────────────────

export const Group: Story = {
  render: () => (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="first-name">First name</FieldLabel>
        <Input id="first-name" placeholder="Jace" />
      </Field>
      <Field>
        <FieldLabel htmlFor="last-name">Last name</FieldLabel>
        <Input id="last-name" placeholder="Beleren" />
      </Field>
      <Field invalid>
        <FieldLabel htmlFor="handle">Handle</FieldLabel>
        <Input id="handle" defaultValue="j@ce!" aria-invalid />
        <FieldDescription>Only letters, numbers and underscores.</FieldDescription>
        <FieldError>Handle contains invalid characters.</FieldError>
      </Field>
    </FieldGroup>
  ),
};
