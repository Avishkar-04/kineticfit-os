// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthPage } from '../components/auth/AuthPage.js';
import { KioskPage } from '../pages/KioskPage.js';
import { MembersPage } from '../pages/MembersPage.js';
import { SchedulePage } from '../pages/SchedulePage.js';
import { AppShell } from '../components/layout/AppShell.js';
import { AppRoutes, NotFoundPage } from '../App.js';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

describe('QA Automation Suite: End-to-End Interactive Workflows & Negative Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  describe('Authentication Workflow (/auth)', () => {
    const renderAuthPage = () =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/auth']}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<div data-testid="dashboard-view">Dashboard</div>} />
              <Route path="/kiosk" element={<div data-testid="kiosk-view">Kiosk</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

    it('switches between Sign In and Athlete Registration tabs and displays correct UI fields', () => {
      renderAuthPage();
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();

      const registerTab = screen.getByRole('button', { name: /Athlete Registration/i });
      fireEvent.click(registerTab);

      expect(screen.getByLabelText(/Full Athlete Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Membership Tier/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard Gym/i)).toBeInTheDocument();
      expect(screen.getByText(/Pro Performance/i)).toBeInTheDocument();
      expect(screen.getByText(/Elite Black VIP/i)).toBeInTheDocument();
    });

    it('negative test: rejects empty credentials submission with error banner', () => {
      renderAuthPage();
      const form = screen.getByRole('button', { name: /Authenticate Access/i }).closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText(/Please fill in all required credentials/i)).toBeInTheDocument();
    });

    it('negative test: rejects registration with weak password lacking special char/digits', () => {
      renderAuthPage();
      fireEvent.click(screen.getByRole('button', { name: /Athlete Registration/i }));

      fireEvent.change(screen.getByLabelText(/Full Athlete Name/i), { target: { value: 'Test Athlete' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'athlete@kineticfit.dev' } });
      fireEvent.change(screen.getByLabelText(/Passphrase/i), { target: { value: 'simplepass' } });

      const submitBtn = screen.getByRole('button', { name: /Register & Issue RFID Keycard/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Password must fulfill all security criteria/i)).toBeInTheDocument();
    });

    it('allows navigation to Tap RFID / GymKit Kiosk', () => {
      renderAuthPage();
      const kioskBtn = screen.getByRole('button', { name: /Tap RFID \/ GymKit/i });
      fireEvent.click(kioskBtn);
      expect(screen.getByTestId('kiosk-view')).toBeInTheDocument();
    });
  });

  describe('Hardware Kiosk Terminal Workflow (/kiosk)', () => {
    const renderKioskPage = () =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/kiosk']}>
            <Routes>
              <Route path="/kiosk" element={<KioskPage />} />
              <Route path="/dashboard" element={<div data-testid="dashboard-view">Dashboard</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

    it('grants turnstile access on valid RFID UID tap', () => {
      renderKioskPage();
      const rfidInput = screen.getByPlaceholderText(/Simulate RFID Keycard Tap/i);
      fireEvent.change(rfidInput, { target: { value: '04:E9:AA:88:12' } });

      const tapBtn = screen.getByRole('button', { name: /Tap/i });
      fireEvent.click(tapBtn);

      expect(screen.getByText('ACCESS GRANTED')).toBeInTheDocument();
      expect(screen.getByText('Aria Sterling')).toBeInTheDocument();
      expect(screen.getByText(/Floor Access Verified — Turnstile Gate Unlocked/i)).toBeInTheDocument();
    });

    it('denies access on expired or blacklisted keycard (9999 or denied)', () => {
      renderKioskPage();
      const rfidInput = screen.getByPlaceholderText(/Simulate RFID Keycard Tap/i);
      fireEvent.change(rfidInput, { target: { value: 'RFID-9999-REVOKED' } });

      const tapBtn = screen.getByRole('button', { name: /Tap/i });
      fireEvent.click(tapBtn);

      expect(screen.getByText('ACCESS DENIED')).toBeInTheDocument();
      expect(screen.getByText(/Membership Expired or Invalid RFID Keycard UID/i)).toBeInTheDocument();
    });

    it('exits kiosk terminal to dashboard on Exit button click', () => {
      renderKioskPage();
      const exitBtn = screen.getByRole('button', { name: /Exit Kiosk/i });
      fireEvent.click(exitBtn);
      expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
    });
  });

  describe('Athletes Directory & Roster Management (/members)', () => {
    const renderMembersPage = () =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MembersPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

    it('filters athletes by status segment (ACTIVE, EXPIRING, FROZEN, ALL)', () => {
      renderMembersPage();
      expect(screen.getByText('Aria Sterling')).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Taylor Adams')).toBeInTheDocument();

      // Click FROZEN segment
      const frozenBtn = screen.getByRole('button', { name: /^FROZEN$/i });
      fireEvent.click(frozenBtn);

      expect(screen.getByText('Taylor Adams')).toBeInTheDocument();
      expect(screen.queryByText('Aria Sterling')).not.toBeInTheDocument();
      expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument();

      // Click EXPIRING segment
      const expiringBtn = screen.getByRole('button', { name: /^EXPIRING$/i });
      fireEvent.click(expiringBtn);

      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.queryByText('Taylor Adams')).not.toBeInTheDocument();

      // Click ALL
      fireEvent.click(screen.getByRole('button', { name: /^ALL$/i }));
      expect(screen.getByText('Aria Sterling')).toBeInTheDocument();
      expect(screen.getByText('Taylor Adams')).toBeInTheDocument();
    });

    it('searches athletes in real time by name, member number, trainer, or diet plan', () => {
      renderMembersPage();
      const searchInput = screen.getByPlaceholderText(/Search athlete, RFID, member ID/i);

      // Search by member number
      fireEvent.change(searchInput, { target: { value: 'KF-0001' } });
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.queryByText('Aria Sterling')).not.toBeInTheDocument();

      // Search with whitespace and case insensitivity
      fireEvent.change(searchInput, { target: { value: '   aRiA   ' } });
      expect(screen.getByText('Aria Sterling')).toBeInTheDocument();
      expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText('Aria Sterling')).toBeInTheDocument();
    });

    it('enrolls a new athlete via modal and immediately updates table', () => {
      renderMembersPage();
      const registerBtn = screen.getByRole('button', { name: /\+ Register Athlete/i });
      fireEvent.click(registerBtn);

      expect(screen.getByText('Register New Athlete')).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/Athlete Full Name/i);
      fireEvent.change(nameInput, { target: { value: 'Natasha Romanova' } });

      const completeBtn = screen.getByRole('button', { name: /Complete Enrollment/i });
      fireEvent.click(completeBtn);

      // Verify modal closes and new athlete is displayed in table
      expect(screen.queryByText('Register New Athlete')).not.toBeInTheDocument();
      expect(screen.getByText('Natasha Romanova')).toBeInTheDocument();
    });
  });

  describe('Class Schedule & Studio Allocation (/schedule)', () => {
    const renderSchedulePage = () =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <SchedulePage />
          </MemoryRouter>
        </QueryClientProvider>
      );

    it('filters class timetable by studio allocation', () => {
      renderSchedulePage();
      expect(screen.getByText('MetCon Savage Circuit')).toBeInTheDocument();
      expect(screen.getByText('Power Vinyasa Flow')).toBeInTheDocument();
      expect(screen.getByText('Rhythm Spin 45')).toBeInTheDocument();

      // Filter to Yoga Studio
      fireEvent.click(screen.getByRole('button', { name: /Studio 2 Yoga/i }));
      expect(screen.getByText('Power Vinyasa Flow')).toBeInTheDocument();
      expect(screen.queryByText('MetCon Savage Circuit')).not.toBeInTheDocument();
      expect(screen.queryByText('Rhythm Spin 45')).not.toBeInTheDocument();

      // Filter back to ALL
      fireEvent.click(screen.getByRole('button', { name: /^ALL$/i }));
      expect(screen.getByText('MetCon Savage Circuit')).toBeInTheDocument();
      expect(screen.getByText('Power Vinyasa Flow')).toBeInTheDocument();
    });

    it('navigates schedule weeks with prev and next buttons', () => {
      renderSchedulePage();
      expect(screen.getByText(/Week 43 \(Current\)/i)).toBeInTheDocument();

      const nextWeekBtn = screen.getByLabelText('Next week');
      fireEvent.click(nextWeekBtn);
      expect(screen.getByText(/Week 44/i)).toBeInTheDocument();

      const prevWeekBtn = screen.getByLabelText('Previous week');
      fireEvent.click(prevWeekBtn);
      expect(screen.getByText(/Week 43 \(Current\)/i)).toBeInTheDocument();
    });

    it('creates a new session via Add Session modal and renders on timetable', () => {
      renderSchedulePage();
      fireEvent.click(screen.getByRole('button', { name: /\+ Add Session/i }));

      expect(screen.getByText('Schedule New Training Session')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Session Title/i), {
        target: { value: 'Elite Kettlebell Conditioning' }
      });

      fireEvent.click(screen.getByRole('button', { name: /Confirm Session/i }));

      expect(screen.queryByText('Schedule New Training Session')).not.toBeInTheDocument();
      expect(screen.getByText('Elite Kettlebell Conditioning')).toBeInTheDocument();
    });
  });

  describe('AppShell: Quick Check-in, Emergency Lockdown & Settings', () => {
    const renderAppShell = () =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <AppShell />
          </MemoryRouter>
        </QueryClientProvider>
      );

    it('renders persistent navigation items and brand elements', () => {
      renderAppShell();
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Members Directory')).toBeInTheDocument();
      expect(screen.getByText('Class Schedule')).toBeInTheDocument();
      expect(screen.getByText('Diet & Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Trainers & Staff')).toBeInTheDocument();
      expect(screen.getByText('Financials & Billing')).toBeInTheDocument();
      expect(screen.getByText('Access & Check-ins')).toBeInTheDocument();
      expect(screen.getByText('Executive Reports')).toBeInTheDocument();
      expect(screen.getByText('System & Health')).toBeInTheDocument();
    });

    it('executes Fast Check-in modal workflow', () => {
      renderAppShell();
      const checkInBtn = screen.getByRole('button', { name: /Fast Check-In/i });
      fireEvent.click(checkInBtn);

      expect(screen.getByText('Fast RFID Check-In Dispatch')).toBeInTheDocument();

      const rfidInput = screen.getByPlaceholderText(/04:A2:3F:89:C1 or KF-1082/i);
      fireEvent.change(rfidInput, { target: { value: 'TEST-RFID-001' } });

      const verifyBtn = screen.getByRole('button', { name: /Verify Access/i });
      fireEvent.click(verifyBtn);

      expect(screen.getByText(/Access Granted for RFID UID: TEST-RFID-001/i)).toBeInTheDocument();
    });

    it('engages and disengages Emergency Facility Lockdown', () => {
      renderAppShell();
      const lockdownBtn = screen.getByRole('button', { name: /Lockdown/i });
      fireEvent.click(lockdownBtn);

      expect(
        screen.getByText(/CRITICAL: EMERGENCY FACILITY LOCKDOWN ENGAGED/i)
      ).toBeInTheDocument();

      const releaseBtn = screen.getByRole('button', { name: /Release Lockdown/i });
      fireEvent.click(releaseBtn);

      expect(
        screen.queryByText(/CRITICAL: EMERGENCY FACILITY LOCKDOWN ENGAGED/i)
      ).not.toBeInTheDocument();
    });

    it('opens Settings Modal and allows switching configuration tabs', () => {
      renderAppShell();
      const settingsBtn = screen.getByRole('button', { name: /Open Settings & Terminal Security/i });
      fireEvent.click(settingsBtn);

      expect(screen.getAllByText('Marcus Vance').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('OPS DIRECTOR').length).toBeGreaterThanOrEqual(2);

      // Switch to System & Theme tab
      const themeTab = screen.getByRole('button', { name: /System & Theme/i });
      fireEvent.click(themeTab);
      expect(screen.getByText(/Kinetic Volt/i)).toBeInTheDocument();

      // Switch to Operational Permissions tab
      const permissionsTab = screen.getByRole('button', { name: /Operational Permissions/i });
      fireEvent.click(permissionsTab);
      expect(screen.getByText(/Role × Capability Matrix/i)).toBeInTheDocument();

      // Switch to Audit & Sessions tab
      const auditTab = screen.getByRole('button', { name: /Audit & Sessions/i });
      fireEvent.click(auditTab);
      expect(screen.getByText(/Immutable SHA256 Hash-Chained Audit Trail/i)).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close settings/i });
      fireEvent.click(closeBtn);
      expect(screen.getAllByText('OPS DIRECTOR').length).toBe(1);
    });
  });

  describe('Routing & 404 Catch-All Handler', () => {
    it('renders on-brand 404 page for nonexistent routes', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/nonexistent-route-xyz-404']}>
            <AppRoutes />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText(/Error Code 404 • Resource Not Found/i)).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Return to Executive Dashboard/i })
      ).toBeInTheDocument();
    });
  });
});
