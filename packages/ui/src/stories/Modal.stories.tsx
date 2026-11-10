import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '../Modal.js';
import { Button } from '../Button.js';

const meta: Meta<typeof Modal> = {
  title: 'Kinetic Grid/Modal',
  component: Modal,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Class Reservation',
    description: 'You are booking Olympic Weightlifting Clinic with Coach Elena Rostova.',
    children: (
      <div className="space-y-4 text-slate-300 text-sm">
        <p>Studio: Studio 4 (Oly Lifting)</p>
        <p>Time: Tuesday 18:00 - 19:00 UTC</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-[#262f3e]">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm Spot</Button>
        </div>
      </div>
    ),
    onClose: () => {}
  }
};

