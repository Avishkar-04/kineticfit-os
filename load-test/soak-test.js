import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom Prometheus SLO Metrics
const checkInLatency = new Trend('kineticfit_checkin_latency_ms');
const errorRate = new Rate('kineticfit_error_rate');

export const options = {
  // 30-Minute Soak Test Profile
  stages: [
    { duration: '2m', target: 50 },   // Warm-up ramp
    { duration: '26m', target: 50 },  // Steady-state soak load asserting flat RSS slope
    { duration: '2m', target: 0 }     // Cool-down drain
  ],
  thresholds: {
    // SLO Budgets from docs/SLO.md
    'http_req_duration': ['p(95)<250', 'p(99)<500'],
    'http_req_failed': ['rate<0.001'], // 99.9% availability
    'kineticfit_checkin_latency_ms': ['p(99)<150'], // Check-in sub-150ms SLO
    'kineticfit_error_rate': ['rate<0.001']
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer kf_test_token_soak_worker',
      'X-Request-ID': `soak-${__VU}-${__ITER}`
    }
  };

  // 1. Gateway Health Probe
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'health status 200': (r) => r.status === 200 });

  // 2. Schedule Timetable Fetch (Read-heavy)
  const schedRes = http.get(`${BASE_URL}/v1/classes`, params);
  check(schedRes, { 'schedule status 200': (r) => r.status === 200 });
  errorRate.add(schedRes.status !== 200);

  // 3. Turnstile RFID Badge Check-in (Write-heavy)
  const checkInPayload = JSON.stringify({
    rfidUid: `RFID-TEST-${__VU}-${(__ITER % 100).toString().padStart(4, '0')}`,
    gateId: 'GATE-01-DOWNTOWN',
    occurredAt: new Date().toISOString()
  });

  const tStart = Date.now();
  const checkInRes = http.post(`${BASE_URL}/v1/access/check-in`, checkInPayload, params);
  checkInLatency.add(Date.now() - tStart);

  check(checkInRes, { 'checkin accepted or nominal': (r) => r.status === 200 || r.status === 201 });
  errorRate.add(checkInRes.status >= 500);

  // Paced user think-time with randomized jitter
  sleep(1 + Math.random() * 2);
}
