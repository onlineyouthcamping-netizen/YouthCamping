const fs = require("fs");
const path = require("path");

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];
const MAX_BYTES = 5 * 1024 * 1024;

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Persist a payment-proof file using the existing Cloudinary + local /uploads
 * storage path. Returns a URL that sanitizeProofUrl accepts.
 */
async function persistPaymentProofFile(file) {
  if (!file || !file.buffer) {
    const err = new Error("No proof file provided");
    err.statusCode = 400;
    throw err;
  }

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    const err = new Error(
      "Invalid file type. Only JPG, PNG, and PDF are allowed.",
    );
    err.statusCode = 400;
    throw err;
  }

  if (file.size > MAX_BYTES) {
    const err = new Error("File size must be under 5 MB.");
    err.statusCode = 400;
    throw err;
  }

  const ext =
    path.extname(file.originalname || "").toLowerCase() ||
    (file.mimetype === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  if (isCloudinaryConfigured()) {
    try {
      const cloudinary = require("cloudinary").v2;
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "youthcamping/payment-proofs",
            resource_type:
              file.mimetype === "application/pdf" ? "raw" : "image",
          },
          (error, uploaded) => {
            if (error) return reject(error);
            resolve(uploaded);
          },
        );
        uploadStream.end(file.buffer);
      });
      const url = result && (result.secure_url || result.url);
      if (url) return url;
    } catch (err) {
      console.warn(
        "[PROOF UPLOAD] Cloudinary failed, falling back to local:",
        err.message,
      );
    }
  }

  const candidateDirs = [
    path.join(__dirname, "../../public/uploads/payment-proofs"),
    path.join(__dirname, "../public/uploads/payment-proofs"),
    path.join(process.cwd(), "public/uploads/payment-proofs"),
    path.join(process.cwd(), "uploads/payment-proofs"),
  ];

  let targetDir = null;
  for (const dir of candidateDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      targetDir = dir;
      break;
    } catch {
      // try next candidate
    }
  }

  if (!targetDir) {
    const err = new Error("Document storage failed. Please retry later.");
    err.statusCode = 500;
    throw err;
  }

  try {
    fs.writeFileSync(path.join(targetDir, filename), file.buffer);
  } catch (err) {
    console.error("[PROOF UPLOAD] Local write failed:", err.message);
    const storageErr = new Error("Document storage failed. Please retry later.");
    storageErr.statusCode = 500;
    throw storageErr;
  }

  return `/uploads/payment-proofs/${filename}`;
}

function resolveUploadedProofFile(req) {
  if (req.file) return req.file;
  const files = req.files;
  if (!files) return null;
  if (Array.isArray(files)) return files[0] || null;
  return (files.document && files.document[0]) || (files.proof && files.proof[0]) || null;
}

module.exports = {
  persistPaymentProofFile,
  resolveUploadedProofFile,
  ALLOWED_MIMES,
  MAX_BYTES,
};
