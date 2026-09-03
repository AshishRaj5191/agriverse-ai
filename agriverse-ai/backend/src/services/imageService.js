const cloudinary = require('./cloudinaryService');
const ApiError = require('../utils/ApiError');

const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadImage(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        allowed_formats: ALLOWED_FORMATS,
        folder: 'agriverse_ai/farm_records',
        public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result && result.result === 'ok') {
      return true;
    }
    if (result && result.result === 'not found') {
      return true;
    }
    throw new Error(result && result.result ? result.result : 'Cloudinary delete failed.');
  } catch (error) {
    console.error('[Cloudinary] Delete failed:', error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  ALLOWED_FORMATS,
  MAX_FILE_SIZE,
};
