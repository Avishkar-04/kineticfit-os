import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from '../KPICard.js';
import { BadgeChip } from '../BadgeChip.js';

const meta: Meta<typeof KPICard> = {
  title: 'Kinetic Grid/KPICard',
  component: KPICard,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof KPICard>;

export const ActiveAthletes: Story = {
  args: {
    label: 'Active Athletes',
    value: '1,680',
    delta: { value: '+4.2%', isPositive: true, period: 'vs last mo' },
    chip: <BadgeChip variant="active">Live Roster</BadgeChip>,
    subtext: 'Downtown Flagship Target: 1,800'
  }
};

export const FloorSaturation: Story = {
  args: {
    label: 'Floor Saturation',
    value: '74%',
    delta: { value: '-2.1%', isPositive: false, period: '15m trend' },
    chip: <BadgeChip variant="cyan">Optimal</BadgeChip>,
    subtext: '222 of 300 Max Capacity'
  }
};
