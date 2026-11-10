import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgeChip } from '../BadgeChip.js';

const meta: Meta<typeof BadgeChip> = {
  title: 'Kinetic Grid/BadgeChip',
  component: BadgeChip,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof BadgeChip>;

export const Active: Story = {
  args: {
    variant: 'active',
    children: 'Active Member'
  }
};

export const Expiring: Story = {
  args: {
    variant: 'expiring',
    children: 'Expiring in 3 Days'
  }
};

export const Frozen: Story = {
  args: {
    variant: 'frozen',
    children: 'Frozen Account'
  }
};

export const Cyan: Story = {
  args: {
    variant: 'cyan',
    children: 'Optimal Saturation'
  }
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Turnstile Blocked'
  }
};

