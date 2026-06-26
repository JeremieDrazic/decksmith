import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Moon, Star } from 'lucide-react';

import { Eyebrow } from '../../typography/Eyebrow';
import { Text } from '../../typography/Text';
import { IconToggle } from './IconToggle';

const VARIANTS = ['ghost', 'secondary'] as const;

const meta = {
  title: 'Components/UI/IconToggle',
  component: IconToggle,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { variant: 'ghost', size: 'md', 'aria-label': 'Toggle', icon: <Bold aria-hidden={true} /> },
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { icon: <Bold aria-hidden={true} />, 'aria-label': 'Bold', defaultPressed: false },
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
        {VARIANTS.map((variant) => (
          <tr key={variant}>
            <td>
              <Text size="sm" tone="muted" mono>
                {variant}
              </Text>
            </td>
            <td>
              <IconToggle variant={variant} icon={<Bold aria-hidden={true} />} aria-label="Bold" />
            </td>
            <td>
              <IconToggle
                variant={variant}
                icon={<Bold aria-hidden={true} />}
                aria-label="Bold"
                defaultPressed
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">xs</span>
      <IconToggle size="xs" icon={<Moon aria-hidden={true} />} aria-label="Dark mode" />
      <span className="font-mono text-xs text-text-faint">sm</span>
      <IconToggle size="sm" icon={<Moon aria-hidden={true} />} aria-label="Dark mode" />
      <span className="font-mono text-xs text-text-faint">md</span>
      <IconToggle size="md" icon={<Moon aria-hidden={true} />} aria-label="Dark mode" />
      <span className="font-mono text-xs text-text-faint">lg</span>
      <IconToggle size="lg" icon={<Moon aria-hidden={true} />} aria-label="Dark mode" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">ghost</span>
      <IconToggle icon={<Star aria-hidden={true} />} aria-label="Favourite" disabled />
      <span className="font-mono text-xs text-text-faint">secondary</span>
      <IconToggle
        variant="secondary"
        icon={<Star aria-hidden={true} />}
        aria-label="Favourite"
        disabled
      />
      <span className="font-mono text-xs text-text-faint">pressed + disabled</span>
      <IconToggle
        icon={<Star aria-hidden={true} />}
        aria-label="Favourite"
        defaultPressed
        disabled
      />
    </div>
  ),
};
