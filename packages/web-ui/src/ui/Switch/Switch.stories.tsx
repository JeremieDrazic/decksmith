import type { Meta, StoryObj } from '@storybook/react-vite';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '../Field/Field';
import { Switch } from './Switch';

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Field orientation="horizontal" className="w-fit">
      <FieldLabel variant="body" htmlFor="switch-playground">
        Enable feature
      </FieldLabel>
      <Switch id="switch-playground" {...args} />
    </Field>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel variant="body" htmlFor="switch-off">
          Off
        </FieldLabel>
        <Switch id="switch-off" />
      </Field>
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel variant="body" htmlFor="switch-on">
          On
        </FieldLabel>
        <Switch id="switch-on" defaultChecked />
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
        <FieldLabel variant="body" htmlFor="switch-dis-off">
          Disabled off
        </FieldLabel>
        <Switch id="switch-dis-off" disabled />
      </Field>
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel variant="body" htmlFor="switch-dis-on">
          Disabled on
        </FieldLabel>
        <Switch id="switch-dis-on" disabled defaultChecked />
      </Field>
    </div>
  ),
};

// ─── WithThumbIcon ────────────────────────────────────────────────────────────

export const WithThumbIcon: Story = {
  render: () => {
    function Demo() {
      const [checked, setChecked] = useState(false);
      const icon = checked ? (
        <Moon className="size-2.5 text-accent-icon" />
      ) : (
        <Sun className="size-2.5 text-accent-icon" />
      );
      return (
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel variant="body" htmlFor="switch-thumb-icon">
            Dark mode
          </FieldLabel>
          <Switch
            id="switch-thumb-icon"
            checked={checked}
            onCheckedChange={setChecked}
            thumbIcon={icon}
          />
        </Field>
      );
    }
    return <Demo />;
  },
};

// ─── WithDescription ──────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <FieldGroup className="w-96">
      <Field orientation="horizontal">
        <FieldLabel variant="body" htmlFor="notif-email">
          Email notifications
        </FieldLabel>
        <Switch id="notif-email" defaultChecked />
        <FieldContent>
          <FieldDescription>Receive deck export confirmations by email.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel variant="body" htmlFor="notif-push">
          Push notifications
        </FieldLabel>
        <Switch id="notif-push" />
        <FieldContent>
          <FieldDescription>Get alerts about price changes and new sets.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel variant="body" htmlFor="notif-sms">
          SMS alerts
        </FieldLabel>
        <Switch id="notif-sms" disabled />
        <FieldContent>
          <FieldDescription>Coming soon — not available yet.</FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
};
