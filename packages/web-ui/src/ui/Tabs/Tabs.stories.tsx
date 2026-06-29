import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../Badge/Badge';
import { Tab, Tabs, TabsIndicator, TabsList, TabsPanel } from './Tabs';

const meta = {
  title: 'Components/UI/Tabs',
  component: Tabs,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  args: { defaultValue: 'cards' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <Tab value="cards">Cards</Tab>
        <Tab value="stats">Stats</Tab>
        <Tab value="sideboard">Sideboard</Tab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="cards">
        <p className="text-sm text-text-muted">Cards panel</p>
      </TabsPanel>
      <TabsPanel value="stats">
        <p className="text-sm text-text-muted">Stats panel</p>
      </TabsPanel>
      <TabsPanel value="sideboard">
        <p className="text-sm text-text-muted">Sideboard panel</p>
      </TabsPanel>
    </Tabs>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList>
        <Tab value="a">Overview</Tab>
        <Tab value="b">Details</Tab>
        <Tab value="c">History</Tab>
        <Tab value="d" disabled>
          Disabled
        </Tab>
        <TabsIndicator />
      </TabsList>
    </Tabs>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size}>
          <span className="mb-3 block font-mono text-xs text-text-muted">{size}</span>
          <Tabs defaultValue="a">
            <TabsList>
              <Tab value="a" size={size}>
                Overview
              </Tab>
              <Tab value="b" size={size}>
                Details
              </Tab>
              <Tab value="c" size={size}>
                History
              </Tab>
              <TabsIndicator />
            </TabsList>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

// ─── ActivateOnFocus ──────────────────────────────────────────────────────────

export const ActivateOnFocus: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <p className="mb-1 font-mono text-xs text-text-muted">
          activateOnFocus=false (default) — arrow keys move focus, Enter/Space activates
        </p>
        <p className="mb-4 text-xs text-text-faint">
          Prefer this when panels fetch data — avoids a fetch on every arrow key press.
        </p>
        <Tabs defaultValue="cards">
          <TabsList activateOnFocus={false}>
            <Tab value="cards">Cards</Tab>
            <Tab value="stats">Stats</Tab>
            <Tab value="sideboard">Sideboard</Tab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="cards">
            <p className="text-sm text-text-muted">Cards — would trigger fetch on activate.</p>
          </TabsPanel>
          <TabsPanel value="stats">
            <p className="text-sm text-text-muted">Stats — would trigger fetch on activate.</p>
          </TabsPanel>
          <TabsPanel value="sideboard">
            <p className="text-sm text-text-muted">Sideboard — would trigger fetch on activate.</p>
          </TabsPanel>
        </Tabs>
      </div>

      <div>
        <p className="mb-1 font-mono text-xs text-text-muted">
          activateOnFocus=true — panel activates immediately on arrow key focus
        </p>
        <p className="mb-4 text-xs text-text-faint">
          Fine for pre-loaded content or lightweight panels (no fetch involved).
        </p>
        <Tabs defaultValue="cards">
          <TabsList activateOnFocus>
            <Tab value="cards">Cards</Tab>
            <Tab value="stats">Stats</Tab>
            <Tab value="sideboard">Sideboard</Tab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="cards">
            <p className="text-sm text-text-muted">Cards panel</p>
          </TabsPanel>
          <TabsPanel value="stats">
            <p className="text-sm text-text-muted">Stats panel</p>
          </TabsPanel>
          <TabsPanel value="sideboard">
            <p className="text-sm text-text-muted">Sideboard panel</p>
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  ),
};

// ─── WithContent ──────────────────────────────────────────────────────────────

export const WithContent: Story = {
  render: () => (
    <div className="w-96">
      <Tabs defaultValue="cards">
        <TabsList>
          <Tab value="cards">Cards</Tab>
          <Tab value="stats">Stats</Tab>
          <Tab value="sideboard">Sideboard</Tab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="cards">
          <div className="flex flex-col gap-2">
            {(
              [
                { name: 'Ragavan, Nimble Pilferer', qty: 4 },
                { name: "Dragon's Rage Channeler", qty: 4 },
                { name: 'Murktide Regent', qty: 3 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Counterspell', qty: 4 },
              ] as const
            ).map(({ name, qty }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-text">{name}</span>
                <span className="font-mono text-text-muted">×{qty}</span>
              </div>
            ))}
          </div>
        </TabsPanel>
        <TabsPanel value="stats">
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { label: 'Total cards', value: '60' },
                { label: 'Avg. CMC', value: '1.8' },
                { label: 'Lands', value: '20' },
                { label: 'Non-lands', value: '40' },
              ] as const
            ).map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted">{label}</span>
                <span className="text-xl font-semibold text-text">{value}</span>
              </div>
            ))}
          </div>
        </TabsPanel>
        <TabsPanel value="sideboard">
          <div className="flex flex-col gap-2">
            {(
              [
                { name: 'Surgical Extraction', qty: 2 },
                { name: 'Flusterstorm', qty: 2 },
                { name: 'Alpine Moon', qty: 2 },
              ] as const
            ).map(({ name, qty }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-text">{name}</span>
                <span className="font-mono text-text-muted">×{qty}</span>
              </div>
            ))}
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  ),
};

// ─── Examples ────────────────────────────────────────────────────────────────

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      {/* Deck builder */}
      <div>
        <p className="mb-4 font-mono text-xs text-text-muted">Deck builder</p>
        <div className="w-96 rounded-surface border border-border bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-semibold text-text">Izzet Murktide</span>
            <Badge tone="accent" size="sm">
              60 cards
            </Badge>
          </div>
          <Tabs defaultValue="cards">
            <TabsList>
              <Tab value="cards">Cards</Tab>
              <Tab value="stats">Stats</Tab>
              <Tab value="sideboard">Sideboard</Tab>
              <Tab value="maybeboard">Maybeboard</Tab>
              <TabsIndicator />
            </TabsList>
            <TabsPanel value="cards">
              <p className="text-sm text-text-muted">60 cards across 8 sections.</p>
            </TabsPanel>
            <TabsPanel value="stats">
              <p className="text-sm text-text-muted">Mana curve, color distribution.</p>
            </TabsPanel>
            <TabsPanel value="sideboard">
              <p className="text-sm text-text-muted">15 sideboard cards.</p>
            </TabsPanel>
            <TabsPanel value="maybeboard">
              <p className="text-sm text-text-muted">Cards under consideration.</p>
            </TabsPanel>
          </Tabs>
        </div>
      </div>

      {/* Card detail */}
      <div>
        <p className="mb-4 font-mono text-xs text-text-muted">Card detail</p>
        <div className="w-80 rounded-surface border border-border bg-surface p-4">
          <div className="mb-4">
            <p className="text-base font-semibold text-text">Ragavan, Nimble Pilferer</p>
            <p className="text-xs text-text-muted">Legendary Creature — Monkey Pirate</p>
          </div>
          <Tabs defaultValue="details">
            <TabsList>
              <Tab value="details" size="sm">
                Details
              </Tab>
              <Tab value="prints" size="sm">
                Prints
              </Tab>
              <Tab value="rulings" size="sm">
                Rulings
              </Tab>
              <TabsIndicator />
            </TabsList>
            <TabsPanel value="details">
              <p className="text-sm text-text-muted">Card oracle text and legality.</p>
            </TabsPanel>
            <TabsPanel value="prints">
              <p className="text-sm text-text-muted">All available printings and prices.</p>
            </TabsPanel>
            <TabsPanel value="rulings">
              <p className="text-sm text-text-muted">Official rulings from WOTC.</p>
            </TabsPanel>
          </Tabs>
        </div>
      </div>
    </div>
  ),
};
