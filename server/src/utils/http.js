const send = (res, status, success, data = null, message = '', error = null) =>
  res.status(status).json({ success, data, message, error });

const ok = (res, data = null, message = '操作成功', status = 200) =>
  send(res, status, true, data, message, null);

const fail = (res, status, error, data = null) =>
  send(res, status, false, data, '', error);

module.exports = { send, ok, fail };
