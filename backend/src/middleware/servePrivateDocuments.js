const path = require("path");
const { prisma } = require("../lib/prisma");
const documentStorage = require("../utils/documentStorage");
const { resolveTenantId } = require("../utils/tenantContext");

function relativeDocumentPath(req) {
  const raw = String(req.path || "").replace(/^\/+/, "");
  if (!raw || raw.includes("\0")) return null;
  const normalized = path.posix.normalize(raw).replace(/^\/+/, "");
  if (!normalized || normalized === "." || normalized.startsWith("..")) {
    return null;
  }
  return normalized;
}

/**
 * Authenticated, tenant-scoped serving of passenger identity documents.
 * Replaces public express.static for /uploads/documents and /api/uploads/documents.
 * Never logs file contents.
 */
async function servePrivatePassengerDocument(req, res, next) {
  try {
    if (req.user?.role === "guide") {
      return res.status(403).json({
        success: false,
        message: "Guides are not permitted to access documents.",
      });
    }

    const relativePath = relativeDocumentPath(req);
    if (!relativePath) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    const tenantId = resolveTenantId(req);
    const doc = await prisma.bookingDocument.findFirst({
      where: {
        tenantId,
        OR: [
          { storagePath: relativePath },
          { storagePath: `documents/${relativePath}` },
        ],
      },
      select: {
        id: true,
        storagePath: true,
        mimeType: true,
        originalFileName: true,
      },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    const { buffer } = await documentStorage.downloadFile(doc.storagePath);
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.originalFileName || "document")}"`,
    );
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  servePrivatePassengerDocument,
  relativeDocumentPath,
};
