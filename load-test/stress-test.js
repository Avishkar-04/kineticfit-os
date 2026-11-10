import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const stressDuration = new Trend('stress_req_duration_ms');
const stressErrors = new Rate('stress_errors');

export const options = {
  // Peak Hour Burst Stress Test (0 -> 100 -> 250 VUs)
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 150 },
    { duration: '2m', target: 250 }, // 250 concurrent VUs simulating evening gym rush
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400', 'p(99)<800'],
    'stress_errors': ['rate<0.01'] // 99% success under extreme stress
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'X-Request-ID': `stress-${__VU}-${__ITER}`
  };

  // Turnstile checkin burst
  const payload = JSON.stringify({
    rfidUid: `RFID-BURST-${__VU}-${__ITER}`,
    gateId: 'GATE-02-DOWNTOWN',
    occurredAt: new Date().toISOString()
  });

  const res = http.post(`${BASE_URL}/v1/access/check-in`, payload, { headers });
  check(res, {
    'status is 2xx or 429 rate-limited': (r) => (r.status >= 200 && r.status < 300) || r.status === 429
  });

  stressErrors.add(res.status >= 500);
  sleep(0.1 + Math.random() * 0.2);
}

