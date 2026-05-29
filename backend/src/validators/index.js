const { z } = require('zod');

// ── Reusable Zod middleware factory ──────────────────────────────────
/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On failure, passes a ZodError to next() so errorHandler.js returns structured errors.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError is caught by errorHandler.js
  }
};

// ── Booking schemas ─────────────────────────────────────────────────
const createBookingSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  name: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  amount: z.number({ coerce: true }).min(0, 'Amount must be non-negative').optional(),
  totalAmount: z.number({ coerce: true }).min(0, 'Amount must be non-negative').optional(),
  advancePaid: z.number({ coerce: true }).min(0).optional(),
  numberOfTravelers: z.number({ coerce: true }).int().min(1).optional(),
  departureDate: z.string().optional(),
  pickupCity: z.string().optional(),
  notes: z.string().optional(),
  passengers: z.any().optional(),
}).refine(data => data.name || data.fullName, {
  message: "Either name or fullName must be provided",
  path: ["name"]
}).refine(data => data.phone || data.mobile, {
  message: "Either phone or mobile must be provided",
  path: ["phone"]
});

// ── Inquiry schemas ─────────────────────────────────────────────────
const createInquirySchema = z.object({
  phone: z.string().min(5, 'Phone is required'),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().optional(),
  tripId: z.string().optional(),
  tripTitle: z.string().optional(),
  date: z.string().optional(),
  count: z.number({ coerce: true }).int().min(1).optional(),
  source: z.string().optional(),
});

// ── Blog schemas ────────────────────────────────────────────────────
const createBlogSchema = z.object({
  title: z.string().min(1, 'Blog title is required'),
  slug: z.string().min(1, 'Blog slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  type: z.enum(['blog', 'reel']).optional(),
});

// ── Admin login schema ──────────────────────────────────────────────
const adminLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  validate,
  createBookingSchema,
  createInquirySchema,
  createBlogSchema,
  adminLoginSchema,
};
