import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic, Underline } from 'lucide-react';

import { Eyebrow } from '../../typography/Eyebrow';
import { Text } from '../../typography/Text';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/UI/Toggle',
  component: Toggle,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    variant: 'ghost',
    size: 'md',
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { children: 'Commander', defaultPressed: false },
  parameters: { controls: { disable: false } },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'secondary'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    defaultPressed: { control: 'boolean' },
  },
};

export const Variants: Story = {
  render: () => (
    <table className="border-separate border-spacing-x-8 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left">
            <Eyebrow>variant</Eyebrow>
          </th>
          <th className="text-left">
            <Eyebrow>unpressed</Eyebrow>
          </th>
          <th className="text-left">
            <Eyebrow>pressed</Eyebrow>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Text size="sm" tone="muted" mono>
              ghost
            </Text>
          </td>
          <td>
            <Toggle variant="ghost">Unpressed</Toggle>
          </td>
          <td>
            <Toggle variant="ghost" defaultPressed>
              Pressed
            </Toggle>
          </td>
        </tr>
        <tr>
          <td>
            <Text size="sm" tone="muted" mono>
              secondary
            </Text>
          </td>
          <td>
            <Toggle variant="secondary">Unpressed</Toggle>
          </td>
          <td>
            <Toggle variant="secondary" defaultPressed>
              Pressed
            </Toggle>
          </td>
        </tr>
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">xs</span>
      <Toggle size="xs">xs</Toggle>
      <span className="font-mono text-xs text-text-faint">sm</span>
      <Toggle size="sm">sm</Toggle>
      <span className="font-mono text-xs text-text-faint">md</span>
      <Toggle size="md">md</Toggle>
      <span className="font-mono text-xs text-text-faint">lg</span>
      <Toggle size="lg">lg</Toggle>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle aria-label="Bold">
          <Bold aria-hidden={true} />
        </Toggle>
        <Toggle aria-label="Italic">
          <Italic aria-hidden={true} />
        </Toggle>
        <Toggle aria-label="Underline">
          <Underline aria-hidden={true} />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="secondary" defaultPressed aria-label="Bold">
          <Bold aria-hidden={true} />
        </Toggle>
        <Toggle variant="secondary" aria-label="Italic">
          <Italic aria-hidden={true} />
        </Toggle>
        <Toggle variant="secondary" aria-label="Underline">
          <Underline aria-hidden={true} />
        </Toggle>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">ghost</span>
      <Toggle disabled>Ghost</Toggle>
      <span className="font-mono text-xs text-text-faint">secondary</span>
      <Toggle variant="secondary" disabled>
        Secondary
      </Toggle>
      <span className="font-mono text-xs text-text-faint">pressed + disabled</span>
      <Toggle defaultPressed disabled>
        Pressed
      </Toggle>
    </div>
  ),
};
