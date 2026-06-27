const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - file buffer from multer memoryStorage
 * @param {object} opts   - cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<string>} secure_url of the uploaded asset
 */
function uploadToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by its public_id.
 * The public_id is the path portion of the URL after /upload/v.../
 * We derive it from the stored URL.
 */
async function deleteFromCloudinary(url) {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    // Extract public_id: everything between /upload/v<version>/ and the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch (err) {
    console.warn('Failed to delete from Cloudinary:', err.message);
  }
}

const isConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET);

module.exports = { uploadToCloudinary, deleteFromCloudinary, isConfigured };
