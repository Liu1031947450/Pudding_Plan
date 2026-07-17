const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
  throw new Error('生产环境必须配置 CORS_ORIGINS');
}

const allowAll = configuredOrigins.length === 0;

module.exports = {
  expressOrigin: allowAll
    ? '*'
    : (origin, callback) => {
        if (!origin || configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('请求来源不在 CORS 白名单中'));
      },
  socketOrigin: allowAll ? '*' : configuredOrigins,
};
