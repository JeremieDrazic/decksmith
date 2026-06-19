import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../Field/Field';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Field orientation="horizontal" className="w-fit">
      <Checkbox id="playground" {...args} />
      <FieldLabel htmlFor="playground">Accept terms and conditions</FieldLabel>
    </Field>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Field orientation="horizontal" className="w-fit">
        <Checkbox id="unchecked" />
        <FieldLabel htmlFor="unchecked">Unchecked</FieldLabel>
      </Field>
      <Field orientation="horizontal" className="w-fit">
        <Checkbox id="checked" defaultChecked />
        <FieldLabel htmlFor="checked">Checked</FieldLabel>
      </Field>
      <Field orientation="horizontal" className="w-fit">
        <Checkbox id="indeterminate" indeterminate defaultChecked />
        <FieldLabel htmlFor="indeterminate">Indeterminate</FieldLabel>
      </Field>
    </div>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: { a11y: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Field orientation="horizontal" className="w-fit">
        <Checkbox id="disabled-unchecked" disabled />
        <FieldLabel htmlFor="disabled-unchecked">Disabled unchecked</FieldLabel>
      </Field>
      <Field orientation="horizontal" className="w-fit">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <FieldLabel htmlFor="disabled-checked">Disabled checked</FieldLabel>
      </Field>
    </div>
  ),
};

// ─── WithDescription ──────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-96">
      <FieldLabel htmlFor="newsletter">Subscribe to newsletter</FieldLabel>
      <Checkbox id="newsletter" />
      <FieldContent>
        <FieldDescription>
          Receive weekly updates about new cards and deck strategies.
        </FieldDescription>
      </FieldContent>
    </Field>
  ),
};

// ─── Group ────────────────────────────────────────────────────────────────────

export const Group: Story = {
  render: () => (
    <FieldGroup className="w-72">
      <FieldSet>
        <FieldLegend>Export options</FieldLegend>
        <Field orientation="horizontal" className="w-fit">
          <Checkbox id="export-pdf" defaultChecked />
          <FieldLabel htmlFor="export-pdf">PDF printsheet</FieldLabel>
        </Field>
        <Field orientation="horizontal" className="w-fit">
          <Checkbox id="export-txt" defaultChecked />
          <FieldLabel htmlFor="export-txt">Text list</FieldLabel>
        </Field>
        <Field orientation="horizontal" className="w-fit">
          <Checkbox id="export-img" />
          <FieldLabel htmlFor="export-img">Card images</FieldLabel>
        </Field>
      </FieldSet>
    </FieldGroup>
  ),
};

// ─── WithError ────────────────────────────────────────────────────────────────

export const WithError: Story = {
  render: () => (
    <Field invalid orientation="horizontal" className="w-96">
      <Checkbox id="terms-error" aria-invalid aria-describedby="terms-err" />
      <FieldLabel htmlFor="terms-error">I accept the terms of service</FieldLabel>
      <FieldError id="terms-err">You must accept the terms to continue.</FieldError>
    </Field>
  ),
};
