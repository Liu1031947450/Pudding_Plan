const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const FileType = require('file-type');
const { v4: uuidv4 } = require('uuid');
const { fail } = require('../utils/http');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${uuidv4()}`);
  },
});

const createUpload = fileSize => multer({ storage, limits: { fileSize } });
const uploadMoment = createUpload(5 * 1024 * 1024);
const uploadAvatar = createUpload(2 * 1024 * 1024);

const validateImage = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const type = await FileType.fromFile(req.file.path);
    if (
      !type ||
      !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
        type.mime,
      )
    ) {
      await fsPromises.unlink(req.file.path).catch(() => {});
      return fail(res, 400, '文件内容不是支持的图片格式');
    }
    const extension = type.ext === 'jpg' ? 'jpeg' : type.ext;
    const filename = `${req.file.filename}.${extension}`;
    const nextPath = path.join(UPLOAD_DIR, filename);
    await fsPromises.rename(req.file.path, nextPath);
    req.file.filename = filename;
    req.file.path = nextPath;
    next();
  } catch (error) {
    await fsPromises.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

const handleUploadError = (error, _req, res, next) => {
  if (!error) return next();
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 400, '图片大小超过限制');
  }
  return next(error);
};

const getFileUrl = (_req, filename) => `/uploads/${filename}`;

module.exports = {
  upload: uploadMoment,
  uploadMoment,
  uploadAvatar,
  validateImage,
  handleUploadError,
  getFileUrl,
  UPLOAD_DIR,
};
