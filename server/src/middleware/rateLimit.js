const { fail } = require('../utils/http');

const createRateLimit = ({ windowMs, max, key }) => {
  const attempts = new Map();

  return (req, res, next) => {
    const now = Date.now();
    if (attempts.size > 10000) {
      for (const [attemptKey, value] of attempts) {
        if (value.resetAt <= now) attempts.delete(attemptKey);
      }
    }

    const attemptKey = key(req);
    const current = attempts.get(attemptKey);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;

    if (entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return fail(res, 429, '尝试次数过多，请稍后再试');
    }

    entry.count += 1;
    attempts.set(attemptKey, entry);
    next();
  };
};

module.exports = { createRateLimit };
