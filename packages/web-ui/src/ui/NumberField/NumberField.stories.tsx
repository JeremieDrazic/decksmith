import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field, FieldDescription, FieldError, FieldLabel } from '../Field/Field';
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from './NumberField';

const meta = {
  title: 'Components/UI/NumberField',
  component: NumberField,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  args: { defaultValue: 1, min: 0, max: 10, step: 1 },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    defaultValue: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <Field>
      <FieldLabel>Quantity</FieldLabel>
      <NumberField {...args}>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </Field>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="font-mono text-xs text-text-muted">{size}</span>
          <NumberField defaultValue={2} min={0} max={4}>
            <NumberFieldGroup size={size}>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </div>
      ))}
    </div>
  ),
};

// ─── WithScrub ────────────────────────────────────────────────────────────────

export const WithScrub: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-xs text-text-muted">
        Drag the label left/right to adjust the value (Pointer Lock — not supported in Safari)
      </p>
      <div className="flex items-center gap-6">
        <Field>
          <NumberField defaultValue={2} min={0} max={4}>
            <NumberFieldScrubArea>
              <FieldLabel className="cursor-ew-resize">Quantity</FieldLabel>
            </NumberFieldScrubArea>
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </Field>

        <Field>
          <NumberField defaultValue={3} min={0} max={16}>
            <NumberFieldScrubArea>
              <FieldLabel className="cursor-ew-resize">CMC</FieldLabel>
            </NumberFieldScrubArea>
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </Field>
      </div>
    </div>
  ),
};

// ─── WithFormat ───────────────────────────────────────────────────────────────

export const WithFormat: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Field>
        <FieldLabel>Price (USD)</FieldLabel>
        <NumberField
          defaultValue={12.5}
          min={0}
          step={0.01}
          format={{ style: 'currency', currency: 'USD' }}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput className="w-24" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>Price (EUR)</FieldLabel>
        <NumberField
          defaultValue={11.2}
          min={0}
          step={0.01}
          format={{ style: 'currency', currency: 'EUR' }}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput className="w-24" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>Completion</FieldLabel>
        <NumberField defaultValue={0.75} min={0} max={1} step={0.05} format={{ style: 'percent' }}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput className="w-20" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>
    </div>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Field>
        <FieldLabel>Default</FieldLabel>
        <NumberField defaultValue={2} min={0} max={4}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>At minimum</FieldLabel>
        <NumberField defaultValue={0} min={0} max={4}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>At maximum</FieldLabel>
        <NumberField defaultValue={4} min={0} max={4}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>Disabled</FieldLabel>
        <NumberField defaultValue={2} min={0} max={4} disabled>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </Field>

      <Field>
        <FieldLabel>With description</FieldLabel>
        <NumberField defaultValue={1} min={1} step={1}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <FieldDescription>Alt ↓ for ×0.1, Shift ↓ for ×10</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>With error</FieldLabel>
        <NumberField defaultValue={5} min={0} max={4}>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput aria-invalid="true" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <FieldError>Maximum is 4 copies.</FieldError>
      </Field>
    </div>
  ),
};

// ─── Examples ────────────────────────────────────────────────────────────────

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {/* Deck builder card quantity */}
      <div>
        <p className="mb-4 font-mono text-xs text-text-muted">Deck builder — card quantities</p>
        <div className="w-72 rounded-surface border border-border bg-surface p-4">
          <div className="flex flex-col gap-3">
            {(
              [
                { name: 'Ragavan, Nimble Pilferer', qty: 4, max: 4 },
                { name: "Dragon's Rage Channeler", qty: 4, max: 4 },
                { name: 'Murktide Regent', qty: 3, max: 4 },
                { name: 'Lightning Bolt', qty: 4, max: 4 },
              ] as const
            ).map(({ name, qty, max }) => (
              <div key={name} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-text">{name}</span>
                <NumberField defaultValue={qty} min={0} max={max}>
                  <NumberFieldGroup size="sm">
                    <NumberFieldDecrement />
                    <NumberFieldInput />
                    <NumberFieldIncrement />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CMC range filter */}
      <div>
        <p className="mb-4 font-mono text-xs text-text-muted">Collection filter — CMC range</p>
        <div className="flex items-end gap-3">
          <Field>
            <NumberField defaultValue={1} min={0} max={16}>
              <NumberFieldScrubArea>
                <FieldLabel className="cursor-ew-resize">Min CMC</FieldLabel>
              </NumberFieldScrubArea>
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </Field>
          <span className="mb-2 text-sm text-text-muted">–</span>
          <Field>
            <NumberField defaultValue={4} min={0} max={16}>
              <NumberFieldScrubArea>
                <FieldLabel className="cursor-ew-resize">Max CMC</FieldLabel>
              </NumberFieldScrubArea>
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </Field>
        </div>
      </div>
    </div>
  ),
};
