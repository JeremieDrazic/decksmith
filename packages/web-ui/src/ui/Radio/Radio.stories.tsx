import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldLegend, FieldSet } from '../Field/Field';
import { Radio, RadioGroup } from './Radio';

const meta = {
  title: 'Components/UI/Radio',
  component: RadioGroup,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <FieldSet>
      <FieldLegend>Magic format</FieldLegend>
      <RadioGroup name="format-playground" defaultValue="commander" {...args}>
        <Radio value="standard">Standard</Radio>
        <Radio value="commander">Commander</Radio>
        <Radio value="modern">Modern</Radio>
        <Radio value="legacy">Legacy</Radio>
      </RadioGroup>
    </FieldSet>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Deck visibility</FieldLegend>
      <RadioGroup name="visibility" defaultValue="private">
        <Radio value="public">Public — anyone with the link can view</Radio>
        <Radio value="private">Private — only you</Radio>
        <Radio value="unlisted" disabled>
          Unlisted — coming soon
        </Radio>
      </RadioGroup>
    </FieldSet>
  ),
};

// ─── Horizontal ───────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Card condition</FieldLegend>
      <RadioGroup name="condition" defaultValue="nm" className="flex flex-row flex-wrap gap-x-6">
        <Radio value="nm">NM</Radio>
        <Radio value="lp">LP</Radio>
        <Radio value="mp">MP</Radio>
        <Radio value="hp">HP</Radio>
        <Radio value="dmg">DMG</Radio>
      </RadioGroup>
    </FieldSet>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: { a11y: { disable: true } },
  render: () => (
    <FieldSet>
      <FieldLegend>Language</FieldLegend>
      <RadioGroup name="language" defaultValue="en" disabled>
        <Radio value="en">English</Radio>
        <Radio value="fr">French</Radio>
        <Radio value="de">German</Radio>
      </RadioGroup>
    </FieldSet>
  ),
};
