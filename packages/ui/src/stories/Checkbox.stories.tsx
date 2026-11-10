import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../Checkbox.js';

const meta: Meta<typeof Checkbox> = {
  title: 'Kinetic Grid/Checkbox',
  component: Checkbox,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Send SMS check-in notifications',
    checked: true
  }
};

export const WithDescription: Story = {
  args: {
    label: 'Enable biometric turnstile pass',
    description: 'Allows contactless palm scan entry at Downtown Flagship',
    checked: false
  }
};

export const Disabled: Story = {
  args: {
    label: 'VIP Lounge Access',
    description: 'Included only with VIP Elite Tier ($289/mo)',
    checked: false,
    disabled: true
  }
};

