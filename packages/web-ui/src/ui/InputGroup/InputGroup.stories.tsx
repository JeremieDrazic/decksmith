import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Search, X } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './InputGroup';

const meta = {
  title: 'Components/UI/InputGroup',
  component: InputGroup,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAddon: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="your-site.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>€</InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="username" />
      </InputGroup>
    </div>
  ),
};

export const RightAddon: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <InputGroup>
        <InputGroupInput placeholder="0.00" type="number" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="your-site" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <InputGroup>
        <InputGroupInput placeholder="Search cards…" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Search">
            <Search aria-hidden={true} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Deck name" defaultValue="Atraxa Commander" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Clear">
            <X aria-hidden={true} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const Combined: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="your-site.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Copy URL">
            <Copy aria-hidden={true} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Search cards…" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm">Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <InputGroup>
        <InputGroupAddon align="block-start">Note</InputGroupAddon>
        <InputGroupTextarea placeholder="Add a note about this deck…" rows={3} />
      </InputGroup>
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput
          aria-label="Website URL"
          aria-invalid="true"
          aria-describedby="url-error"
          defaultValue="not a url"
        />
      </InputGroup>
      <p id="url-error" className="text-xs text-error-text">
        Please enter a valid URL.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  // disabled state is exempt from WCAG 1.4.3 contrast requirements
  parameters: { a11y: { disable: true } },
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput aria-label="Website URL" disabled defaultValue="locked-site.com" />
    </InputGroup>
  ),
};
