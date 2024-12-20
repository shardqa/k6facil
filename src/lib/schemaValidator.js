// src/lib/schemaValidator.js
const loadTestSchema = {
  type: 'object',
  required: ['endpoint', 'loadTest'],
  properties: {
    endpoint: {
      type: 'object',
      required: ['url', 'method'],
      properties: {
        url: { type: 'string' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        headers: { type: 'object' },
        body: { type: 'object' }
      }
    },
    loadTest: {
      type: 'object',
      required: ['startVUs', 'maxVUs'],
      properties: {
        startVUs: { type: 'number', minimum: 1 },
        maxVUs: { type: 'number', minimum: 1 },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            required: ['duration', 'target'],
            properties: {
              duration: { type: 'string', pattern: '^\\d+[smh]$' },
              target: { type: 'number', minimum: 0 }
            }
          }
        },
        thresholds: { type: 'object' }
      }
    }
  }
};

export { loadTestSchema };
