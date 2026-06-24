import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from '../../typography/Eyebrow';
import { Text } from '../../typography/Text';
import { IconToggle } from './IconToggle';

const BoldIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 8h5a2.5 2.5 0 000-5H4v5zm0 0h5.5a2.5 2.5 0 010 5H4V8z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.5 9A6 6 0 017 2.5a.5.5 0 00-.6-.49A6.5 6.5 0 1013.99 9.6a.5.5 0 00-.49-.6z"
      fill="currentColor"
    />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const VARIANTS = ['ghost', 'secondary'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/UI/IconToggle',
  component: IconToggle,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { variant: 'ghost', size: 'md', 'aria-label': 'Toggle', icon: <BoldIcon /> },
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { icon: <BoldIcon />, 'aria-label': 'Bold', defaultPressed: false },
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
              <IconToggle variant={variant} icon={<BoldIcon />} aria-label="Bold" />
            </td>
            <td>
              <IconToggle variant={variant} icon={<BoldIcon />} aria-label="Bold" defaultPressed />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <IconToggle size={size} icon={<MoonIcon />} aria-label="Dark mode" />
          <Eyebrow>{size}</Eyebrow>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconToggle icon={<StarIcon />} aria-label="Favourite" disabled />
      <IconToggle variant="secondary" icon={<StarIcon />} aria-label="Favourite" disabled />
      <IconToggle icon={<StarIcon />} aria-label="Favourite" defaultPressed disabled />
    </div>
  ),
};
