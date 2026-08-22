const fs = require("fs");
const path = require("path");

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

console.log("[STORAGE] Using local document storage:", LOCAL_UPLOAD_DIR);

/**
 * Uploads a file buffer to local VPS storage.
 * @param {Buffer} fileBuffer
 * @param {string} storagePath - E.g. "bookings/bookingId/passengerId/filename.pdf"
 * @param {string} _mimeType
 * @returns {Promise<{ storagePath: string, mode: 'local' }>}
 */
async function uploadFile(fileBuffer, storagePath, _mimeType) {
  try {
    const fullLocalPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
    const parentDir = path.dirname(fullLocalPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(fullLocalPath, fileBuffer);
    console.log("[STORAGE] ✅ Local upload successful:", storagePath);
    return { storagePath, mode: "local" };
  } catch (err) {
    console.error("[STORAGE] ❌ Local upload failed:", err.message);
    throw new Error("Document storage failed. Please retry later.");
  }
}

/**
 * Downloads a file from local storage, returning a buffer.
 * @param {string} storagePath
 * @returns {Promise<{ buffer: Buffer }>}
 */
async function downloadFile(storagePath) {
  const fullLocalPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
  if (fs.existsSync(fullLocalPath)) {
    console.log("[STORAGE] Retrieving file from local storage:", storagePath);
    const buffer = fs.readFileSync(fullLocalPath);
    return { buffer };
  }

  throw new Error("Document not found in storage.");
}

/**
 * Deletes a file from local storage.
 * @param {string} storagePath
 * @returns {Promise<boolean>}
 */
async function deleteFile(storagePath) {
  const fullLocalPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
  if (fs.existsSync(fullLocalPath)) {
    try {
      fs.unlinkSync(fullLocalPath);
      console.log("[STORAGE] ✅ Local file deleted:", storagePath);
    } catch (err) {
      console.error("[STORAGE] Local file delete failed:", err.message);
    }
  }

  return true;
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
  LOCAL_UPLOAD_DIR,
};
