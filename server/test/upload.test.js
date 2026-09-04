const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const multer = require('multer');
const {
  validateImage,
  handleUploadError,
} = require('../src/middleware/upload');
const { isOwnedUpload } = require('../src/utils/files');

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return body;
  },
});

test('image validation rejects spoofed files and removes them', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pudding-upload-'));
  const filename = path.join(directory, 'fake.jpg');
  fs.writeFileSync(filename, 'not an image');
  const res = response();

  await validateImage({ file: { path: filename } }, res, () => {
    throw new Error('invalid file should not reach next middleware');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.data, null);
  assert.equal(fs.existsSync(filename), false);
  fs.rmSync(directory, { recursive: true, force: true });
});

test('upload size errors use the shared response contract', () => {
  const res = response();
  handleUploadError(new multer.MulterError('LIMIT_FILE_SIZE'), {}, res, () => {
    throw new Error('size error should not reach next middleware');
  });
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    data: null,
    message: '',
    error: '图片大小超过限制',
  });
});

test('uploaded files are scoped to the authenticated user', () => {
  assert.equal(isOwnedUpload('/uploads/user-1-file.jpeg', 'user-1'), true);
  assert.equal(isOwnedUpload('/uploads/user-2-file.jpeg', 'user-1'), false);
  assert.equal(isOwnedUpload('/uploads/../user-1-file.jpeg', 'user-1'), false);
});
