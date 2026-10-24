import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button.js';
import { Zap, ShieldCheck } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Kinetic Grid/Button',
  component: Button,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Confirm Reservation',
    leftIcon: <Zap className="w-4 h-4" />
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Inspect Telemetry',
    leftIcon: <ShieldCheck className="w-4 h-4" />
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Processing RFID...'
  }
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Emergency Gate Lockdown'
  }
};
