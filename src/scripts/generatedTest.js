import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [{"duration":"10s","target":5}],
      gracefulRampDown: '5s'
    }
  },
  thresholds: {"http_req_duration":["p(95)<500"],"http_req_failed":["rate<0.01"]}
};

export default function() {
  const headers = {"Content-Type":"application/json"};
  const response = http.get('http://test.k6.io', { headers });

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}