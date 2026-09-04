const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimit } = require('../src/middleware/rateLimit');

test('rate limiter blocks requests after the configured maximum', () => {
  const middleware = createRateLimit({
    windowMs: 60000,
    max: 2,
    key: req => req.ip,
  });
  const req = { ip: '127.0.0.1' };
  let nextCalls = 0;
  let statusCode;
  let responseBody;
  const res = {
    set() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return body;
    },
  };

  middleware(req, res, () => nextCalls++);
  middleware(req, res, () => nextCalls++);
  middleware(req, res, () => nextCalls++);

  assert.equal(nextCalls, 2);
  assert.equal(statusCode, 429);
  assert.deepEqual(responseBody, {
    success: false,
    data: null,
    message: '',
    error: '尝试次数过多，请稍后再试',
  });
});
