import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell.js';
import { AuthPage } from './components/auth/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { MembersPage } from './pages/MembersPage.js';
import { SchedulePage } from './pages/SchedulePage.js';
import { NutritionPage } from './pages/NutritionPage.js';
import { StaffPage } from './pages/StaffPage.js';
import { BillingPage } from './pages/BillingPage.js';
import { AccessPage } from './pages/AccessPage.js';
import { SystemPage } from './pages/SystemPage.js';
import { KioskPage } from './pages/KioskPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { MemberPortalPage } from './pages/member/MemberPortalPage.js';
import { CoachWorkspacePage } from './pages/coach/CoachWorkspacePage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { AnnouncementsPage } from './pages/AnnouncementsPage.js';
import { FacilitiesPage } from './pages/FacilitiesPage.js';
import { Button } from '@kineticfit/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-kf-bg text-kf-text flex flex-col items-center justify-center p-6 text-center select-none font-body">
    <div className="font-mono text-xs text-kf-danger uppercase tracking-widest font-bold mb-2">
      Error Code 404 • Resource Not Found
    </div>
    <h1 className="font-display font-black text-6xl text-white tracking-tight mb-2">404</h1>
    <p className="font-body text-sm text-kf-text-steel max-w-md mb-6">
      The telemetry node, member record, or operational view you requested does not exist on this cluster.
    </p>
    <Link to="/dashboard">
      <Button variant="primary">Return to Executive Dashboard</Button>
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Site */}
          <Route path="/" element={<LandingPage />} />

          {/* Standalone Auth & Kiosk Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/kiosk" element={<KioskPage />} />

          {/* Member Self-Service PWA Portal */}
          <Route path="/me/*" element={<MemberPortalPage />} />
          <Route path="/me" element={<MemberPortalPage />} />

          {/* Trainer Workspace */}
          <Route path="/coach/*" element={<CoachWorkspacePage />} />
          <Route path="/coach" element={<CoachWorkspacePage />} />

          {/* Authenticated Staff / Director App Shell */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/access" element={<AccessPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/system" element={<SystemPage />} />
          </Route>

          {/* Catch-all on-brand 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
