import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../Input.js';
import { Search, Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Kinetic Grid/Input',
  component: Input,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Athlete Email',
    placeholder: 'athlete@kineticfit.dev',
    leftIcon: <Mail className="w-4 h-4 text-slate-400" />
  }
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    leftIcon: <Lock className="w-4 h-4 text-slate-400" />
  }
};

export const WithError: Story = {
  args: {
    label: 'Membership ID',
    value: 'KF-INVALID',
    error: 'Invalid membership credential barcode',
    leftIcon: <Search className="w-4 h-4 text-red-400" />
  }
};
