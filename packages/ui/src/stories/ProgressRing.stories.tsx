import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressRing } from '../ProgressRing.js';

const meta: Meta<typeof ProgressRing> = {
  title: 'Kinetic Grid/ProgressRing',
  component: ProgressRing,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const HighSaturation: Story = {
  args: {
    percentage: 74,
    size: 96,
    strokeWidth: 8,
    color: 'lime',
    label: '74%'
  }
};

export const ModerateSaturation: Story = {
  args: {
    percentage: 42,
    size: 96,
    strokeWidth: 8,
    color: 'cyan',
    label: '42%'
  }
};

export const CriticalSaturation: Story = {
  args: {
    percentage: 95,
    size: 96,
    strokeWidth: 8,
    color: 'danger',
    label: '95%'
  }
};
