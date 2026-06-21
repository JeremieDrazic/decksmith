import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../Field/Field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

const meta = {
  title: 'Components/UI/Select',
  component: Select,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const FORMAT_ITEMS = (
  <>
    <SelectItem value="standard">Standard</SelectItem>
    <SelectItem value="pioneer">Pioneer</SelectItem>
    <SelectItem value="modern">Modern</SelectItem>
    <SelectItem value="legacy">Legacy</SelectItem>
    <SelectItem value="vintage">Vintage</SelectItem>
    <SelectItem value="commander">Commander</SelectItem>
    <SelectItem value="pauper">Pauper</SelectItem>
  </>
);

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-playground">Format</FieldLabel>
      <Select name="format" {...args}>
        <SelectTrigger id="select-playground">
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
    </Field>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-default">Format</FieldLabel>
      <Select name="format">
        <SelectTrigger id="select-default">
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
    </Field>
  ),
};

// ─── WithDefaultValue ─────────────────────────────────────────────────────────

export const WithDefaultValue: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-preselected">Format</FieldLabel>
      <Select name="format" defaultValue="commander">
        <SelectTrigger id="select-preselected">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
    </Field>
  ),
};

// ─── Controlled ───────────────────────────────────────────────────────────────

function ControlledDemo() {
  const [value, setValue] = React.useState('');

  return (
    <div className="flex flex-col gap-4 w-64">
      <Field>
        <FieldLabel htmlFor="select-controlled">Format</FieldLabel>
        <Select value={value} onValueChange={(v) => setValue(v ?? '')}>
          <SelectTrigger id="select-controlled">
            <SelectValue placeholder="Pick a format" />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>
      <p className="text-sm text-text-muted font-mono">
        value: <span className="text-accent-text">{value || '(none)'}</span>
      </p>
      <button
        type="button"
        onClick={() => setValue('')}
        className="text-xs text-text-muted underline w-fit"
      >
        Reset
      </button>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

// ─── ReadOnly ─────────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-readonly">Format</FieldLabel>
      <Select name="format" readOnly defaultValue="commander">
        <SelectTrigger id="select-readonly">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
      <FieldDescription>This field is read-only.</FieldDescription>
    </Field>
  ),
};

// ─── Required ─────────────────────────────────────────────────────────────────

export const Required: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-required">
        Format
        <span aria-hidden="true" className="text-error ml-0.5">
          *
        </span>
      </FieldLabel>
      <Select name="format" required>
        <SelectTrigger id="select-required" aria-required>
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
    </Field>
  ),
};

// ─── Multiple ─────────────────────────────────────────────────────────────────

function MultipleDemo() {
  const [values, setValues] = React.useState<string[]>(['standard', 'pioneer']);

  return (
    <div className="flex flex-col gap-4 w-72">
      <Field>
        <FieldLabel htmlFor="select-multi">Active formats</FieldLabel>
        <Select multiple value={values} onValueChange={(v) => setValues(v ?? [])}>
          <SelectTrigger id="select-multi">
            <SelectValue placeholder="Pick formats">
              {values.length === 0
                ? 'Pick formats'
                : values.length === 1
                  ? values[0]
                  : `${values.length} formats selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
        <FieldDescription>Select one or more formats to filter results.</FieldDescription>
      </Field>
      {values.length > 0 && (
        <p className="text-sm text-text-muted font-mono">
          selected: <span className="text-accent-text">{values.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
};

// ─── AllStates ────────────────────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
      <Field className="w-52">
        <FieldLabel htmlFor="state-empty">Empty</FieldLabel>
        <Select name="s1">
          <SelectTrigger id="state-empty">
            <SelectValue placeholder="Pick a format" />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>

      <Field className="w-52">
        <FieldLabel htmlFor="state-filled">Filled</FieldLabel>
        <Select name="s2" defaultValue="commander">
          <SelectTrigger id="state-filled">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>

      <Field className="w-52">
        <FieldLabel htmlFor="state-disabled">Disabled</FieldLabel>
        <Select name="s3" disabled defaultValue="commander">
          <SelectTrigger id="state-disabled">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>

      <Field className="w-52">
        <FieldLabel htmlFor="state-readonly">Read-only</FieldLabel>
        <Select name="s4" readOnly defaultValue="commander">
          <SelectTrigger id="state-readonly">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>

      <Field invalid className="w-52">
        <FieldLabel htmlFor="state-error">Error</FieldLabel>
        <Select name="s5">
          <SelectTrigger id="state-error" aria-invalid aria-describedby="state-err">
            <SelectValue placeholder="Pick a format" />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
        <FieldError id="state-err">Required.</FieldError>
      </Field>

      <Field invalid className="w-52">
        <FieldLabel htmlFor="state-error-filled">Error (filled)</FieldLabel>
        <Select name="s6" defaultValue="pauper">
          <SelectTrigger id="state-error-filled" aria-invalid aria-describedby="state-err2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
        <FieldError id="state-err2">Format not allowed.</FieldError>
      </Field>
    </div>
  ),
};

// ─── WithGroups ───────────────────────────────────────────────────────────────

export const WithGroups: Story = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="select-grouped">Format</FieldLabel>
      <Select name="format">
        <SelectTrigger id="select-grouped">
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Constructed</SelectGroupLabel>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="pioneer">Pioneer</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="legacy">Legacy</SelectItem>
            <SelectItem value="vintage">Vintage</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Multiplayer</SelectGroupLabel>
            <SelectItem value="commander">Commander</SelectItem>
            <SelectItem value="oathbreaker">Oathbreaker</SelectItem>
            <SelectItem value="brawl">Brawl</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Limited</SelectGroupLabel>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sealed">Sealed</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  ),
};

// ─── AlignItemWithTrigger ─────────────────────────────────────────────────────

export const AlignItemWithTrigger: Story = {
  render: () => (
    <div className="flex gap-12 items-start">
      <Field className="w-56">
        <FieldLabel htmlFor="align-below">Default (below)</FieldLabel>
        <Select name="fmt-a" defaultValue="commander">
          <SelectTrigger id="align-below">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>{FORMAT_ITEMS}</SelectContent>
        </Select>
        <FieldDescription className="text-[10px]">
          alignItemWithTrigger=false — popup opens below
        </FieldDescription>
      </Field>

      <Field className="w-56">
        <FieldLabel htmlFor="align-overlay">Overlay trigger</FieldLabel>
        <Select name="fmt-b" defaultValue="commander">
          <SelectTrigger id="align-overlay">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>{FORMAT_ITEMS}</SelectContent>
        </Select>
        <FieldDescription className="text-[10px]">
          alignItemWithTrigger=true — selected item overlaps trigger
        </FieldDescription>
      </Field>
    </div>
  ),
};

// ─── CustomIcon ───────────────────────────────────────────────────────────────

export const CustomIcon: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-custom-icon">Format</FieldLabel>
      <Select name="format" defaultValue="commander">
        <SelectTrigger id="select-custom-icon" showIcon={false}>
          <SelectValue />
          <SelectIcon>
            <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 7l2 2 2-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SelectIcon>
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
      <FieldDescription>
        showIcon=false disables the auto chevron — compose SelectIcon explicitly with a custom SVG.
      </FieldDescription>
    </Field>
  ),
};

// ─── WithDescription ──────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="select-desc">Format</FieldLabel>
      <Select name="format" defaultValue="commander">
        <SelectTrigger id="select-desc">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
      <FieldDescription>Choose the format to validate legality and banlist rules.</FieldDescription>
    </Field>
  ),
};

// ─── WithError ────────────────────────────────────────────────────────────────

export const WithError: Story = {
  render: () => (
    <Field invalid className="w-64">
      <FieldLabel htmlFor="select-error">Format</FieldLabel>
      <Select name="format">
        <SelectTrigger id="select-error" aria-invalid aria-describedby="select-err">
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
      <FieldError id="select-err">Please select a format to continue.</FieldError>
    </Field>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: { a11y: { disable: true } },
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-disabled">Format</FieldLabel>
      <Select name="format" disabled defaultValue="commander">
        <SelectTrigger id="select-disabled">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{FORMAT_ITEMS}</SelectContent>
      </Select>
    </Field>
  ),
};

// ─── DisabledItems ────────────────────────────────────────────────────────────

export const DisabledItems: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="select-dis-items">Format</FieldLabel>
      <Select name="format">
        <SelectTrigger id="select-dis-items">
          <SelectValue placeholder="Pick a format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="modern">Modern</SelectItem>
          <SelectItem value="legacy" disabled>
            Legacy (unavailable)
          </SelectItem>
          <SelectItem value="vintage" disabled>
            Vintage (unavailable)
          </SelectItem>
          <SelectItem value="commander">Commander</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  ),
};

// ─── MultipleSelects ──────────────────────────────────────────────────────────

export const MultipleSelects: Story = {
  render: () => (
    <FieldGroup className="w-72">
      <Field>
        <FieldLabel htmlFor="multi-format">Format</FieldLabel>
        <Select name="format" defaultValue="commander">
          <SelectTrigger id="multi-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{FORMAT_ITEMS}</SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="multi-sort">Sort by</FieldLabel>
        <Select name="sort" defaultValue="name">
          <SelectTrigger id="multi-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="cmc">CMC</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="multi-view">View</FieldLabel>
        <Select name="view" defaultValue="grid">
          <SelectTrigger id="multi-view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  ),
};
