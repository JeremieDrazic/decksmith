import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../Card';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    shape: 'block',
    className: 'h-20 w-60',
  },
  argTypes: {
    shape: {
      control: 'select',
      options: ['text', 'control', 'block', 'circle'],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

export const Shapes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-4">
      <span className="font-mono text-xs text-text-muted">text</span>
      <Skeleton shape="text" className="w-48" />

      <span className="font-mono text-xs text-text-muted">control</span>
      <Skeleton shape="control" className="h-10 w-28" />

      <span className="font-mono text-xs text-text-muted">block</span>
      <Skeleton shape="block" className="h-20 w-48" />

      <span className="font-mono text-xs text-text-muted">circle</span>
      <Skeleton shape="circle" className="size-10" />
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Skeleton shape="text" className="w-full" />
      <Skeleton shape="text" className="w-4/5" />
      <Skeleton shape="text" className="w-3/5" />
    </div>
  ),
};

export const CardExample: Story = {
  render: () => (
    <div aria-busy="true" aria-label="Loading card">
      <Card className="w-72 p-4">
        <div className="flex items-start gap-3">
          <Skeleton shape="circle" className="size-10 shrink-0" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton shape="text" className="w-3/4" />
            <Skeleton shape="text" className="w-1/2" />
          </div>
        </div>
        <Skeleton shape="block" className="mt-4 h-32 w-full" />
      </Card>
    </div>
  ),
};
