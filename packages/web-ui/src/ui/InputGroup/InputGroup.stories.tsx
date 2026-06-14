import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './InputGroup';

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M3 11V4a1 1 0 0 1 1-1h7"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

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
            <SearchIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Deck name" defaultValue="Atraxa Commander" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Clear">
            <XIcon />
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
            <CopyIcon />
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
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput disabled defaultValue="locked-site.com" />
    </InputGroup>
  ),
};
