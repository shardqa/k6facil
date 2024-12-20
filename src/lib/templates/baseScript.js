// src/lib/templates/baseScript.js
export const baseTemplate = `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      startVUs: {{startVUs}},
      stages: {{{stages}}},
      gracefulRampDown: '5s'
    }
  },
  thresholds: {{{thresholds}}}
};

export default function() {
  const headers = {{{headers}}};
  {{#if (eq method "get")}}
  const response = http.{{method}}('{{url}}', { headers });
  {{else}}
  const payload = {{{body}}};
  const response = http.{{method}}('{{url}}', payload, { headers });
  {{/if}}

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}`;
