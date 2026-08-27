const fs = require("fs");
const path = require("path");

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

console.log("[STORAGE] Using local document storage:", LOCAL_UPLOAD_DIR);

function resolveSafeLocalPath(storagePath) {
  if (!storagePath || typeof storagePath !== "string" || storagePath.includes("\0")) {
    throw new Error("Document not found in storage.");
  }
  const normalized = path.normalize(storagePath).replace(/^[/\\]+/, "");
  if (!normalized || normalized === "." || normalized.startsWith("..") || path.isAbsolute(storagePath)) {
    throw new Error("Document not found in storage.");
  }
  const fullLocalPath = path.resolve(path.join(LOCAL_UPLOAD_DIR, normalized));
  const root = path.resolve(LOCAL_UPLOAD_DIR);
  if (fullLocalPath !== root && !fullLocalPath.startsWith(root + path.sep)) {
    throw new Error("Document not found in storage.");
  }
  return fullLocalPath;
}

/**
 * Uploads a file buffer to local VPS storage.
 * @param {Buffer} fileBuffer
 * @param {string} storagePath - E.g. "bookings/bookingId/passengerId/filename.pdf"
 * @param {string} _mimeType
 * @returns {Promise<{ storagePath: string, mode: 'local' }>}
 */
async function uploadFile(fileBuffer, storagePath, _mimeType) {
  try {
    const fullLocalPath = resolveSafeLocalPath(storagePath);
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
  const fullLocalPath = resolveSafeLocalPath(storagePath);
  if (fs.existsSync(fullLocalPath)) {
    console.log("[STORAGE] Retrieving file from local storage");
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
  const fullLocalPath = resolveSafeLocalPath(storagePath);
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
  resolveSafeLocalPath,
};
