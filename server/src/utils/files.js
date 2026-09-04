const fs = require('fs/promises');
const path = require('path');
const { UPLOAD_DIR } = require('../middleware/upload');

const getUploadFilename = value => {
  if (typeof value !== 'string' || !value.startsWith('/uploads/')) return null;
  const filename = path.basename(value);
  return filename === value.slice('/uploads/'.length) ? filename : null;
};

const isOwnedUpload = (value, userId) => {
  const filename = getUploadFilename(value);
  return Boolean(filename && filename.startsWith(`${userId}-`));
};

const uploadedFilesExist = async values => {
  const filenames = values.map(getUploadFilename);
  if (filenames.some(filename => !filename)) return false;
  const results = await Promise.all(
    filenames.map(filename =>
      fs
        .access(path.join(UPLOAD_DIR, filename))
        .then(() => true)
        .catch(() => false),
    ),
  );
  return results.every(Boolean);
};

const deleteUploadedFiles = async values => {
  const filenames = [...new Set(values.map(getUploadFilename).filter(Boolean))];
  await Promise.all(
    filenames.map(filename =>
      fs.unlink(path.join(UPLOAD_DIR, filename)).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      }),
    ),
  );
};

module.exports = {
  deleteUploadedFiles,
  getUploadFilename,
  isOwnedUpload,
  uploadedFilesExist,
};
