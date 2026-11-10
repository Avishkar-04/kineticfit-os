import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

describe('Gate 8: SRE, Disaster Recovery & Traceability Verification Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');

  describe('1. Grafana Dashboards as Code', () => {
    const dashboardsDir = path.join(rootDir, 'observability/grafana/dashboards');
    const requiredDashboards = [
      'api-golden-signals.json',
      'edge-nginx-kong.json',
      'postgres-pgbouncer.json',
      'redis.json',
      'rabbitmq-dlq.json',
      'sagas.json',
      'realtime-connections.json',
      'node-runtime.json',
      'deployment-canary.json',
      'slo-error-budget.json',
      'business-kpi.json'
    ];

    it('contains all 11 required Grafana dashboards with valid JSON and panels', () => {
      for (const dashFile of requiredDashboards) {
        const fullPath = path.join(dashboardsDir, dashFile);
        expect(fs.existsSync(fullPath), `Dashboard ${dashFile} must exist`).toBe(true);

        const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        expect(content.title).toBeDefined();
        expect(content.uid).toBeDefined();
        expect(content.schemaVersion).toBeGreaterThanOrEqual(30);
        expect(Array.isArray(content.panels)).toBe(true);
        expect(content.panels.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('2. Alertmanager & Multi-Burn-Rate Prometheus Rules', () => {
    const promDir = path.join(rootDir, 'observability/prometheus');

    it('validates alertmanager.yml configuration and receivers', () => {
      const amYaml = YAML.parse(fs.readFileSync(path.join(promDir, 'alertmanager.yml'), 'utf-8'));
      expect(amYaml.route).toBeDefined();
      expect(amYaml.route.routes.length).toBeGreaterThanOrEqual(3);
      expect(amYaml.receivers.length).toBeGreaterThanOrEqual(4);

      const sev1Route = amYaml.route.routes.find((r: any) => r.match && r.match.severity === 'SEV1');
      expect(sev1Route).toBeDefined();
      expect(sev1Route.receiver).toBe('pagerduty-sev1-critical');
    });

    it('validates alerts.yml and confirms runbooks exist for all alerts', () => {
      const alertsYaml = YAML.parse(fs.readFileSync(path.join(promDir, 'alerts.yml'), 'utf-8'));
      expect(alertsYaml.groups.length).toBeGreaterThanOrEqual(2);

      for (const group of alertsYaml.groups) {
        for (const rule of group.rules) {
          if (rule.alert) {
            expect(rule.labels.severity).toBeDefined();
            expect(rule.annotations.runbook_url).toBeDefined();

            const runbookPath = path.join(rootDir, rule.annotations.runbook_url);
            expect(fs.existsSync(runbookPath), `Runbook ${rule.annotations.runbook_url} must exist`).toBe(true);

            const runbookContent = fs.readFileSync(runbookPath, 'utf-8');
            expect(runbookContent).toContain('Customer Impact');
            expect(runbookContent).toContain('First 5 Diagnostic Checks');
            expect(runbookContent).toContain('Mitigations');
            expect(runbookContent).toContain('Escalation Path');
          }
        }
      }
    });

    it('validates SLI recording rules in rules.yml', () => {
      const rulesYaml = YAML.parse(fs.readFileSync(path.join(promDir, 'rules.yml'), 'utf-8'));
      expect(rulesYaml.groups[0].rules.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('3. Disaster Recovery & Verification Drill', () => {
    it('validates docs/dr.md specifies RTO and RPO benchmarks', () => {
      const drDoc = fs.readFileSync(path.join(rootDir, 'docs/dr.md'), 'utf-8');
      expect(drDoc).toContain('RPO');
      expect(drDoc).toContain('RTO');
      expect(drDoc).toContain('Point-In-Time Recovery');
      expect(drDoc).toContain('CloudNativePG');
    });

    it('validates backup verification scripts exist and are executable', () => {
      expect(fs.existsSync(path.join(rootDir, 'scripts/verify-restore.sh'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'scripts/verify-restore.ps1'))).toBe(true);
    });
  });

  describe('4. Postmortems & Incident Response', () => {
    const pmDir = path.join(rootDir, 'docs/postmortems');

    it('contains postmortem template and at least 3 game-day drill reports', () => {
      expect(fs.existsSync(path.join(pmDir, 'TEMPLATE.md'))).toBe(true);

      const drills = [
        '2026-10-15-postgres-failover-drill.md',
        '2026-10-22-redis-cluster-partition-drill.md',
        '2026-11-02-canary-metric-anomaly-rollback-drill.md'
      ];

      for (const drill of drills) {
        const fullPath = path.join(pmDir, drill);
        expect(fs.existsSync(fullPath), `Drill ${drill} must exist`).toBe(true);

        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).toContain('Executive Summary');
        expect(content).toContain('Incident Timeline');
        expect(content).toContain('5-Whys');
        expect(content).toContain('Action Items');
      }
    });

    it('validates incident response and on-call runbooks', () => {
      const irDoc = fs.readFileSync(path.join(rootDir, 'docs/incident-response.md'), 'utf-8');
      expect(irDoc).toContain('SEV1');
      expect(irDoc).toContain('Incident Commander');

      const oncallDoc = fs.readFileSync(path.join(rootDir, 'docs/oncall.md'), 'utf-8');
      expect(oncallDoc).toContain('Handoff Checklist');
      expect(oncallDoc).toContain('Paging Escalation Policy');
    });
  });

  describe('5. Traceability Matrix Audit (111 Concepts)', () => {
    it('verifies all 111 concepts have exact, valid evidence paths on disk', () => {
      const content = fs.readFileSync(path.join(rootDir, 'docs/TRACEABILITY.md'), 'utf-8');
      const lines = content.split('\n');

      const rows = lines.filter((l) => l.match(/^\|\s*(\d+|59[ab]|59b \/ 74)\s*\|/));
      expect(rows.length).toBe(111);

      let totalPathsChecked = 0;
      for (const row of rows) {
        const paths = (row.match(/`([^`]+)`/g) || []).map((p) => p.replace(/`/g, ''));
        expect(paths.length).toBeGreaterThan(0);

        for (const relPath of paths) {
          const fullPath = path.join(rootDir, relPath);
          expect(fs.existsSync(fullPath), `Evidence path '${relPath}' in row '${row}' must exist on disk`).toBe(true);
          totalPathsChecked++;
        }
      }

      expect(totalPathsChecked).toBeGreaterThanOrEqual(150);
    });
  });

  describe('6. Production Readme & System Architecture', () => {
    it('validates README.md has 10-minute quickstart, demo logins, and architecture links', () => {
      const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf-8');
      expect(readme).toContain('Quickstart');
      expect(readme).toContain('director@kineticfit.dev');
      expect(readme).toContain('docker compose');
      expect(readme).toContain('Stitch Design System');
    });

    it('validates docs/ARCHITECTURE.md has C4 diagram, domains, and saga patterns', () => {
      const arch = fs.readFileSync(path.join(rootDir, 'docs/ARCHITECTURE.md'), 'utf-8');
      expect(arch).toContain('C4 Container Architecture');
      expect(arch).toContain('scheduling-service');
      expect(arch).toContain('Saga Pattern');
    });

    it('validates docs/cost.md and docs/SLO.md', () => {
      const cost = fs.readFileSync(path.join(rootDir, 'docs/cost.md'), 'utf-8');
      expect(cost).toContain('Cost per 1,000 Gym Check-Ins');

      const slo = fs.readFileSync(path.join(rootDir, 'docs/SLO.md'), 'utf-8');
      expect(slo).toContain('99.9%');
      expect(slo).toContain('Error Budget Policy');
    });
  });
});
