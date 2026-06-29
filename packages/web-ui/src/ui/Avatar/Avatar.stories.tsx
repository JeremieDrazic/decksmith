import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, AvatarFallback, AvatarImage } from './Avatar';

const meta = {
  title: 'Components/UI/Avatar',
  component: Avatar,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/100?img=3" alt="Player avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="font-mono text-xs text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ─── WithImage ────────────────────────────────────────────────────────────────

export const WithImage: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src="https://i.pravatar.cc/100?img=3" alt="Player avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="font-mono text-xs text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ─── InitialsFallback ─────────────────────────────────────────────────────────

export const InitialsFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>TC</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// ─── BrokenImage ─────────────────────────────────────────────────────────────

export const BrokenImage: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-xs text-text-muted">
        src invalide → fallback affiché immédiatement
      </span>
      <Avatar size="lg">
        <AvatarImage src="/nonexistent-avatar.jpg" alt="Avatar cassé" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// ─── Examples ─────────────────────────────────────────────────────────────────

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 font-mono text-xs text-text-muted">Barre de navigation</p>
        <div className="flex w-64 items-center gap-2 rounded-interactive border border-border bg-surface px-3 py-2">
          <span className="flex-1 text-sm text-text">Decksmith</span>
          <Avatar size="sm">
            <AvatarImage src="https://i.pravatar.cc/100?img=3" alt="Jérémie Drazic" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs text-text-muted">Liste de joueurs</p>
        <div className="flex flex-col gap-3">
          {(
            [
              { initials: 'JD', name: 'Jérémie Drazic', img: 'https://i.pravatar.cc/100?img=3' },
              { initials: 'MK', name: 'Morgan Kell', img: null },
              { initials: 'TC', name: 'Tyler Chen', img: 'https://i.pravatar.cc/100?img=11' },
            ] as const
          ).map(({ initials, name, img }) => (
            <div key={name} className="flex items-center gap-3">
              <Avatar size="md">
                {img ? <AvatarImage src={img} alt={name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-text">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
