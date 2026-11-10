import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../observability/grafana/dashboards');
fs.mkdirSync(outDir, { recursive: true });

function createDashboard(title, uid, panels) {
  return {
    annotations: { list: [] },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 1,
    id: null,
    links: [],
    liveNow: false,
    panels: panels.map((p, idx) => ({
      ...p,
      id: idx + 1,
      gridPos: {
        h: p.h || 8,
        w: p.w || 12,
        x: (idx % 2) * 12,
        y: Math.floor(idx / 2) * 8
      }
    })),
    refresh: '10s',
    schemaVersion: 38,
    style: 'dark',
    tags: ['kineticfit', 'production'],
    templating: { list: [] },
    time: { from: 'now-1h', to: 'now' },
    timepicker: {},
    timezone: 'browser',
    title,
    uid,
    version: 1
  };
}

const dashboards = {
  'api-golden-signals.json': createDashboard('API Golden Signals', 'kf-api-golden-signals', [
    { title: 'Request Rate (req/sec)', type: 'timeseries', targets: [{ expr: 'sum(rate(http_requests_total[1m])) by (service)' }] },
    { title: 'HTTP Error Rate (5xx %)', type: 'timeseries', targets: [{ expr: 'sum(rate(http_requests_total{status=~"5.."}[1m])) / sum(rate(http_requests_total[1m])) * 100' }] },
    { title: 'Latency (p50, p95, p99 ms)', type: 'timeseries', targets: [{ expr: 'histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket[1m])) by (le))' }] },
    { title: 'CPU & Memory Saturation', type: 'timeseries', targets: [{ expr: 'sum(container_cpu_usage_seconds_total{namespace="kineticfit"}) by (pod)' }] }
  ]),
  'edge-nginx-kong.json': createDashboard('Edge / Nginx & Kong Gateway', 'kf-edge-nginx-kong', [
    { title: 'Kong Gateway Ingress Throughput', type: 'timeseries', targets: [{ expr: 'sum(rate(kong_http_requests_total[1m])) by (route)' }] },
    { title: 'Nginx Edge Upstream Latency', type: 'timeseries', targets: [{ expr: 'nginx_upstream_response_msec' }] },
    { title: 'Rate Limiting (429 Drops)', type: 'timeseries', targets: [{ expr: 'sum(rate(http_requests_total{status="429"}[1m]))' }] },
    { title: 'WAF ModSecurity Rule Triggers', type: 'timeseries', targets: [{ expr: 'sum(rate(modsecurity_blocks_total[1m])) by (rule_id)' }] }
  ]),
  'postgres-pgbouncer.json': createDashboard('PostgreSQL & PgBouncer', 'kf-postgres-pgbouncer', [
    { title: 'Active & Waiting Connections', type: 'timeseries', targets: [{ expr: 'pgbouncer_pools_active_connections' }, { expr: 'pgbouncer_pools_waiting_clients' }] },
    { title: 'Query Execution Latency (p95 ms)', type: 'timeseries', targets: [{ expr: 'pg_stat_activity_max_tx_duration' }] },
    { title: 'Transaction Throughput (tx/sec)', type: 'timeseries', targets: [{ expr: 'rate(pg_stat_database_xact_commit[1m])' }] },
    { title: 'Replication Lag (bytes)', type: 'timeseries', targets: [{ expr: 'pg_stat_replication_reply_lag' }] }
  ]),
  'redis.json': createDashboard('Redis Cache & Fencing Leases', 'kf-redis', [
    { title: 'Memory Usage vs Maxmemory', type: 'timeseries', targets: [{ expr: 'redis_memory_used_bytes' }, { expr: 'redis_memory_max_bytes' }] },
    { title: 'Cache Hit Ratio (%)', type: 'gauge', targets: [{ expr: 'rate(redis_keyspace_hits_total[1m]) / (rate(redis_keyspace_hits_total[1m]) + rate(redis_keyspace_misses_total[1m])) * 100' }] },
    { title: 'Connected Clients', type: 'timeseries', targets: [{ expr: 'redis_connected_clients' }] },
    { title: 'Operations per Second', type: 'timeseries', targets: [{ expr: 'rate(redis_commands_processed_total[1m])' }] }
  ]),
  'rabbitmq-dlq.json': createDashboard('RabbitMQ & Dead Letter Queues', 'kf-rabbitmq-dlq', [
    { title: 'Queue Depths (Messages Ready)', type: 'timeseries', targets: [{ expr: 'rabbitmq_queue_messages_ready{queue=~"kf.*"}' }] },
    { title: 'Dead Letter Queue (DLQ) Depths', type: 'timeseries', targets: [{ expr: 'rabbitmq_queue_messages_ready{queue=~".*dlq"}' }] },
    { title: 'Message Publish vs Ack Rate', type: 'timeseries', targets: [{ expr: 'rate(rabbitmq_queue_messages_published_total[1m])' }, { expr: 'rate(rabbitmq_queue_messages_delivered_total[1m])' }] },
    { title: 'Channel & Connection Count', type: 'timeseries', targets: [{ expr: 'rabbitmq_channels' }] }
  ]),
  'sagas.json': createDashboard('Distributed Sagas & Outbox', 'kf-sagas', [
    { title: 'Athlete Registration Saga Outcomes', type: 'timeseries', targets: [{ expr: 'sum(rate(saga_registration_total[5m])) by (status)' }] },
    { title: 'Booking Concurrency Saga Throughput', type: 'timeseries', targets: [{ expr: 'sum(rate(saga_booking_total[5m])) by (outcome)' }] },
    { title: 'Reverse Compensations Triggered', type: 'timeseries', targets: [{ expr: 'sum(rate(saga_compensation_total[5m])) by (saga)' }] },
    { title: 'Transactional Outbox Pending Rows', type: 'gauge', targets: [{ expr: 'outbox_pending_messages_count' }] }
  ]),
  'realtime-connections.json': createDashboard('Realtime & Turnstile WebSockets', 'kf-realtime', [
    { title: 'Active Turnstile WebSocket Connections', type: 'timeseries', targets: [{ expr: 'sum(websocket_active_connections{service="access-service"})' }] },
    { title: 'SSE Live Subscriber Channels', type: 'timeseries', targets: [{ expr: 'sum(sse_active_subscribers)' }] },
    { title: 'Turnstile Badge Scans (taps/min)', type: 'timeseries', targets: [{ expr: 'sum(rate(turnstile_scans_total[1m])) * 60' }] },
    { title: 'WebSocket Frame Drop Rate (Backpressure)', type: 'timeseries', targets: [{ expr: 'sum(rate(websocket_dropped_frames_total[1m]))' }] }
  ]),
  'node-runtime.json': createDashboard('Node.js V8 Runtime & GC', 'kf-node-runtime', [
    { title: 'V8 Heap Used vs Heap Total', type: 'timeseries', targets: [{ expr: 'nodejs_heap_size_used_bytes' }, { expr: 'nodejs_heap_size_total_bytes' }] },
    { title: 'Event Loop Lag (p99 ms)', type: 'timeseries', targets: [{ expr: 'nodejs_eventloop_lag_p99_seconds * 1000' }] },
    { title: 'Garbage Collection Pause Duration (ms)', type: 'timeseries', targets: [{ expr: 'rate(nodejs_gc_duration_seconds_sum[1m]) * 1000' }] },
    { title: 'Active Handles & Requests', type: 'timeseries', targets: [{ expr: 'nodejs_active_handles' }] }
  ]),
  'deployment-canary.json': createDashboard('Deployment & Canary Analysis', 'kf-deployment-canary', [
    { title: 'Traffic Routing Weight (Canary %)', type: 'gauge', targets: [{ expr: 'argo_rollouts_canary_weight{rollout="scheduling-service-rollout"}' }] },
    { title: 'Canary vs Baseline Error Rate', type: 'timeseries', targets: [{ expr: 'sum(rate(http_requests_total{service="scheduling-service", status=~"5.."}[1m])) by (revision)' }] },
    { title: 'Canary p99 Latency vs Threshold (500ms)', type: 'timeseries', targets: [{ expr: 'histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket{service="scheduling-service"}[1m])) by (le, revision))' }] },
    { title: 'Automated Rollback Triggers', type: 'timeseries', targets: [{ expr: 'sum(argo_rollouts_abort_total)' }] }
  ]),
  'slo-error-budget.json': createDashboard('SLO & Multi-Burn-Rate Error Budgets', 'kf-slo-error-budget', [
    { title: 'API Availability (99.9% SLO Target)', type: 'gauge', targets: [{ expr: 'sum(rate(http_requests_total{status!~"5.."}[30d])) / sum(rate(http_requests_total[30d])) * 100' }] },
    { title: '30-Day Error Budget Remaining (%)', type: 'gauge', targets: [{ expr: '(1 - (sum(rate(http_requests_total{status=~"5.."}[30d])) / (sum(rate(http_requests_total[30d])) * 0.001))) * 100' }] },
    { title: 'Multi-Window Burn Rate (14.4x / 6x / 1x)', type: 'timeseries', targets: [{ expr: 'slo_burn_rate_1h' }, { expr: 'slo_burn_rate_6h' }] },
    { title: 'Check-in Decision Latency SLO (p99 < 150ms)', type: 'gauge', targets: [{ expr: 'histogram_quantile(0.99, sum(rate(checkin_decision_duration_ms_bucket[30d])) by (le))' }] }
  ]),
  'business-kpi.json': createDashboard('KineticFit Business KPIs', 'kf-business-kpi', [
    { title: 'Gym Floor Check-ins / Hour', type: 'timeseries', targets: [{ expr: 'sum(rate(gym_checkins_total[1h])) * 3600' }] },
    { title: 'Studio Class Bookings / Hour', type: 'timeseries', targets: [{ expr: 'sum(rate(class_bookings_total[1h])) * 3600' }] },
    { title: 'Payment Webhook Processing Success Rate (%)', type: 'gauge', targets: [{ expr: 'sum(rate(payment_webhooks_processed_total{status="SUCCESS"}[1h])) / sum(rate(payment_webhooks_processed_total[1h])) * 100' }] },
    { title: 'Active Floor Occupancy by Hub', type: 'barchart', targets: [{ expr: 'gym_current_occupancy' }] }
  ])
};

for (const [filename, content] of Object.entries(dashboards)) {
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(content, null, 2));
  console.log(`Generated dashboard: ${filename}`);
}

console.log('All 11 Grafana dashboards successfully created.');
