// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as axe from 'axe-core';

import { LandingPage } from '../pages/LandingPage.js';
import { MemberPortalPage } from '../pages/member/MemberPortalPage.js';
import { CoachWorkspacePage } from '../pages/coach/CoachWorkspacePage.js';
import { ReportsPage } from '../pages/ReportsPage.js';
import { AnnouncementsPage } from '../pages/AnnouncementsPage.js';
import { FacilitiesPage } from '../pages/FacilitiesPage.js';
import { SystemPage } from '../pages/SystemPage.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Phase 5 Multi-Role Portals & Axe Accessibility Suite', () => {
  it('renders Public Landing Page (/) with live occupancy ticker and plans', async () => {
    const { container, getAllByText } = renderWithProviders(<LandingPage />);
    expect(getAllByText(/DOWNTOWN FLAGSHIP LIVE:/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Standard Gym/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Pro Performance/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Elite Black VIP/i).length).toBeGreaterThan(0);

    // Run axe accessibility check on landing page
    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(seriousOrCritical.length).toBe(0);
  });

  it('renders Member Self-Service Portal (/me) with rotating QR pass and chrono-nutrition', async () => {
    const { container, getAllByText } = renderWithProviders(<MemberPortalPage />);
    expect(getAllByText(/Alexander Vance/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Elite Black VIP/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Simulate NFC Gate Tap/i).length).toBeGreaterThan(0);
    expect(getAllByText(/MetCon Savage Circuit/i).length).toBeGreaterThan(0);

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  it('renders Coach Workspace (/coach) with ABAC client roster', async () => {
    const { container, getAllByText } = renderWithProviders(<CoachWorkspacePage />);
    expect(getAllByText(/Elena Rostova/i).length).toBeGreaterThan(0);
    expect(getAllByText(/ABAC Restricted/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Alexander Vance/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Log Assessment/i).length).toBeGreaterThan(0);

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  it('renders Reports & Intelligence (/reports) with heatmap and retention cohorts', async () => {
    const { container, getAllByText } = renderWithProviders(<ReportsPage />);
    expect(getAllByText(/M1 Retention Rate/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Hourly Facility Saturation Heatmap/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Export Comprehensive Report/i).length).toBeGreaterThan(0);
  });

  it('renders Announcements (/announcements) with broadcast composer', async () => {
    const { container, getAllByText } = renderWithProviders(<AnnouncementsPage />);
    expect(getAllByText(/Facility Announcements/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Compose Broadcast/i).length).toBeGreaterThan(0);
  });

  it('renders Facilities & Equipment (/facilities) with locker terminal and sectors', async () => {
    const { container, getAllByText } = renderWithProviders(<FacilitiesPage />);
    expect(getAllByText(/Equipment Inventory/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Eleiko IWF Weightlifting Bar/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Digital Lockers/i).length).toBeGreaterThan(0);
  });

  it('renders System Console (/system) with DLQ Manager and Saga Viewer', async () => {
    const { container, getAllByText } = renderWithProviders(<SystemPage />);
    expect(getAllByText(/Service Mesh Health/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Dead Letter Queue/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Distributed Sagas/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Unleash/i).length).toBeGreaterThan(0);
  });
});
