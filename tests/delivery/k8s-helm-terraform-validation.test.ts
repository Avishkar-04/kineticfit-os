import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

describe('Gate 7: Kubernetes, Helm, Argo Rollouts, Terraform & CI Validation Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');

  const parseAllYaml = (content: string): any[] => {
    return YAML.parseAllDocuments(content).map((doc) => doc.toJSON());
  };

  const parseYaml = (content: string): any => {
    return YAML.parse(content);
  };

  describe('1. Kubernetes Base & Overlays Manifests', () => {
    const k8sBaseDir = path.join(rootDir, 'deploy/k8s/base');

    it('successfully parses all base Kubernetes YAML manifests', () => {
      const files = fs.readdirSync(k8sBaseDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
      expect(files.length).toBeGreaterThanOrEqual(10);

      for (const file of files) {
        const content = fs.readFileSync(path.join(k8sBaseDir, file), 'utf-8');
        const docs = parseAllYaml(content);
        expect(docs.length).toBeGreaterThan(0);
        for (const doc of docs) {
          if (doc) {
            expect(doc).toHaveProperty('apiVersion');
            expect(doc).toHaveProperty('kind');
            if (doc.kind !== 'Kustomization') {
              expect(doc).toHaveProperty('metadata');
            }
          }
        }
      }
    });

    it('enforces hardened Pod Security Standards on microservices', () => {
      const services = [
        'auth-service.yaml',
        'member-service.yaml',
        'scheduling-service.yaml',
        'access-service.yaml',
        'nutrition-service.yaml',
        'billing-service.yaml'
      ];

      for (const svcFile of services) {
        const content = fs.readFileSync(path.join(k8sBaseDir, svcFile), 'utf-8');
        const docs = parseAllYaml(content);
        const deployment = docs.find((d) => d && d.kind === 'Deployment');

        expect(deployment).toBeDefined();
        const podSpec = deployment.spec.template.spec;

        // Non-root security context
        expect(podSpec.securityContext.runAsNonRoot).toBe(true);
        expect(podSpec.securityContext.runAsUser).toBe(10001);

        const container = podSpec.containers[0];
        expect(container.securityContext.allowPrivilegeEscalation).toBe(false);
        expect(container.securityContext.readOnlyRootFilesystem).toBe(true);
        expect(container.securityContext.capabilities.drop).toContain('ALL');

        // Health probes
        expect(container.livenessProbe.httpGet.path).toBe('/health/live');
        expect(container.readinessProbe.httpGet.path).toBe('/health/ready');
        expect(container.startupProbe.httpGet.path).toBe('/health/startup');

        // Resource requests & limits
        expect(container.resources.requests.cpu).toBeDefined();
        expect(container.resources.limits.cpu).toBeDefined();
      }
    });

    it('validates KEDA ScaledObjects and PodDisruptionBudgets', () => {
      const kedaContent = fs.readFileSync(path.join(k8sBaseDir, 'keda.yaml'), 'utf-8');
      const kedaDocs = parseAllYaml(kedaContent);
      const scaledObjects = kedaDocs.filter((d) => d && d.kind === 'ScaledObject');
      expect(scaledObjects.length).toBeGreaterThanOrEqual(2);

      const pdbContent = fs.readFileSync(path.join(k8sBaseDir, 'pdb.yaml'), 'utf-8');
      const pdbDocs = parseAllYaml(pdbContent);
      expect(pdbDocs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('2. Helm Chart & Schema Validation', () => {
    const helmDir = path.join(rootDir, 'deploy/helm/kineticfit');

    it('parses Chart.yaml and values.yaml', () => {
      const chartYaml = parseYaml(fs.readFileSync(path.join(helmDir, 'Chart.yaml'), 'utf-8'));
      expect(chartYaml.name).toBe('kineticfit');
      expect(chartYaml.version).toBe('1.0.0');

      const valuesYaml = parseYaml(fs.readFileSync(path.join(helmDir, 'values.yaml'), 'utf-8'));
      expect(valuesYaml.global.environment).toBe('production');
      expect(valuesYaml.services.auth).toBeDefined();
      expect(valuesYaml.services.scheduling).toBeDefined();
    });

    it('conforms to values.schema.json', () => {
      const schema = JSON.parse(fs.readFileSync(path.join(helmDir, 'values.schema.json'), 'utf-8'));
      const values = parseYaml(fs.readFileSync(path.join(helmDir, 'values.yaml'), 'utf-8'));

      expect(schema.required).toContain('global');
      expect(schema.required).toContain('database');
      expect(schema.required).toContain('services');

      expect(values.global.environment).toBeDefined();
      expect(values.database.host).toBeDefined();
      expect(values.database.port).toBe(5432);
    });

    it('contains all required template definitions', () => {
      const templatesDir = path.join(helmDir, 'templates');
      const templates = fs.readdirSync(templatesDir);

      expect(templates).toContain('_helpers.tpl');
      expect(templates).toContain('deployments.yaml');
      expect(templates).toContain('services.yaml');
      expect(templates).toContain('ingress.yaml');
      expect(templates).toContain('hpa.yaml');
      expect(templates).toContain('keda.yaml');
      expect(templates).toContain('pdb.yaml');
      expect(templates).toContain('networkpolicies.yaml');
    });
  });

  describe('3. Argo Rollouts Progressive Delivery', () => {
    const argoDir = path.join(rootDir, 'deploy/argo');

    it('validates Blue-Green Rollout structure', () => {
      const bgContent = fs.readFileSync(path.join(argoDir, 'blue-green.yaml'), 'utf-8');
      const docs = parseAllYaml(bgContent);
      const rollouts = docs.filter((d) => d && d.kind === 'Rollout');

      expect(rollouts.length).toBeGreaterThanOrEqual(2);
      const billing = rollouts.find((r) => r.metadata.name === 'billing-service-rollout');
      expect(billing.spec.strategy.blueGreen.activeService).toBe('billing-service');
      expect(billing.spec.strategy.blueGreen.previewService).toBe('billing-service-preview');
      expect(billing.spec.strategy.blueGreen.autoPromotionEnabled).toBe(false);
    });

    it('validates Canary Rollout with progressive traffic steps', () => {
      const canaryContent = fs.readFileSync(path.join(argoDir, 'canary.yaml'), 'utf-8');
      const docs = parseAllYaml(canaryContent);
      const rollout = docs.find((d) => d && d.kind === 'Rollout');

      expect(rollout).toBeDefined();
      expect(rollout.spec.strategy.canary).toBeDefined();
      const steps = rollout.spec.strategy.canary.steps;
      expect(steps[0].setWeight).toBe(5);
      expect(steps[1].pause.duration).toBe('2m');
      expect(steps[2].setWeight).toBe(25);
      expect(steps[4].setWeight).toBe(50);
      expect(steps[6].setWeight).toBe(100);
    });

    it('validates Prometheus AnalysisTemplate metrics', () => {
      const templateContent = fs.readFileSync(path.join(argoDir, 'analysis-template.yaml'), 'utf-8');
      const doc = parseYaml(templateContent);

      expect(doc.kind).toBe('AnalysisTemplate');
      const metrics = doc.spec.metrics;
      const successRate = metrics.find((m: any) => m.name === 'success-rate');
      const p99 = metrics.find((m: any) => m.name === 'p99-latency');

      expect(successRate.successCondition).toContain('>= 0.99');
      expect(p99.successCondition).toContain('< 500');
    });
  });

  describe('4. Terraform Modules & Cloud Architecture', () => {
    const tfDir = path.join(rootDir, 'deploy/terraform');

    it('validates kind-local applyable module', () => {
      const mainTf = fs.readFileSync(path.join(tfDir, 'modules/kind-local/main.tf'), 'utf-8');
      expect(mainTf).toContain('resource "kind_cluster"');
      expect(mainTf).toContain('resource "helm_release" "ingress_nginx"');
      expect(mainTf).toContain('resource "helm_release" "argo_rollouts"');
      expect(mainTf).toContain('resource "helm_release" "kineticfit"');
    });

    it('validates aws-reference multi-region enterprise architecture', () => {
      const mainTf = fs.readFileSync(path.join(tfDir, 'modules/aws-reference/main.tf'), 'utf-8');
      expect(mainTf).toContain('resource "aws_vpc"');
      expect(mainTf).toContain('resource "aws_eks_cluster"');
      expect(mainTf).toContain('capacity_type  = "SPOT"');
      expect(mainTf).toContain('resource "aws_rds_cluster" "aurora_primary"');
      expect(mainTf).toContain('resource "aws_elasticache_replication_group"');
      expect(mainTf).toContain('resource "aws_cloudfront_distribution"');
    });
  });

  describe('5. Hardened Multi-Stage Dockerfiles', () => {
    const dockerDir = path.join(rootDir, 'deploy/docker');

    it('validates Dockerfile.node has multi-stage non-root build and healthcheck', () => {
      const content = fs.readFileSync(path.join(dockerDir, 'Dockerfile.node'), 'utf-8');
      expect(content).toContain('FROM node:22-alpine AS base');
      expect(content).toContain('FROM base AS builder');
      expect(content).toContain('FROM node:22-alpine AS runner');
      expect(content).toContain('USER 10001:10001');
      expect(content).toContain('HEALTHCHECK');
      expect(content).toContain('dumb-init');
    });

    it('validates Dockerfile.web uses unprivileged Nginx with security headers', () => {
      const content = fs.readFileSync(path.join(dockerDir, 'Dockerfile.web'), 'utf-8');
      expect(content).toContain('FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner');
      expect(content).toContain('X-Frame-Options "DENY"');
      expect(content).toContain('X-Content-Type-Options "nosniff"');
      expect(content).toContain('USER 101:101');
    });
  });

  describe('6. GitHub Actions CI/CD Pipeline', () => {
    it('validates .github/workflows/ci.yml structure and stages', () => {
      const ciContent = fs.readFileSync(path.join(rootDir, '.github/workflows/ci.yml'), 'utf-8');
      const ci = parseYaml(ciContent);

      expect(ci.jobs['static-analysis-and-unit']).toBeDefined();
      expect(ci.jobs['iac-validation']).toBeDefined();
      expect(ci.jobs['container-build']).toBeDefined();
      expect(ci.jobs['e2e-and-smoke']).toBeDefined();
      expect(ci.jobs['progressive-delivery']).toBeDefined();
    });
  });
});
