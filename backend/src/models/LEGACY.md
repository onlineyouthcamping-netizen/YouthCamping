# Legacy Mongoose models (`backend/src/models/`)

Runtime API code uses **Prisma** (`backend/src/lib/prisma.js`). These Mongoose schemas remain for one-off migration and seed scripts only.

**Do not import these from controllers, services, or `backend/src/routes/`.**

## Used by scripts

| Model | Example scripts |
|-------|-----------------|
| `Trip.js` | `migrate.js`, `seed-live-data.js`, `import-trips-batch1.js`, `restore-trips.js`, `seed_kerala.js`, `add_kerala_trip.js`, `clean_db_images.js`, `wipe_all_photos.js`, `update-home-layout.js`, `feed-live-data.js`, `fix_reviews.js`, `seed_production_trips.js` |
| `Blog.js` | `migrate.js`, `clean_db_images.js`, `wipe_all_photos.js` |
| `Review.js` | `migrate.js`, `clean_db_images.js`, `wipe_all_photos.js`, `seed-all.js`, `fix_reviews.js` |
| `Page.js` | `migrate.js`, `clean_db_images.js`, `seedPages.js`, `seed-all.js` |
| `Settings.js` | `migrate.js`, `clean_db_images.js` |
| `PageLayout.js` | `update-home-layout.js` |
| `Admin.js` | `seedAdmin.js`, `reset_admin.js` |

## Not referenced by scripts (orphan schemas)

These files exist but have no known `require('../src/models/...')` usage in `backend/scripts/`:

- `Attraction.js`
- `Booking.js`
- `BookingForm.js`
- `DynamicForm.js`
- `Inquiry.js`
- `Payment.js`
- `Question.js`
- `Quotation.js`
- `TripVendor.js`
- `User.js`
- `Vendor.js`

Keep until a migration audit confirms safe removal.

## Verification

```bash
# No runtime imports (should return empty)
rg "require\\(.*models/" backend/src backend/routes
```

All matches should be under `backend/scripts/` only.
