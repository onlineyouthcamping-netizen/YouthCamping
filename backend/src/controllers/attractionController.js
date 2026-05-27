const { prisma } = require('../lib/prisma');

// STUB: Migrating to Prisma
exports.getAttractions = async (req, res) => res.json({ success: true, data: [] });
exports.createAttraction = async (req, res) => res.json({ success: true });
exports.getAttractionBySlug = async (req, res) => res.json({ success: true, data: {} });
exports.updateAttraction = async (req, res) => res.json({ success: true });
exports.deleteAttraction = async (req, res) => res.json({ success: true });
