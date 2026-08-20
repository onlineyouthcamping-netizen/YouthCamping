-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'admin', 'sales', 'operations', 'finance', 'finance_controller', 'FINANCE_CONTROLLER', 'guide', 'viewer', 'BOOKING_VERIFIER');

-- CreateEnum
CREATE TYPE "TrainTicketStatus" AS ENUM ('PENDING', 'BOOKED', 'WAITLISTED', 'CONFIRMED', 'RAC', 'SELF_BOOKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrainTicketApprovalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REOPENED');

-- CreateEnum
CREATE TYPE "AccountingPaymentMode" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "AccountingEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OpsVendorType" AS ENUM ('HOTEL', 'RESORT', 'HOMESTAY', 'HOSTEL', 'GUEST_HOUSE', 'VILLA', 'CAMP', 'COTTAGE', 'APARTMENT', 'DORMITORY', 'LUXURY_TENT', 'TRANSPORT', 'ACTIVITIES', 'RESTAURANT', 'GUIDE', 'CAMPING', 'OTHER', 'FOOD', 'MEALS', 'MISC');

-- CreateEnum
CREATE TYPE "OpsBookingStatus" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OpsSOPStage" AS ENUM ('PRE_TRIP_30D', 'PRE_TRIP_21D', 'PRE_TRIP_14D', 'PRE_TRIP_7D', 'PRE_TRIP_3D', 'PRE_TRIP_1D', 'DEPARTURE_DAY', 'DURING_TRIP', 'POST_TRIP');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OpsLeaderType" AS ENUM ('INTERNAL', 'FREELANCE');

-- CreateEnum
CREATE TYPE "OpsIncidentType" AS ENUM ('MEDICAL', 'LOST_LUGGAGE', 'HOTEL_ISSUE', 'TRANSPORT_ISSUE', 'GUEST_CONFLICT', 'DOCUMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "OpsIncidentStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "OpsChecklistAction" AS ENUM ('COMPLETE', 'REOPEN');

-- CreateEnum
CREATE TYPE "OpsLeaderActivityAction" AS ENUM ('ASSIGN', 'UPDATE', 'ARCHIVE', 'RESTORE');

-- CreateEnum
CREATE TYPE "OpsIncidentActivityAction" AS ENUM ('CREATE', 'UPDATE', 'RESOLVE', 'REOPEN', 'COMMENT');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('ADVENTURE', 'WATER_SPORTS', 'TREKKING', 'CAMPING', 'SIGHTSEEING', 'CULTURAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityDifficulty" AS ENUM ('EASY', 'MODERATE', 'CHALLENGING', 'EXTREME');

-- CreateEnum
CREATE TYPE "OpsSharingType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'FAMILY');

-- CreateEnum
CREATE TYPE "OpsRateBasis" AS ENUM ('PER_PERSON', 'PER_ROOM');

-- CreateEnum
CREATE TYPE "OpsMealPlan" AS ENUM ('EP', 'CP', 'MAP', 'AP');

-- CreateEnum
CREATE TYPE "OpsSeasonType" AS ENUM ('STANDARD', 'SEASON', 'OFF_SEASON');

-- CreateEnum
CREATE TYPE "OpsAddonRateBasis" AS ENUM ('PER_PERSON', 'PER_MEAL', 'PER_ROOM', 'PER_DAY', 'PER_VEHICLE', 'PER_TENT', 'FIXED');

-- CreateEnum
CREATE TYPE "OpsAllocationStatus" AS ENUM ('PLANNED', 'CONTACTED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DirectoryVendorType" AS ENUM ('HOTEL', 'HOMESTAY', 'CAMP', 'TRANSPORT', 'FOOD', 'GUIDE', 'ACTIVITY', 'TICKETING', 'EQUIPMENT', 'PORTER', 'MEDICAL', 'MECHANIC', 'MISC');

-- CreateEnum
CREATE TYPE "DirectoryRoomSharingType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'FAMILY', 'DORMITORY', 'GROUP');

-- CreateEnum
CREATE TYPE "DirectoryAccommodationRateBasis" AS ENUM ('PER_ROOM_PER_NIGHT', 'PER_PERSON_PER_NIGHT', 'FLAT_PACKAGE');

-- CreateEnum
CREATE TYPE "DirectoryTransportRateBasis" AS ENUM ('PER_VEHICLE', 'PER_DAY', 'PER_KM', 'FLAT_PACKAGE');

-- CreateEnum
CREATE TYPE "DirectoryMiscChargeUnit" AS ENUM ('PER_PERSON', 'PER_PERSON_PER_DAY', 'PER_GROUP_PER_DAY', 'PER_ROOM_PER_NIGHT', 'PER_VEHICLE', 'PER_DAY', 'FLAT');

-- CreateEnum
CREATE TYPE "DirectoryMealPlan" AS ENUM ('EP', 'CP', 'MAP', 'AP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DirectoryVendorSeason" AS ENUM ('ALL', 'PEAK', 'REGULAR', 'OFF_SEASON', 'SUMMER', 'WINTER', 'MONSOON', 'FESTIVAL');

-- CreateEnum
CREATE TYPE "DirectoryVendorRateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT');

-- CreateEnum
CREATE TYPE "StationPaymentMode" AS ENUM ('CASH', 'UPI');

-- CreateEnum
CREATE TYPE "StationUpiStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StationCollectionStatus" AS ENUM ('COLLECTED', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "StationHandoverStatus" AS ENUM ('PENDING', 'HANDED_OVER', 'CONFIRMED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "ReceivingAccountType" AS ENUM ('COMPANY', 'INDIVIDUAL', 'BANK', 'UPI', 'CASH', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ReceivingAccountOwnership" AS ENUM ('COMPANY', 'STAFF', 'PARTNER', 'INDIVIDUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "TripKnowledgeSection" AS ENUM ('overview', 'sales_guide', 'faqs', 'itinerary', 'inclusions', 'vendors', 'sops', 'ticketing', 'documents', 'gallery', 'activity_log');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('text', 'file', 'structured_data');

-- CreateEnum
CREATE TYPE "KnowledgeStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "SOPCategory" AS ENUM ('safety', 'checkin', 'emergency', 'ticketing', 'other');

-- CreateEnum
CREATE TYPE "TripDocumentCategory" AS ENUM ('permit', 'insurance', 'visa', 'guide', 'sop', 'other');

-- CreateEnum
CREATE TYPE "TripActivityAction" AS ENUM ('upload', 'create', 'edit', 'publish', 'delete');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "tenantId" TEXT DEFAULT 'default',
    "customPermissions" JSONB,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "designation" TEXT,
    "notificationPreferences" JSONB,
    "uiSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "tripId" TEXT,
    "tripTitle" TEXT,
    "date" TEXT,
    "count" INTEGER,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNotes" TEXT,
    "salesAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripVendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "agreedCost" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "outgoingPaymentMode" TEXT,
    "onlinePersonAccount" TEXT,
    "cashDepositorName" TEXT,
    "depositAccountName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "author" TEXT DEFAULT 'Expedition Team',
    "authorImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "readTime" TEXT DEFAULT '5 MIN READ',
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "userName" TEXT NOT NULL,
    "userHandle" TEXT,
    "instagram" TEXT,
    "city" TEXT,
    "tripName" TEXT,
    "tripType" TEXT,
    "userImage" TEXT,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tripId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "paymentMode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "clientName" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "data" JSONB,
    "salesAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "shortName" TEXT,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'himalayan',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "heroImage" TEXT,
    "images" TEXT[],
    "itinerary" JSONB,
    "availableDates" JSONB,
    "variants" JSONB,
    "travelOptions" JSONB,
    "roomOptions" JSONB,
    "seo" JSONB,
    "highlights" JSONB,
    "inclusions" JSONB,
    "exclusions" JSONB,
    "faqs" JSONB,
    "addons" JSONB,
    "maxGroupSize" INTEGER,
    "difficulty" TEXT,
    "departureCity" TEXT,
    "pickupCities" JSONB,
    "ageLimit" TEXT,
    "bookingUrl" TEXT,
    "customSections" JSONB,
    "attractions" JSONB,
    "activities" JSONB,
    "accommodations" JSONB,
    "popupDetails" JSONB,
    "route" JSONB,
    "ageGroup" TEXT,
    "maxAltitude" TEXT,
    "tripType" TEXT,
    "startEnd" TEXT,
    "pickupMode" TEXT,
    "stickyCardPrice" DOUBLE PRECISION,
    "stickyCardLabel" TEXT,
    "gstPercentage" DOUBLE PRECISION DEFAULT 5,
    "reels" JSONB,
    "tripReviews" JSONB,
    "itineraryVersions" JSONB,
    "trainTicketTemplate" JSONB,
    "order" INTEGER NOT NULL DEFAULT 999,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDeparturePriceOverride" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "overrideType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripDeparturePriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "numberOfTravelers" INTEGER,
    "baseAmount" DOUBLE PRECISION,
    "gstAmount" DOUBLE PRECISION,
    "depositGst" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT NOT NULL DEFAULT 'upi',
    "upi_reference" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "sourceBookingLinkId" TEXT,
    "salesAdminId" TEXT,
    "sourceMeta" JSONB,
    "departureDate" TIMESTAMP(3),
    "pickupCity" TEXT,
    "skipDays" INTEGER DEFAULT 0,
    "adjustedPrice" DOUBLE PRECISION,
    "joiningDate" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "passengers" JSONB,
    "trainTicketRequired" BOOLEAN NOT NULL DEFAULT false,
    "trainTicketStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAttachment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sentStatus" TEXT NOT NULL DEFAULT 'NOT_SENT',
    "sentAt" TIMESTAMP(3),
    "versionHistory" JSONB,

    CONSTRAINT "BookingAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingEmailLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "BookingEmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "createdByAdminId" TEXT,
    "tripId" TEXT NOT NULL,
    "tripName" TEXT,
    "departureDate" TIMESTAMP(3),
    "pickupCity" TEXT,
    "paymentMode" TEXT,
    "customAmount" DOUBLE PRECISION,
    "customTime" TEXT,
    "headerTitle" TEXT,
    "headerSubtitle" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "travelerCount" INTEGER,
    "internalNote" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL DEFAULT '',
    "shareUrl" TEXT,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "firstOpenedAt" TIMESTAMP(3),
    "lastOpenedAt" TIMESTAMP(3),
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLinkEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingLinkId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingLinkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBuilder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "sections" JSONB DEFAULT '[]',
    "draft" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsitePage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB DEFAULT '{}',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsitePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteSetting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'primary',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "scope" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "scope" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT,
    "changedByName" TEXT,
    "changeSummary" TEXT,
    "affectedPages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignPreset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'global',
    "config" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attraction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "location" TEXT,
    "altitude" TEXT,
    "bestTime" TEXT,
    "category" TEXT NOT NULL DEFAULT 'nature',
    "visitingHours" TEXT,
    "entryFee" TEXT,
    "etiquette" JSONB,
    "faqs" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT DEFAULT 'default',
    "actorUserId" TEXT,
    "bookingId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "changeSummary" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_verifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "checklist" JSONB,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_verification_logs" (
    "id" TEXT NOT NULL,
    "bookingVerificationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "snapshot" JSONB,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_ticket_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "journeyDate" TIMESTAMP(3),
    "fromStation" TEXT,
    "toStation" TEXT,
    "preferredTrain" TEXT,
    "preferredClass" TEXT,
    "seatPreference" TEXT,
    "estimatedAmount" DOUBLE PRECISION DEFAULT 0,
    "specialNotes" TEXT,
    "pnr" TEXT,
    "ticketDetails" TEXT,
    "history" JSONB,
    "templateId" TEXT,
    "emailTemplateId" TEXT,
    "alertMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "train_ticket_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_ticket_travellers" (
    "id" TEXT NOT NULL,
    "trainTicketRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "train_ticket_travellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_ticket_logs" (
    "id" TEXT NOT NULL,
    "trainTicketRequestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "snapshot" JSONB,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "train_ticket_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "travelerName" TEXT NOT NULL,
    "passengerReference" TEXT,
    "pnr" TEXT,
    "trainName" TEXT,
    "trainNumber" TEXT,
    "journeyDate" TIMESTAMP(3),
    "sourceStation" TEXT,
    "destinationStation" TEXT,
    "coach" TEXT,
    "seatNumber" TEXT,
    "berthType" TEXT,
    "ticketStatus" "TrainTicketStatus" NOT NULL DEFAULT 'PENDING',
    "approvalStatus" "TrainTicketApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "ticketAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "expectedTicketAmount" DECIMAL(10,2) DEFAULT 0.00,
    "varianceAmount" DECIMAL(10,2) DEFAULT 0.00,
    "financeStatus" TEXT DEFAULT 'PENDING_VERIFICATION',
    "financeVerifiedAt" TIMESTAMP(3),
    "financeVerifiedByAdminId" TEXT,
    "financeRejectionReason" TEXT,
    "paidBy" TEXT NOT NULL DEFAULT 'COMPANY',
    "fareBreakdown" JSONB,
    "amountMode" TEXT,
    "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "railwayCancellationCharge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "ycCancellationCharge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "refundStatus" TEXT NOT NULL DEFAULT 'NONE',
    "refundCompletedAt" TIMESTAMP(3),
    "refundTransactionRef" TEXT,
    "reticketAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "cancellationReason" TEXT,
    "internalNote" TEXT,
    "ticketBookingPerson" TEXT,
    "supersedesTicketId" TEXT,
    "supersededByTicketId" TEXT,
    "reopenReason" TEXT,
    "submittedByAdminId" TEXT,
    "groupId" TEXT,
    "templateId" TEXT,
    "ticketFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicketHistory" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "TrainTicketStatus",
    "toStatus" "TrainTicketStatus",
    "fromApproval" "TrainTicketApprovalStatus",
    "toApproval" "TrainTicketApprovalStatus",
    "notes" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainTicketHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT,
    "tripTitle" TEXT,
    "departureDate" TIMESTAMP(3),
    "estimatedTicketCost" DECIMAL(10,2) DEFAULT 0.00,
    "scope" TEXT NOT NULL DEFAULT 'TRIP',
    "transportMode" TEXT NOT NULL DEFAULT 'TRAIN',
    "trainName" TEXT,
    "trainNumber" TEXT,
    "source" TEXT,
    "destination" TEXT,
    "defaultClass" TEXT,
    "defaultCoach" TEXT,
    "journeyDate" TIMESTAMP(3),
    "boardingPoint" TEXT,
    "droppingPoint" TEXT,
    "flightAirline" TEXT,
    "flightNumber" TEXT,
    "flightOrigin" TEXT,
    "flightDestination" TEXT,
    "flightTerminal" TEXT,
    "baggageGuidance" TEXT,
    "reportingTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "waitlistDisclaimer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicketAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "alertType" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "bookingId" TEXT,
    "ticketId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainTicketAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicketGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "label" TEXT,
    "amountMode" TEXT NOT NULL DEFAULT 'PER_PERSON',
    "groupTicketAmount" DECIMAL(10,2),
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainTicketGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicketApproval" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "trainTicketId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromApprovalStatus" "TrainTicketApprovalStatus",
    "toApprovalStatus" "TrainTicketApprovalStatus",
    "fromTicketStatus" "TrainTicketStatus",
    "toTicketStatus" "TrainTicketStatus",
    "notes" TEXT,
    "actorAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainTicketApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketApproval" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ticketNumber" TEXT,
    "ticketFileUrl" TEXT,
    "requestedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainTicketAlertEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT,
    "trainTicketId" TEXT,
    "alertType" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "recipientAdminId" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "sentAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainTicketAlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "AccountingPaymentMode" NOT NULL,
    "collectionAccountId" TEXT,
    "referenceNumber" TEXT,
    "status" "AccountingEntryStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "rejectionReason" TEXT,
    "salespersonId" TEXT NOT NULL,
    "actionedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingEntryLog" (
    "id" TEXT NOT NULL,
    "accountingEntryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingEntryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingAlertDedupe" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingAlertDedupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorCode" TEXT,
    "name" TEXT NOT NULL,
    "type" "OpsVendorType" NOT NULL,
    "accommodationType" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "destinationId" TEXT,
    "contactPerson" TEXT,
    "primaryContactName" TEXT,
    "secondaryContactName" TEXT,
    "receptionPhone" TEXT,
    "whatsappNumber" TEXT,
    "managerName" TEXT,
    "emergencyPhone" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fullAddress" TEXT,
    "address" TEXT,
    "area" TEXT,
    "landmark" TEXT,
    "pinCode" TEXT,
    "city" TEXT,
    "location" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "gstin" TEXT,
    "panNumber" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "upiId" TEXT,
    "paymentTerms" TEXT,
    "creditDays" INTEGER DEFAULT 30,
    "preferredPaymentMethod" TEXT,
    "starRating" INTEGER DEFAULT 3,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "checkInTime" TEXT DEFAULT '12:00 PM',
    "checkOutTime" TEXT DEFAULT '11:00 AM',
    "earlyCheckInPolicy" TEXT,
    "lateCheckOutPolicy" TEXT,
    "mealPlans" TEXT,
    "amenities" TEXT,
    "images" TEXT,
    "documents" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceSheet" TEXT,
    "sourceRow" INTEGER,
    "totalRooms" INTEGER,
    "roomTypes" TEXT,
    "sharingTypes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT,
    "guideRates" TEXT,
    "performanceScore" DOUBLE PRECISION DEFAULT 95.0,
    "complaintCount" INTEGER DEFAULT 0,
    "lateCheckinCount" INTEGER DEFAULT 0,

    CONSTRAINT "OpsVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorRoom" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomCategory" TEXT DEFAULT 'Standard',
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "baseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extraMattressRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxAdults" INTEGER NOT NULL DEFAULT 3,
    "maxChildren" INTEGER NOT NULL DEFAULT 2,
    "images" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorSeasonalRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "twinRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tripleRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quadRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "childRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extraMattressRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mealCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorSeasonalRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorDestination" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "state" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsVendorDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agreementType" TEXT DEFAULT 'Annual Contract',
    "startDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "renewalReminderDate" TIMESTAMP(3),
    "commissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationPolicy" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorCalendar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referenceNo" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsVendorLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorPriceHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "oldRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsVendorPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorTimeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsVendorTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsHotelBooking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "vendorId" TEXT,
    "hotelName" TEXT NOT NULL,
    "location" TEXT,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "roomType" TEXT,
    "numberOfRooms" INTEGER NOT NULL DEFAULT 1,
    "confirmed" "OpsBookingStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rateId" TEXT,
    "rateType" TEXT DEFAULT 'PER_ROOM_PER_NIGHT',
    "doubleRate" DOUBLE PRECISION,
    "tripleRate" DOUBLE PRECISION,
    "quadRate" DOUBLE PRECISION,
    "singleRate" DOUBLE PRECISION,
    "extraBedRate" DOUBLE PRECISION,
    "childWithBed" DOUBLE PRECISION,
    "childWithoutBed" DOUBLE PRECISION,
    "mealPlanRate" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION DEFAULT 0,
    "rateValidFrom" TIMESTAMP(3),
    "rateValidUntil" TIMESTAMP(3),
    "rateSnapshotAt" TIMESTAMP(3),
    "pricingMethod" TEXT DEFAULT 'room-wise',
    "doubleRoomsCount" INTEGER DEFAULT 0,
    "tripleRoomsCount" INTEGER DEFAULT 0,
    "quadRoomsCount" INTEGER DEFAULT 0,
    "extraPersonsCount" INTEGER DEFAULT 0,
    "nightsCount" INTEGER DEFAULT 1,

    CONSTRAINT "OpsHotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorHotelRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "rateName" TEXT,
    "rateType" TEXT NOT NULL DEFAULT 'PER_ROOM_PER_NIGHT',
    "doubleRate" DOUBLE PRECISION,
    "tripleRate" DOUBLE PRECISION,
    "quadRate" DOUBLE PRECISION,
    "singleRate" DOUBLE PRECISION,
    "extraBedRate" DOUBLE PRECISION,
    "childWithBed" DOUBLE PRECISION,
    "childWithoutBed" DOUBLE PRECISION,
    "mealPlan" TEXT,
    "mealPlanRate" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorHotelRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartureHotelRateOverride" (
    "id" TEXT NOT NULL,
    "departureHotelId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "originalValue" DOUBLE PRECISION NOT NULL,
    "overriddenValue" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartureHotelRateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsRoomInventory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "roomLabel" TEXT NOT NULL,
    "roomType" TEXT NOT NULL DEFAULT 'TWIN',
    "genderGroup" TEXT NOT NULL DEFAULT 'BOYS',
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "hotelName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsRoomInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTransportFleet" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "vendorId" TEXT,
    "vehicleType" TEXT NOT NULL,
    "vehicleNumber" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 13,
    "route" TEXT,
    "pickupPoints" TEXT,
    "dropPoints" TEXT,
    "reportingTime" TEXT,
    "departureTime" TEXT,
    "confirmationStatus" TEXT NOT NULL DEFAULT 'UNCONFIRMED',
    "paymentDueDate" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTransportFleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsGuidePayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "guideAdminId" TEXT,
    "vendorId" TEXT,
    "guideName" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL DEFAULT 'PRIMARY_GUIDE',
    "assignmentStatus" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "startDate" DATE,
    "endDate" DATE,
    "reportingLocation" TEXT,
    "reportingTime" TEXT,
    "emergencyContact" TEXT,
    "daysWorked" INTEGER NOT NULL DEFAULT 1,
    "agreedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsGuidePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsMiscExpense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsMiscExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSeatConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "totalSeatsCap" INTEGER NOT NULL DEFAULT 30,
    "alertThreshold" INTEGER NOT NULL DEFAULT 25,
    "blockedSeats" INTEGER NOT NULL DEFAULT 0,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSeatConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSOPTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "destination" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'PRE_TRIP_7D',
    "taskName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsSOPTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSopTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "activeVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSopTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSopVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "versionLabel" TEXT NOT NULL DEFAULT 'v1',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSopVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSopTaskTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "versionId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'PRE_TRIP_7D',
    "relativeOffset" INTEGER NOT NULL DEFAULT -7,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "defaultAssignee" TEXT DEFAULT 'OPERATIONS',
    "instructions" TEXT,
    "verificationReq" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dependencyTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSopTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripChecklist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "sopTemplateId" TEXT,
    "sopVersionId" TEXT,
    "sopTaskTemplateId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SOP',
    "stage" TEXT NOT NULL DEFAULT 'PRE_TRIP_7D',
    "taskName" TEXT NOT NULL,
    "relativeOffset" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dependencyTaskId" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsTripChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsChecklistActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "checklistItemId" TEXT NOT NULL,
    "action" "OpsChecklistAction" NOT NULL,
    "previousStatus" BOOLEAN NOT NULL,
    "nextStatus" BOOLEAN NOT NULL,
    "notes" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsChecklistActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsIncidentLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "reportedById" TEXT NOT NULL,
    "incidentType" "OpsIncidentType" NOT NULL DEFAULT 'OTHER',
    "status" "OpsIncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsIncidentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsIncidentActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "incidentId" TEXT NOT NULL,
    "action" "OpsIncidentActivityAction" NOT NULL,
    "notes" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsIncidentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsAllocationRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "resultJson" JSONB NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsAllocationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsAllocationOverride" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "allocationRunId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "beforeValue" JSONB,
    "afterValue" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsAllocationOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVehicleAllocation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "fleetId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "travelerName" TEXT NOT NULL,
    "seatNumber" INTEGER,
    "allocationStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "routeSegment" TEXT,
    "pickupPoint" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVehicleAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsRoomAllocation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "genderGroup" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "travelerName" TEXT NOT NULL,
    "sharingType" TEXT NOT NULL DEFAULT 'STANDARD',
    "allocationStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hotelBookingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsRoomAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsDayItinerary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "date" TIMESTAMP(3),
    "dayTitle" TEXT NOT NULL,
    "paxCount" INTEGER NOT NULL DEFAULT 0,
    "hotelName" TEXT,
    "hotelVerified" BOOLEAN NOT NULL DEFAULT false,
    "vehicleType" TEXT,
    "vehicleVerified" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "guideDriverDetails" TEXT,
    "guideVerified" BOOLEAN NOT NULL DEFAULT false,
    "checkInDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsDayItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripExpense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "serviceDate" TIMESTAMP(3),
    "activity" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Due',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTripExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSopLibrary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "destination" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "archivedAt" TIMESTAMP(3),
    "archivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSopLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripLeader" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "leaderName" TEXT NOT NULL,
    "leaderPhone" TEXT NOT NULL,
    "leaderType" "OpsLeaderType" NOT NULL DEFAULT 'INTERNAL',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "assignedById" TEXT,
    "updatedById" TEXT,
    "archivedAt" TIMESTAMP(3),
    "archivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTripLeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripLeaderActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "leaderAssignmentId" TEXT NOT NULL,
    "action" "OpsLeaderActivityAction" NOT NULL,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "notes" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsTripLeaderActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingActivityLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "performedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "assignedById" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNavState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expandedModule" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNavState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSection" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tabKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripNotice" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripNoticeAck" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "ackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripNoticeAck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultAttachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT,
    "inquiryId" TEXT,
    "trainTicketId" TEXT,
    "senderId" TEXT,
    "recipient" TEXT NOT NULL,
    "ccCount" INTEGER NOT NULL DEFAULT 0,
    "bccCount" INTEGER NOT NULL DEFAULT 0,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "templateId" TEXT,
    "templateName" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageState" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageCity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageVendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "gstNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageHotel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "maxPeoplePerRoom" INTEGER NOT NULL DEFAULT 2,
    "mealPlan" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekendPrice" DOUBLE PRECISION,
    "peakSeasonPrice" DOUBLE PRECISION,
    "extraMattressPrice" DOUBLE PRECISION DEFAULT 0,
    "extraAdultPrice" DOUBLE PRECISION DEFAULT 0,
    "childWithBedPrice" DOUBLE PRECISION DEFAULT 0,
    "childWithoutBedPrice" DOUBLE PRECISION DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vendorId" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageHotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageHotelTariff" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "roomRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "label" TEXT,

    CONSTRAINT "PackageHotelTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageVehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seatingCapacity" INTEGER NOT NULL,
    "isAc" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "vendorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageVehicleTariff" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "priceType" TEXT NOT NULL,
    "perDayRate" DOUBLE PRECISION,
    "perKmRate" DOUBLE PRECISION,
    "fixedRouteRate" DOUBLE PRECISION,
    "minKmPerDay" INTEGER DEFAULT 0,
    "driverAllowance" DOUBLE PRECISION DEFAULT 0,
    "fuelIncluded" BOOLEAN NOT NULL DEFAULT true,
    "tollParkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "PackageVehicleTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageTransferRoute" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "travelTimeMins" INTEGER,
    "suggestedVehicle" TEXT,
    "fixedRate" DOUBLE PRECISION,
    "perKmRate" DOUBLE PRECISION,
    "pickupDropNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTransferRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adultRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "childRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "duration" TEXT,
    "description" TEXT,
    "includedItems" TEXT,
    "excludedItems" TEXT,
    "image" TEXT,
    "vendorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageMealPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT,
    "name" TEXT NOT NULL,
    "breakfastCost" DOUBLE PRECISION DEFAULT 0,
    "lunchCost" DOUBLE PRECISION DEFAULT 0,
    "dinnerCost" DOUBLE PRECISION DEFAULT 0,
    "perPersonPerDay" DOUBLE PRECISION DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageMealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageDraft" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "draftId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "packageName" TEXT,
    "stateId" TEXT,
    "departureCity" TEXT,
    "travelStartDate" DATE,
    "travelEndDate" DATE,
    "totalNights" INTEGER NOT NULL DEFAULT 0,
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "adults" INTEGER NOT NULL DEFAULT 0,
    "children" INTEGER NOT NULL DEFAULT 0,
    "couples" INTEGER NOT NULL DEFAULT 0,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "roomConfig" JSONB,
    "specialNotes" TEXT,
    "inclusions" TEXT,
    "exclusions" TEXT,
    "terms" TEXT,
    "hotelCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vehicleCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transferCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mealCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "guideCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trainCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flightCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "miscCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountType" TEXT,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorHotelCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorVehicleCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorActivityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorMealCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorGuideCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quoteNumber" TEXT,
    "quoteValidity" TEXT DEFAULT '48 hours',
    "paymentTerms" TEXT DEFAULT '50% advance, 50% before travel',
    "quoteSentAt" TIMESTAMP(3),
    "salesAdminId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageItineraryDay" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" DATE,
    "stayCityId" TEXT,
    "title" TEXT,
    "routeFrom" TEXT,
    "routeTo" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "travelTimeMins" INTEGER,
    "notes" TEXT,

    CONSTRAINT "PackageItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageItineraryItem" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceId" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isVendorCost" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "PackageItineraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageActivityLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "draftId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "actorId" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketingSop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketingSop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketingSopItem" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketingSopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketingLink" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "val" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "dayNumber" TEXT NOT NULL,
    "dayDate" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "stay" TEXT NOT NULL,
    "meals" TEXT NOT NULL,
    "transport" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryRouteMap" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "mapUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryRouteMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryInclusion" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryInclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryExclusion" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryNote" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "applicableRoles" JSONB,
    "trigger" TEXT,
    "responsibleRole" TEXT,
    "requiredInputs" JSONB,
    "escalationPath" TEXT,
    "expectedOutput" TEXT,
    "reviewFrequency" TEXT,
    "ownerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripSop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSopVersion" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changeComment" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripSopVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSopItem" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripSopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDocument" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" TEXT,
    "addedBy" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "storageKey" TEXT,
    "storedFilename" TEXT,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "uploadedBy" TEXT NOT NULL DEFAULT 'system',
    "approvalDetails" JSONB,

    CONSTRAINT "TripDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileUrl" TEXT,
    "originalFilename" TEXT,
    "storedFilename" TEXT,
    "mimeType" TEXT,
    "fileSize" TEXT,
    "checksum" TEXT,
    "version" INTEGER NOT NULL,
    "metadata" JSONB,
    "visibility" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "documentId" TEXT,
    "sourceDocName" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelQuestion" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "escalatedTo" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripGallery" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripNote" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" TEXT NOT NULL,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "dayNumber" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "description" TEXT,
    "responsibleGuideId" TEXT,
    "responsibleStaff" TEXT,
    "vendorId" TEXT,
    "vendorName" TEXT,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxParticipants" INTEGER NOT NULL DEFAULT 0,
    "safetyInstructions" TEXT,
    "requiredEquipment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "remarks" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL DEFAULT 'ADVENTURE',
    "duration" TEXT NOT NULL DEFAULT '2 Hours',
    "default_capacity" INTEGER NOT NULL DEFAULT 50,
    "difficulty" "ActivityDifficulty" NOT NULL DEFAULT 'MODERATE',
    "minimum_age" INTEGER NOT NULL DEFAULT 16,
    "medical_restrictions" TEXT,
    "equipment_required" TEXT,
    "insurance_required" BOOLEAN NOT NULL DEFAULT true,
    "gst_percentage" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "description" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safety_instructions" TEXT,
    "cancellation_policy" TEXT,
    "meeting_point" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "emergency_contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "pricing_tiers" JSONB,
    "dynamic_rates" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_documents" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "docType" TEXT NOT NULL DEFAULT 'SAFETY_SOP',
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_vendor_contracts" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "seasonType" TEXT NOT NULL DEFAULT 'REGULAR',
    "adult_net_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "child_net_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_participants" INTEGER NOT NULL DEFAULT 1,
    "max_participants" INTEGER NOT NULL DEFAULT 50,
    "payment_terms" TEXT NOT NULL DEFAULT 'NET_30',
    "terms" TEXT,
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_vendor_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_activity_templates" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL DEFAULT 1,
    "activity_id" TEXT NOT NULL,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "addon_selling_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_activity_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departure_activities" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "departure_date" DATE NOT NULL,
    "day_number" INTEGER NOT NULL DEFAULT 1,
    "activity_id" TEXT NOT NULL,
    "activity_vendor_contract_id" TEXT,
    "vendor_id" TEXT,
    "responsible_guide_id" TEXT,
    "scheduled_time" TEXT DEFAULT '10:00 AM',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "agreed_net_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selling_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_capacity" INTEGER NOT NULL DEFAULT 50,
    "assigned_bus" TEXT,
    "pricing_tiers" JSONB,
    "dynamic_rates" JSONB,
    "actual_total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucher_number" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departure_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_activity_allocations" (
    "id" TEXT NOT NULL,
    "departure_activity_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "passenger_index" INTEGER NOT NULL DEFAULT 0,
    "passenger_name" TEXT,
    "seat_number" TEXT,
    "is_opted" BOOLEAN NOT NULL DEFAULT true,
    "addon_amount_charged" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'INCLUDED',
    "waiver_signed" BOOLEAN NOT NULL DEFAULT false,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passenger_activity_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "vendorName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serviceDescription" TEXT,
    "agreedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingPayable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentDate" TIMESTAMP(3),
    "paymentMode" TEXT,
    "transactionId" TEXT,
    "invoiceProof" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Not Paid',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedByFinanceAt" TIMESTAMP(3),
    "reviewedByFinanceId" TEXT,
    "approvedByFounderAt" TIMESTAMP(3),
    "approvedByFounderId" TEXT,
    "requiresFounderApproval" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "rejectionAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "invoiceFileUrl" TEXT,
    "advanceProofUrl" TEXT,
    "settlementProofUrl" TEXT,
    "paidBy" TEXT,
    "collectionAccountId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsClientPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" TEXT,
    "collectionAccountId" TEXT,
    "transactionId" TEXT,
    "paymentDate" TIMESTAMP(3),
    "proofUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending Verification',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedByFinanceAt" TIMESTAMP(3),
    "reviewedByFinanceId" TEXT,
    "approvedByFounderAt" TIMESTAMP(3),
    "approvedByFounderId" TEXT,
    "rejectionReason" TEXT,
    "rejectionAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "proofFileUrl" TEXT,
    "proofUploadedAt" TIMESTAMP(3),
    "proofFileName" TEXT,
    "proofFileType" TEXT,
    "collectedBy" TEXT,
    "recordedByUserId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsClientPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "recipients" JSONB,
    "readBy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsAllocationAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "roomCount" INTEGER NOT NULL DEFAULT 0,
    "vehicleCount" INTEGER NOT NULL DEFAULT 0,
    "cleared" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsAllocationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsAccommodationRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "propertyName" TEXT,
    "city" TEXT,
    "roomCategory" TEXT,
    "sharingType" "OpsSharingType" NOT NULL,
    "rateBasis" "OpsRateBasis" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "mealPlan" "OpsMealPlan" NOT NULL DEFAULT 'EP',
    "seasonType" "OpsSeasonType" NOT NULL DEFAULT 'STANDARD',
    "validFrom" DATE,
    "validTo" DATE,
    "minimumOccupancy" INTEGER NOT NULL DEFAULT 1,
    "maximumOccupancy" INTEGER NOT NULL DEFAULT 4,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsAccommodationRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorVehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "vehicleCode" TEXT,
    "plateNumber" TEXT,
    "vehicleCategory" TEXT NOT NULL DEFAULT 'TEMPO_TRAVELLER',
    "advertisedCapacity" INTEGER NOT NULL DEFAULT 17,
    "sellableSeats" INTEGER NOT NULL DEFAULT 16,
    "hasAC" BOOLEAN NOT NULL DEFAULT true,
    "fuelType" TEXT DEFAULT 'Diesel',
    "luggageCapacity" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsRoutePricingGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "vendorId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "tripName" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "destination" TEXT,
    "season" TEXT,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "durationNights" INTEGER NOT NULL DEFAULT 0,
    "pickupDropIncluded" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATE,
    "validTo" DATE,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsRoutePricingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVehicleRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "routePricingGroupId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "vehicleNameSnapshot" TEXT NOT NULL,
    "totalVehicleAmount" DECIMAL(12,2) NOT NULL,
    "sellableSeats" INTEGER NOT NULL,
    "suggestedPP" DECIMAL(12,2),
    "negotiatedPP" DECIMAL(12,2),
    "minimumPassengers" INTEGER DEFAULT 1,
    "maximumPassengers" INTEGER,
    "extraPickupDropAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "extraDayAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVehicleRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTransportRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "tripCode" TEXT,
    "routeName" TEXT,
    "pickupLocation" TEXT,
    "dropLocation" TEXT,
    "numberOfDays" INTEGER NOT NULL DEFAULT 1,
    "seasonType" TEXT,
    "vehicleType" TEXT NOT NULL,
    "advertisedCapacity" INTEGER NOT NULL DEFAULT 17,
    "sellableSeats" INTEGER NOT NULL DEFAULT 17,
    "totalVehicleCost" DECIMAL(10,2) NOT NULL,
    "driverAllowance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tollParkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "extraPickupCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "validFrom" DATE,
    "validTo" DATE,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTransportRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsVendorAdditionalCharge" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "tripCode" TEXT,
    "chargeName" TEXT NOT NULL,
    "chargeCategory" TEXT,
    "rateBasis" "OpsAddonRateBasis" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "city" TEXT,
    "conditions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsVendorAdditionalCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsDepartureVendorAllocation" (
    "id" TEXT NOT NULL,
    "departureId" TEXT NOT NULL,
    "itineraryDayId" TEXT,
    "vendorId" TEXT NOT NULL,
    "accommodationRateId" TEXT,
    "transportRateId" TEXT,
    "masterRate" DECIMAL(10,2),
    "negotiatedRate" DECIMAL(10,2),
    "finalBookedRate" DECIMAL(10,2),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "numberOfRooms" INTEGER NOT NULL DEFAULT 0,
    "numberOfGuests" INTEGER NOT NULL DEFAULT 0,
    "status" "OpsAllocationStatus" NOT NULL DEFAULT 'PLANNED',
    "confirmationNumber" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tripVendorRateId" TEXT,

    CONSTRAINT "OpsDepartureVendorAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripVendor" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "category" TEXT,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "destinationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTripVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTripVendorRate" (
    "id" TEXT NOT NULL,
    "tripVendorId" TEXT NOT NULL,
    "city" TEXT,
    "rateType" TEXT NOT NULL,
    "roomType" TEXT,
    "sharingType" TEXT,
    "vehicleType" TEXT,
    "routeName" TEXT,
    "rateBasis" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "seasonType" TEXT NOT NULL DEFAULT 'STANDARD',
    "validFrom" DATE,
    "validTo" DATE,
    "minimumOccupancy" INTEGER NOT NULL DEFAULT 1,
    "maximumOccupancy" INTEGER NOT NULL DEFAULT 4,
    "sellableSeats" INTEGER NOT NULL DEFAULT 17,
    "numberOfDays" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTripVendorRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendor" (
    "id" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "type" "DirectoryVendorType" NOT NULL,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "alternateNumber" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "panNumber" TEXT,
    "state" TEXT,
    "city" TEXT,
    "area" TEXT,
    "address" TEXT,
    "paymentTerms" TEXT,
    "creditDays" INTEGER,
    "bankDetails" JSONB,
    "rating" DECIMAL(3,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorContact" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "designation" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorRoomRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "propertyName" TEXT,
    "roomCategory" TEXT NOT NULL DEFAULT 'Standard',
    "sharingType" "DirectoryRoomSharingType" NOT NULL,
    "standardOccupancy" INTEGER NOT NULL DEFAULT 2,
    "maximumOccupancy" INTEGER NOT NULL DEFAULT 3,
    "mixedOccupancyAllowed" BOOLEAN NOT NULL DEFAULT true,
    "rateBasis" "DirectoryAccommodationRateBasis" NOT NULL DEFAULT 'PER_ROOM_PER_NIGHT',
    "amount" DECIMAL(12,2) NOT NULL,
    "extraAdultRate" DECIMAL(12,2),
    "extraChildRate" DECIMAL(12,2),
    "guideRoomRate" DECIMAL(12,2),
    "availableRooms" INTEGER,
    "mealPlan" "DirectoryMealPlan" NOT NULL DEFAULT 'EP',
    "season" "DirectoryVendorSeason" NOT NULL DEFAULT 'ALL',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "taxPercent" DECIMAL(5,2),
    "minimumRooms" INTEGER,
    "cancellationPolicy" TEXT,
    "blackoutDates" JSONB,
    "status" "DirectoryVendorRateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorRoomRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorTransportRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "dropLocation" TEXT,
    "vehicleType" TEXT NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "rateBasis" "DirectoryTransportRateBasis" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "extraCharge" DECIMAL(12,2),
    "extraKmRate" DECIMAL(12,2),
    "extraHourRate" DECIMAL(12,2),
    "nightHaltRate" DECIMAL(12,2),
    "tollIncluded" BOOLEAN NOT NULL DEFAULT false,
    "parkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fuelIncluded" BOOLEAN NOT NULL DEFAULT true,
    "driverAllowanceIncluded" BOOLEAN NOT NULL DEFAULT false,
    "stateTaxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "backupVehicleAvailable" BOOLEAN NOT NULL DEFAULT true,
    "season" "DirectoryVendorSeason" NOT NULL DEFAULT 'ALL',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "cancellationPolicy" TEXT,
    "status" "DirectoryVendorRateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorTransportRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorFoodRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "menuDescription" TEXT,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "ratePerPerson" DECIMAL(12,2) NOT NULL,
    "minimumPax" INTEGER,
    "maximumPax" INTEGER,
    "packedMeal" BOOLEAN NOT NULL DEFAULT false,
    "guideMealRate" DECIMAL(12,2),
    "driverMealRate" DECIMAL(12,2),
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "taxPercent" DECIMAL(5,2),
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "cancellationPolicy" TEXT,
    "status" "DirectoryVendorRateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorFoodRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorGuideRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceLocation" TEXT,
    "languages" TEXT,
    "specialization" TEXT,
    "dailyRate" DECIMAL(12,2) NOT NULL,
    "travelCharge" DECIMAL(12,2),
    "foodCharge" DECIMAL(12,2),
    "stayCharge" DECIMAL(12,2),
    "maximumGroupSize" INTEGER,
    "emergencySupport" BOOLEAN NOT NULL DEFAULT false,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "policeVerified" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "status" "DirectoryVendorRateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorGuideRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorMiscCharge" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "chargeName" TEXT NOT NULL,
    "chargeType" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "unit" "DirectoryMiscChargeUnit" NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "notes" TEXT,
    "status" "DirectoryVendorRateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorMiscCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryTripVendorMapping" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3),
    "dayNumber" INTEGER,
    "serviceDate" TIMESTAMP(3),
    "vendorId" TEXT NOT NULL,
    "serviceType" "DirectoryVendorType" NOT NULL,
    "destination" TEXT,
    "roomRateId" TEXT,
    "transportRateId" TEXT,
    "foodRateId" TEXT,
    "guideRateId" TEXT,
    "miscChargeId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "paxCount" INTEGER,
    "numberOfNights" INTEGER,
    "numberOfDays" INTEGER,
    "numberOfVehicles" INTEGER DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "backupPriority" INTEGER,
    "quotedAmount" DECIMAL(12,2),
    "confirmedAmount" DECIMAL(12,2),
    "confirmationNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryTripVendorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryTripCostSnapshot" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3),
    "paxCount" INTEGER NOT NULL,
    "vendorCost" DECIMAL(12,2) NOT NULL,
    "costPerPerson" DECIMAL(12,2) NOT NULL,
    "calculationData" JSONB NOT NULL,
    "vendorRatesData" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectoryTripCostSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorContract" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "contractStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVendorPayment" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "tripId" TEXT,
    "departureDate" DATE,
    "invoiceAmount" DECIMAL(12,2) NOT NULL,
    "advanceAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "remainingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE,
    "paymentDate" DATE,
    "paymentMode" TEXT,
    "transactionRef" TEXT,
    "approvedBy" TEXT,
    "invoiceLink" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryVendorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskWorkspace" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "readinessScore" DOUBLE PRECISION,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelDeskWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskCategory" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TravelDeskCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskArticle" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "tags" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
    "ownerId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "publishedById" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "originLearningId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelDeskArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskArticleVersion" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" JSONB,
    "visibility" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "authorId" TEXT,
    "changeComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelDeskArticleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskVendorLink" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "departureDate" TEXT,
    "itineraryDayId" TEXT,
    "relationshipType" TEXT NOT NULL,
    "negotiatedRate" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "internalNotes" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isBackup" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TravelDeskVendorLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskNotice" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "departureDate" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "audienceRoles" JSONB,
    "requiresAcknowledgement" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TravelDeskNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskNoticeAck" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelDeskNoticeAck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskLearning" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "rootCause" TEXT,
    "resolution" TEXT,
    "recommendation" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "ownerId" TEXT,

    CONSTRAINT "TravelDeskLearning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelDeskAuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelDeskAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceivingAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "accountName" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountType" "ReceivingAccountType" NOT NULL DEFAULT 'COMPANY',
    "ownershipType" "ReceivingAccountOwnership" DEFAULT 'COMPANY',
    "paymentMethods" TEXT[] DEFAULT ARRAY['UPI', 'BANK_TRANSFER']::TEXT[],
    "bankName" TEXT,
    "accountNumber" TEXT,
    "maskedAccountNumber" TEXT,
    "ifsc" TEXT,
    "upiId" TEXT,
    "description" TEXT,
    "linkedAdminId" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByAdminId" TEXT,
    "approvedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentReceivingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionAccountSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "accountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "recordedByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionAccountSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationPaymentCollection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "receiptNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "station" TEXT NOT NULL,
    "platform" TEXT,
    "paymentMode" "StationPaymentMode" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "previousPaid" DOUBLE PRECISION NOT NULL,
    "newTotalPaid" DOUBLE PRECISION NOT NULL,
    "newRemaining" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "collectedByAdminId" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "collectedFrom" TEXT NOT NULL,
    "collectedFromMobile" TEXT,
    "remarks" TEXT,
    "proofImageUrl" TEXT,
    "utrNumber" TEXT,
    "receivingAccountId" TEXT,
    "upiVerificationStatus" "StationUpiStatus",
    "verifiedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "collectionStatus" "StationCollectionStatus" NOT NULL DEFAULT 'COLLECTED',
    "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "emailSentAt" TIMESTAMP(3),
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversedByAdminId" TEXT,
    "reversalReason" TEXT,
    "handoverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationPaymentCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationCashHandover" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "collectorId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "station" TEXT NOT NULL,
    "amountExpected" DOUBLE PRECISION NOT NULL,
    "amountHandedOver" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "handoverStatus" "StationHandoverStatus" NOT NULL DEFAULT 'PENDING',
    "handoverRecipientId" TEXT,
    "handoverAt" TIMESTAMP(3),
    "handoverReference" TEXT,
    "remarks" TEXT,
    "shortageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excessAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "financeConfirmedById" TEXT,
    "financeConfirmedAt" TIMESTAMP(3),
    "reconciledById" TEXT,
    "reconciledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationCashHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCollectionSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "employeeAdminId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "recordedByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCollectionSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripKnowledge" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "section" "TripKnowledgeSection" NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSOP" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "SOPCategory" NOT NULL,
    "steps" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripSOP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripActivityLog" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "action" "TripActivityAction" NOT NULL,
    "section" TEXT NOT NULL,
    "itemId" TEXT,
    "changes" JSONB,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "isDenied" BOOLEAN NOT NULL DEFAULT false,
    "grantedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCustomPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPermission" (
    "groupId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "GroupPermission_pkey" PRIMARY KEY ("groupId","permissionId")
);

-- CreateTable
CREATE TABLE "PermissionDelegation" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "delegatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PermissionDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RbacAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RbacAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissionsJson" JSONB NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "category" TEXT NOT NULL DEFAULT 'general',
    "adoptionCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "location" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gallery_images" TEXT[],
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "difficulty" TEXT NOT NULL,
    "age_group" TEXT,
    "max_altitude" TEXT,
    "duration_nights" INTEGER NOT NULL DEFAULT 0,
    "duration_days" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "month" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_details" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "nights" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "month" TEXT,
    "departure_dates" JSONB NOT NULL,
    "departure_month" TEXT[],

    CONSTRAINT "trip_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_modes" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "included" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "travel_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_sharing" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "base" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "room_sharing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inclusions" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusions" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stays" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "stays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "avatar" TEXT,
    "date" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "text" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trip_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trip_name" TEXT,
    "trip_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "avatar" TEXT,
    "read_time" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "published_at" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departures" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "departureCode" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Planning',
    "notes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "originalAmountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundReason" TEXT NOT NULL DEFAULT 'CUSTOMER_CANCELLATION',
    "refundReasonText" TEXT,
    "refundMethod" TEXT NOT NULL DEFAULT 'CASH_REFUND',
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundDate" TIMESTAMP(3),
    "refundReference" TEXT,
    "creditNoteAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditNoteValidityStart" TIMESTAMP(3),
    "creditNoteValidityEnd" TIMESTAMP(3),
    "creditNoteStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "refundPolicyApplied" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "gatewayMetadata" JSONB,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNoteUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "refundTransactionId" TEXT NOT NULL,
    "targetBookingId" TEXT NOT NULL,
    "amountUsed" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "appliedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNoteUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "minBookingAmount" DOUBLE PRECISION,
    "applicableTripIds" JSONB,
    "maxUsesTotal" INTEGER,
    "maxUsesPerUser" INTEGER DEFAULT 1,
    "currentUsesCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "couponId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerPhone" TEXT,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TRAIN',
    "pnr" TEXT,
    "ticketNumber" TEXT,
    "passengers" JSONB,
    "documentUrl" TEXT,
    "provider" TEXT,
    "journeyDate" TIMESTAMP(3),
    "arrivalDate" TIMESTAMP(3),
    "source" TEXT,
    "destination" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packageAllowance" DOUBLE PRECISION,
    "ticketingMargin" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "confirmationEmail" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRegistry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'TRAIN',
    "serviceName" TEXT NOT NULL,
    "vendorId" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmationRef" TEXT,
    "notes" TEXT,
    "assignedStaffId" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAllotment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" TEXT NOT NULL DEFAULT 'OTHER',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingId" TEXT,
    "tripId" TEXT,
    "vendorId" TEXT,
    "serviceId" TEXT,
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAllotment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripAccounting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "bookingId" TEXT NOT NULL,
    "tripId" TEXT,
    "departureDate" TIMESTAMP(3),
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "couponDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditNoteApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashRefund" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditIssued" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "refundStatus" TEXT NOT NULL DEFAULT 'NONE',
    "isSnapshotClosed" BOOLEAN NOT NULL DEFAULT false,
    "snapshotClosedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripAccounting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "tripId" TEXT,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByName" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeDescription" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_tenantId_idx" ON "Admin"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "Inquiry_tenantId_idx" ON "Inquiry"("tenantId");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "Vendor_tenantId_idx" ON "Vendor"("tenantId");

-- CreateIndex
CREATE INDEX "TripVendor_tenantId_idx" ON "TripVendor"("tenantId");

-- CreateIndex
CREATE INDEX "TripVendor_tripId_idx" ON "TripVendor"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_tenantId_idx" ON "Blog"("tenantId");

-- CreateIndex
CREATE INDEX "Review_tenantId_idx" ON "Review"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_slug_key" ON "Quotation"("slug");

-- CreateIndex
CREATE INDEX "Quotation_tenantId_idx" ON "Quotation"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_slug_key" ON "Trip"("slug");

-- CreateIndex
CREATE INDEX "Trip_tenantId_idx" ON "Trip"("tenantId");

-- CreateIndex
CREATE INDEX "Trip_tenantId_slug_idx" ON "Trip"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Trip_category_idx" ON "Trip"("category");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "Trip_order_idx" ON "Trip"("order");

-- CreateIndex
CREATE INDEX "TripDeparturePriceOverride_tripId_idx" ON "TripDeparturePriceOverride"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripDeparturePriceOverride_tripId_departureDate_key" ON "TripDeparturePriceOverride"("tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingId_key" ON "Booking"("bookingId");

-- CreateIndex
CREATE INDEX "Booking_tenantId_idx" ON "Booking"("tenantId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_sourceBookingLinkId_idx" ON "Booking"("sourceBookingLinkId");

-- CreateIndex
CREATE INDEX "Booking_salesAdminId_idx" ON "Booking"("salesAdminId");

-- CreateIndex
CREATE INDEX "Booking_tenantId_status_createdAt_idx" ON "Booking"("tenantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Booking_tenantId_salesAdminId_status_createdAt_idx" ON "Booking"("tenantId", "salesAdminId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BookingAttachment_tenantId_idx" ON "BookingAttachment"("tenantId");

-- CreateIndex
CREATE INDEX "BookingAttachment_bookingId_idx" ON "BookingAttachment"("bookingId");

-- CreateIndex
CREATE INDEX "booking_documents_tenantId_idx" ON "booking_documents"("tenantId");

-- CreateIndex
CREATE INDEX "booking_documents_bookingId_idx" ON "booking_documents"("bookingId");

-- CreateIndex
CREATE INDEX "booking_documents_passengerId_idx" ON "booking_documents"("passengerId");

-- CreateIndex
CREATE INDEX "BookingEmailLog_bookingId_idx" ON "BookingEmailLog"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingLink_tokenHash_key" ON "BookingLink"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingLink_tenantId_idx" ON "BookingLink"("tenantId");

-- CreateIndex
CREATE INDEX "BookingLink_status_createdAt_idx" ON "BookingLink"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BookingLink_createdByAdminId_createdAt_idx" ON "BookingLink"("createdByAdminId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BookingLink_createdByAdminId_idx" ON "BookingLink"("createdByAdminId");

-- CreateIndex
CREATE INDEX "BookingLink_tripId_idx" ON "BookingLink"("tripId");

-- CreateIndex
CREATE INDEX "BookingLink_status_idx" ON "BookingLink"("status");

-- CreateIndex
CREATE INDEX "BookingLink_expiresAt_idx" ON "BookingLink"("expiresAt");

-- CreateIndex
CREATE INDEX "BookingLinkEvent_tenantId_idx" ON "BookingLinkEvent"("tenantId");

-- CreateIndex
CREATE INDEX "BookingLinkEvent_bookingLinkId_idx" ON "BookingLinkEvent"("bookingLinkId");

-- CreateIndex
CREATE INDEX "BookingLinkEvent_type_idx" ON "BookingLinkEvent"("type");

-- CreateIndex
CREATE INDEX "BookingLinkEvent_createdAt_idx" ON "BookingLinkEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageBuilder_name_key" ON "PageBuilder"("name");

-- CreateIndex
CREATE INDEX "PageBuilder_tenantId_idx" ON "PageBuilder"("tenantId");

-- CreateIndex
CREATE INDEX "PageBuilder_name_idx" ON "PageBuilder"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WebsitePage_slug_key" ON "WebsitePage"("slug");

-- CreateIndex
CREATE INDEX "WebsitePage_tenantId_idx" ON "WebsitePage"("tenantId");

-- CreateIndex
CREATE INDEX "WebsitePage_slug_idx" ON "WebsitePage"("slug");

-- CreateIndex
CREATE INDEX "WebsitePage_published_idx" ON "WebsitePage"("published");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteSetting_key_key" ON "WebsiteSetting"("key");

-- CreateIndex
CREATE INDEX "WebsiteSetting_tenantId_idx" ON "WebsiteSetting"("tenantId");

-- CreateIndex
CREATE INDEX "WebsiteSetting_key_idx" ON "WebsiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_tenantId_idx" ON "Setting"("tenantId");

-- CreateIndex
CREATE INDEX "Setting_key_idx" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE INDEX "Theme_tenantId_idx" ON "Theme"("tenantId");

-- CreateIndex
CREATE INDEX "Theme_name_idx" ON "Theme"("name");

-- CreateIndex
CREATE INDEX "DesignConfig_scope_idx" ON "DesignConfig"("scope");

-- CreateIndex
CREATE INDEX "DesignConfig_status_idx" ON "DesignConfig"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DesignConfig_tenantId_scope_status_key" ON "DesignConfig"("tenantId", "scope", "status");

-- CreateIndex
CREATE INDEX "DesignVersion_scope_idx" ON "DesignVersion"("scope");

-- CreateIndex
CREATE INDEX "DesignVersion_createdAt_idx" ON "DesignVersion"("createdAt");

-- CreateIndex
CREATE INDEX "DesignPreset_category_idx" ON "DesignPreset"("category");

-- CreateIndex
CREATE UNIQUE INDEX "DesignPreset_tenantId_name_key" ON "DesignPreset"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Attraction_slug_key" ON "Attraction"("slug");

-- CreateIndex
CREATE INDEX "Attraction_tenantId_idx" ON "Attraction"("tenantId");

-- CreateIndex
CREATE INDEX "Attraction_slug_idx" ON "Attraction"("slug");

-- CreateIndex
CREATE INDEX "TripAssignment_guideId_idx" ON "TripAssignment"("guideId");

-- CreateIndex
CREATE INDEX "TripAssignment_tripId_idx" ON "TripAssignment"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripAssignment_tripId_guideId_key" ON "TripAssignment"("tripId", "guideId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_bookingId_idx" ON "AuditLog"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_verifications_bookingId_key" ON "booking_verifications"("bookingId");

-- CreateIndex
CREATE INDEX "booking_verifications_tenantId_idx" ON "booking_verifications"("tenantId");

-- CreateIndex
CREATE INDEX "booking_verifications_status_idx" ON "booking_verifications"("status");

-- CreateIndex
CREATE INDEX "booking_verifications_tenantId_status_updatedAt_idx" ON "booking_verifications"("tenantId", "status", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "booking_verification_logs_bookingVerificationId_idx" ON "booking_verification_logs"("bookingVerificationId");

-- CreateIndex
CREATE UNIQUE INDEX "train_ticket_requests_bookingId_key" ON "train_ticket_requests"("bookingId");

-- CreateIndex
CREATE INDEX "train_ticket_requests_tenantId_idx" ON "train_ticket_requests"("tenantId");

-- CreateIndex
CREATE INDEX "train_ticket_requests_status_idx" ON "train_ticket_requests"("status");

-- CreateIndex
CREATE INDEX "train_ticket_travellers_trainTicketRequestId_idx" ON "train_ticket_travellers"("trainTicketRequestId");

-- CreateIndex
CREATE INDEX "train_ticket_logs_trainTicketRequestId_idx" ON "train_ticket_logs"("trainTicketRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainTicket_supersedesTicketId_key" ON "TrainTicket"("supersedesTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainTicket_supersededByTicketId_key" ON "TrainTicket"("supersededByTicketId");

-- CreateIndex
CREATE INDEX "TrainTicket_tenantId_idx" ON "TrainTicket"("tenantId");

-- CreateIndex
CREATE INDEX "TrainTicket_bookingId_idx" ON "TrainTicket"("bookingId");

-- CreateIndex
CREATE INDEX "TrainTicket_pnr_idx" ON "TrainTicket"("pnr");

-- CreateIndex
CREATE INDEX "TrainTicket_ticketStatus_idx" ON "TrainTicket"("ticketStatus");

-- CreateIndex
CREATE INDEX "TrainTicket_approvalStatus_idx" ON "TrainTicket"("approvalStatus");

-- CreateIndex
CREATE INDEX "TrainTicket_journeyDate_idx" ON "TrainTicket"("journeyDate");

-- CreateIndex
CREATE INDEX "TrainTicket_refundStatus_idx" ON "TrainTicket"("refundStatus");

-- CreateIndex
CREATE INDEX "TrainTicket_paidBy_idx" ON "TrainTicket"("paidBy");

-- CreateIndex
CREATE INDEX "TrainTicket_tenantId_ticketStatus_journeyDate_idx" ON "TrainTicket"("tenantId", "ticketStatus", "journeyDate");

-- CreateIndex
CREATE INDEX "TrainTicket_tenantId_approvalStatus_updatedAt_idx" ON "TrainTicket"("tenantId", "approvalStatus", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "TrainTicketHistory_ticketId_idx" ON "TrainTicketHistory"("ticketId");

-- CreateIndex
CREATE INDEX "TrainTicketHistory_ticketId_createdAt_idx" ON "TrainTicketHistory"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainTemplate_tenantId_idx" ON "TrainTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "TrainTemplate_tripId_departureDate_idx" ON "TrainTemplate"("tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "TrainTemplate_tripId_departureDate_source_destination_key" ON "TrainTemplate"("tripId", "departureDate", "source", "destination");

-- CreateIndex
CREATE INDEX "TrainTicketAlert_tenantId_idx" ON "TrainTicketAlert"("tenantId");

-- CreateIndex
CREATE INDEX "TrainTicketAlert_bookingId_idx" ON "TrainTicketAlert"("bookingId");

-- CreateIndex
CREATE INDEX "TrainTicketAlert_bookingId_alertType_idx" ON "TrainTicketAlert"("bookingId", "alertType");

-- CreateIndex
CREATE INDEX "TrainTicketAlert_ticketId_idx" ON "TrainTicketAlert"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainTicketAlert_alertType_dedupeKey_key" ON "TrainTicketAlert"("alertType", "dedupeKey");

-- CreateIndex
CREATE INDEX "TrainTicketGroup_tenantId_idx" ON "TrainTicketGroup"("tenantId");

-- CreateIndex
CREATE INDEX "TrainTicketGroup_bookingId_idx" ON "TrainTicketGroup"("bookingId");

-- CreateIndex
CREATE INDEX "TrainTicketApproval_trainTicketId_createdAt_idx" ON "TrainTicketApproval"("trainTicketId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainTicketApproval_tenantId_idx" ON "TrainTicketApproval"("tenantId");

-- CreateIndex
CREATE INDEX "TicketApproval_bookingId_idx" ON "TicketApproval"("bookingId");

-- CreateIndex
CREATE INDEX "TicketApproval_status_idx" ON "TicketApproval"("status");

-- CreateIndex
CREATE INDEX "TrainTicketAlertEvent_tenantId_idx" ON "TrainTicketAlertEvent"("tenantId");

-- CreateIndex
CREATE INDEX "TrainTicketAlertEvent_bookingId_alertType_idx" ON "TrainTicketAlertEvent"("bookingId", "alertType");

-- CreateIndex
CREATE INDEX "TrainTicketAlertEvent_trainTicketId_idx" ON "TrainTicketAlertEvent"("trainTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainTicketAlertEvent_alertType_dedupeKey_key" ON "TrainTicketAlertEvent"("alertType", "dedupeKey");

-- CreateIndex
CREATE INDEX "AccountingEntry_tenantId_idx" ON "AccountingEntry"("tenantId");

-- CreateIndex
CREATE INDEX "AccountingEntry_bookingId_idx" ON "AccountingEntry"("bookingId");

-- CreateIndex
CREATE INDEX "AccountingEntry_salespersonId_idx" ON "AccountingEntry"("salespersonId");

-- CreateIndex
CREATE INDEX "AccountingEntry_collectionAccountId_idx" ON "AccountingEntry"("collectionAccountId");

-- CreateIndex
CREATE INDEX "AccountingEntry_status_idx" ON "AccountingEntry"("status");

-- CreateIndex
CREATE INDEX "AccountingEntryLog_accountingEntryId_idx" ON "AccountingEntryLog"("accountingEntryId");

-- CreateIndex
CREATE INDEX "AccountingAlertDedupe_bookingId_idx" ON "AccountingAlertDedupe"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingAlertDedupe_alertType_bookingId_key" ON "AccountingAlertDedupe"("alertType", "bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsVendor_vendorCode_key" ON "OpsVendor"("vendorCode");

-- CreateIndex
CREATE INDEX "OpsVendor_tenantId_idx" ON "OpsVendor"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorRoom_tenantId_idx" ON "OpsVendorRoom"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorRoom_vendorId_idx" ON "OpsVendorRoom"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorSeasonalRate_tenantId_idx" ON "OpsVendorSeasonalRate"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorSeasonalRate_vendorId_idx" ON "OpsVendorSeasonalRate"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorDestination_tenantId_idx" ON "OpsVendorDestination"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorDestination_vendorId_idx" ON "OpsVendorDestination"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorContact_tenantId_idx" ON "OpsVendorContact"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorContact_vendorId_idx" ON "OpsVendorContact"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorContract_tenantId_idx" ON "OpsVendorContract"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorContract_vendorId_idx" ON "OpsVendorContract"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorCalendar_tenantId_idx" ON "OpsVendorCalendar"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorCalendar_vendorId_idx" ON "OpsVendorCalendar"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsVendorCalendar_vendorId_date_key" ON "OpsVendorCalendar"("vendorId", "date");

-- CreateIndex
CREATE INDEX "OpsVendorLedger_tenantId_idx" ON "OpsVendorLedger"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorLedger_vendorId_idx" ON "OpsVendorLedger"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorPriceHistory_tenantId_idx" ON "OpsVendorPriceHistory"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorPriceHistory_vendorId_idx" ON "OpsVendorPriceHistory"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorTimeline_tenantId_idx" ON "OpsVendorTimeline"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorTimeline_vendorId_idx" ON "OpsVendorTimeline"("vendorId");

-- CreateIndex
CREATE INDEX "OpsHotelBooking_tenantId_idx" ON "OpsHotelBooking"("tenantId");

-- CreateIndex
CREATE INDEX "OpsHotelBooking_tripId_departureDate_idx" ON "OpsHotelBooking"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsVendorHotelRate_vendorId_idx" ON "OpsVendorHotelRate"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVendorHotelRate_validFrom_validUntil_idx" ON "OpsVendorHotelRate"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "DepartureHotelRateOverride_departureHotelId_idx" ON "DepartureHotelRateOverride"("departureHotelId");

-- CreateIndex
CREATE INDEX "OpsRoomInventory_tenantId_idx" ON "OpsRoomInventory"("tenantId");

-- CreateIndex
CREATE INDEX "OpsRoomInventory_tripId_departureDate_idx" ON "OpsRoomInventory"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsTransportFleet_tenantId_idx" ON "OpsTransportFleet"("tenantId");

-- CreateIndex
CREATE INDEX "OpsTransportFleet_tripId_departureDate_idx" ON "OpsTransportFleet"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsGuidePayment_tenantId_idx" ON "OpsGuidePayment"("tenantId");

-- CreateIndex
CREATE INDEX "OpsGuidePayment_tripId_departureDate_idx" ON "OpsGuidePayment"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsMiscExpense_tripId_departureDate_idx" ON "OpsMiscExpense"("tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "OpsSeatConfig_tenantId_tripId_departureDate_key" ON "OpsSeatConfig"("tenantId", "tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsSOPTemplate_tenantId_destination_idx" ON "OpsSOPTemplate"("tenantId", "destination");

-- CreateIndex
CREATE INDEX "OpsSopTemplate_tenantId_idx" ON "OpsSopTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "OpsSopTemplate_tripId_idx" ON "OpsSopTemplate"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsSopTemplate_tenantId_tripId_key" ON "OpsSopTemplate"("tenantId", "tripId");

-- CreateIndex
CREATE INDEX "OpsSopVersion_tenantId_idx" ON "OpsSopVersion"("tenantId");

-- CreateIndex
CREATE INDEX "OpsSopVersion_templateId_idx" ON "OpsSopVersion"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsSopVersion_templateId_versionNumber_key" ON "OpsSopVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "OpsSopTaskTemplate_tenantId_idx" ON "OpsSopTaskTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "OpsSopTaskTemplate_versionId_stage_idx" ON "OpsSopTaskTemplate"("versionId", "stage");

-- CreateIndex
CREATE INDEX "OpsTripChecklist_tripId_departureDate_stage_idx" ON "OpsTripChecklist"("tripId", "departureDate", "stage");

-- CreateIndex
CREATE INDEX "OpsTripChecklist_sopVersionId_idx" ON "OpsTripChecklist"("sopVersionId");

-- CreateIndex
CREATE INDEX "OpsTripChecklist_sopTaskTemplateId_idx" ON "OpsTripChecklist"("sopTaskTemplateId");

-- CreateIndex
CREATE INDEX "OpsChecklistActivity_tenantId_idx" ON "OpsChecklistActivity"("tenantId");

-- CreateIndex
CREATE INDEX "OpsChecklistActivity_checklistItemId_idx" ON "OpsChecklistActivity"("checklistItemId");

-- CreateIndex
CREATE INDEX "OpsIncidentLog_tripId_departureDate_idx" ON "OpsIncidentLog"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsIncidentActivity_tenantId_idx" ON "OpsIncidentActivity"("tenantId");

-- CreateIndex
CREATE INDEX "OpsIncidentActivity_incidentId_idx" ON "OpsIncidentActivity"("incidentId");

-- CreateIndex
CREATE INDEX "OpsAllocationRun_tenantId_tripId_departureDate_idx" ON "OpsAllocationRun"("tenantId", "tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsAllocationOverride_allocationRunId_idx" ON "OpsAllocationOverride"("allocationRunId");

-- CreateIndex
CREATE INDEX "OpsVehicleAllocation_tripId_departureDate_idx" ON "OpsVehicleAllocation"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsVehicleAllocation_fleetId_idx" ON "OpsVehicleAllocation"("fleetId");

-- CreateIndex
CREATE INDEX "OpsVehicleAllocation_bookingId_idx" ON "OpsVehicleAllocation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsVehicleAllocation_tripId_departureDate_bookingId_travele_key" ON "OpsVehicleAllocation"("tripId", "departureDate", "bookingId", "travelerName");

-- CreateIndex
CREATE INDEX "OpsRoomAllocation_tripId_departureDate_idx" ON "OpsRoomAllocation"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsRoomAllocation_hotelBookingId_idx" ON "OpsRoomAllocation"("hotelBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsRoomAllocation_tripId_departureDate_bookingId_travelerNa_key" ON "OpsRoomAllocation"("tripId", "departureDate", "bookingId", "travelerName");

-- CreateIndex
CREATE INDEX "OpsDayItinerary_tripId_departureDate_idx" ON "OpsDayItinerary"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsTripExpense_tripId_departureDate_idx" ON "OpsTripExpense"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsSopLibrary_tenantId_idx" ON "OpsSopLibrary"("tenantId");

-- CreateIndex
CREATE INDEX "OpsSopLibrary_destination_idx" ON "OpsSopLibrary"("destination");

-- CreateIndex
CREATE INDEX "OpsTripLeader_tenantId_tripId_departureDate_idx" ON "OpsTripLeader"("tenantId", "tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "OpsTripLeader_tenantId_tripId_departureDate_leaderPhone_key" ON "OpsTripLeader"("tenantId", "tripId", "departureDate", "leaderPhone");

-- CreateIndex
CREATE INDEX "OpsTripLeaderActivity_tenantId_idx" ON "OpsTripLeaderActivity"("tenantId");

-- CreateIndex
CREATE INDEX "OpsTripLeaderActivity_leaderAssignmentId_idx" ON "OpsTripLeaderActivity"("leaderAssignmentId");

-- CreateIndex
CREATE INDEX "BookingActivityLog_bookingId_idx" ON "BookingActivityLog"("bookingId");

-- CreateIndex
CREATE INDEX "BookingActivityLog_createdAt_idx" ON "BookingActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "BookingTask_bookingId_idx" ON "BookingTask"("bookingId");

-- CreateIndex
CREATE INDEX "BookingTask_assignedById_idx" ON "BookingTask"("assignedById");

-- CreateIndex
CREATE INDEX "BookingTask_assignedToId_idx" ON "BookingTask"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNavState_userId_key" ON "UserNavState"("userId");

-- CreateIndex
CREATE INDEX "KnowledgeSection_tripId_idx" ON "KnowledgeSection"("tripId");

-- CreateIndex
CREATE INDEX "KnowledgeSection_tabKey_idx" ON "KnowledgeSection"("tabKey");

-- CreateIndex
CREATE INDEX "TripNotice_tripId_idx" ON "TripNotice"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripNoticeAck_noticeId_userId_key" ON "TripNoticeAck"("noticeId", "userId");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "EmailLog_bookingId_idx" ON "EmailLog"("bookingId");

-- CreateIndex
CREATE INDEX "EmailLog_inquiryId_idx" ON "EmailLog"("inquiryId");

-- CreateIndex
CREATE INDEX "EmailLog_trainTicketId_idx" ON "EmailLog"("trainTicketId");

-- CreateIndex
CREATE INDEX "EmailLog_senderId_idx" ON "EmailLog"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageState_name_key" ON "PackageState"("name");

-- CreateIndex
CREATE INDEX "PackageState_tenantId_idx" ON "PackageState"("tenantId");

-- CreateIndex
CREATE INDEX "PackageCity_tenantId_idx" ON "PackageCity"("tenantId");

-- CreateIndex
CREATE INDEX "PackageCity_stateId_idx" ON "PackageCity"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageCity_tenantId_stateId_name_key" ON "PackageCity"("tenantId", "stateId", "name");

-- CreateIndex
CREATE INDEX "PackageVendor_tenantId_idx" ON "PackageVendor"("tenantId");

-- CreateIndex
CREATE INDEX "PackageVendor_type_idx" ON "PackageVendor"("type");

-- CreateIndex
CREATE INDEX "PackageHotel_tenantId_idx" ON "PackageHotel"("tenantId");

-- CreateIndex
CREATE INDEX "PackageHotel_cityId_idx" ON "PackageHotel"("cityId");

-- CreateIndex
CREATE INDEX "PackageHotel_category_idx" ON "PackageHotel"("category");

-- CreateIndex
CREATE INDEX "PackageHotelTariff_hotelId_idx" ON "PackageHotelTariff"("hotelId");

-- CreateIndex
CREATE INDEX "PackageHotelTariff_startDate_endDate_idx" ON "PackageHotelTariff"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "PackageVehicle_tenantId_idx" ON "PackageVehicle"("tenantId");

-- CreateIndex
CREATE INDEX "PackageVehicle_cityId_idx" ON "PackageVehicle"("cityId");

-- CreateIndex
CREATE INDEX "PackageVehicleTariff_vehicleId_idx" ON "PackageVehicleTariff"("vehicleId");

-- CreateIndex
CREATE INDEX "PackageTransferRoute_tenantId_idx" ON "PackageTransferRoute"("tenantId");

-- CreateIndex
CREATE INDEX "PackageTransferRoute_fromCityId_idx" ON "PackageTransferRoute"("fromCityId");

-- CreateIndex
CREATE INDEX "PackageTransferRoute_toCityId_idx" ON "PackageTransferRoute"("toCityId");

-- CreateIndex
CREATE INDEX "PackageActivity_tenantId_idx" ON "PackageActivity"("tenantId");

-- CreateIndex
CREATE INDEX "PackageActivity_cityId_idx" ON "PackageActivity"("cityId");

-- CreateIndex
CREATE INDEX "PackageMealPlan_tenantId_idx" ON "PackageMealPlan"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageDraft_draftId_key" ON "PackageDraft"("draftId");

-- CreateIndex
CREATE INDEX "PackageDraft_tenantId_idx" ON "PackageDraft"("tenantId");

-- CreateIndex
CREATE INDEX "PackageDraft_status_idx" ON "PackageDraft"("status");

-- CreateIndex
CREATE INDEX "PackageDraft_salesAdminId_idx" ON "PackageDraft"("salesAdminId");

-- CreateIndex
CREATE INDEX "PackageDraft_tenantId_status_createdAt_idx" ON "PackageDraft"("tenantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PackageItineraryDay_draftId_idx" ON "PackageItineraryDay"("draftId");

-- CreateIndex
CREATE INDEX "PackageItineraryDay_dayNumber_idx" ON "PackageItineraryDay"("dayNumber");

-- CreateIndex
CREATE INDEX "PackageItineraryItem_dayId_idx" ON "PackageItineraryItem"("dayId");

-- CreateIndex
CREATE INDEX "PackageActivityLog_tenantId_createdAt_idx" ON "PackageActivityLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "PackageActivityLog_draftId_idx" ON "PackageActivityLog"("draftId");

-- CreateIndex
CREATE INDEX "TicketingSop_tripId_idx" ON "TicketingSop"("tripId");

-- CreateIndex
CREATE INDEX "TicketingSop_category_idx" ON "TicketingSop"("category");

-- CreateIndex
CREATE INDEX "TicketingSopItem_sopId_idx" ON "TicketingSopItem"("sopId");

-- CreateIndex
CREATE INDEX "TicketingLink_tripId_idx" ON "TicketingLink"("tripId");

-- CreateIndex
CREATE INDEX "Itinerary_tripId_idx" ON "Itinerary"("tripId");

-- CreateIndex
CREATE INDEX "ItineraryDay_itineraryId_idx" ON "ItineraryDay"("itineraryId");

-- CreateIndex
CREATE INDEX "ItineraryRouteMap_itineraryId_idx" ON "ItineraryRouteMap"("itineraryId");

-- CreateIndex
CREATE INDEX "ItineraryInclusion_itineraryId_idx" ON "ItineraryInclusion"("itineraryId");

-- CreateIndex
CREATE INDEX "ItineraryExclusion_itineraryId_idx" ON "ItineraryExclusion"("itineraryId");

-- CreateIndex
CREATE INDEX "ItineraryNote_itineraryId_idx" ON "ItineraryNote"("itineraryId");

-- CreateIndex
CREATE INDEX "TripSop_tripId_idx" ON "TripSop"("tripId");

-- CreateIndex
CREATE INDEX "TripSopVersion_sopId_createdAt_idx" ON "TripSopVersion"("sopId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripSopVersion_sopId_version_key" ON "TripSopVersion"("sopId", "version");

-- CreateIndex
CREATE INDEX "TripSopItem_sopId_idx" ON "TripSopItem"("sopId");

-- CreateIndex
CREATE INDEX "TripDocument_tripId_idx" ON "TripDocument"("tripId");

-- CreateIndex
CREATE INDEX "TripDocumentVersion_documentId_createdAt_idx" ON "TripDocumentVersion"("documentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripDocumentVersion_documentId_version_key" ON "TripDocumentVersion"("documentId", "version");

-- CreateIndex
CREATE INDEX "KnowledgeItem_tripId_idx" ON "KnowledgeItem"("tripId");

-- CreateIndex
CREATE INDEX "KnowledgeItem_category_idx" ON "KnowledgeItem"("category");

-- CreateIndex
CREATE INDEX "KnowledgeItem_status_idx" ON "KnowledgeItem"("status");

-- CreateIndex
CREATE INDEX "TravelQuestion_tripId_idx" ON "TravelQuestion"("tripId");

-- CreateIndex
CREATE INDEX "TravelQuestion_status_idx" ON "TravelQuestion"("status");

-- CreateIndex
CREATE INDEX "TripGallery_tripId_idx" ON "TripGallery"("tripId");

-- CreateIndex
CREATE INDEX "TripNote_tripId_idx" ON "TripNote"("tripId");

-- CreateIndex
CREATE INDEX "TripNote_category_idx" ON "TripNote"("category");

-- CreateIndex
CREATE INDEX "Announcement_tenantId_idx" ON "Announcement"("tenantId");

-- CreateIndex
CREATE INDEX "OpsActivity_tenantId_idx" ON "OpsActivity"("tenantId");

-- CreateIndex
CREATE INDEX "OpsActivity_tripId_departureDate_idx" ON "OpsActivity"("tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "activity_masters_name_key" ON "activity_masters"("name");

-- CreateIndex
CREATE INDEX "activity_masters_category_status_idx" ON "activity_masters"("category", "status");

-- CreateIndex
CREATE INDEX "activity_masters_name_idx" ON "activity_masters"("name");

-- CreateIndex
CREATE INDEX "activity_documents_activity_id_docType_idx" ON "activity_documents"("activity_id", "docType");

-- CreateIndex
CREATE INDEX "activity_vendor_contracts_activity_id_idx" ON "activity_vendor_contracts"("activity_id");

-- CreateIndex
CREATE INDEX "activity_vendor_contracts_vendor_id_idx" ON "activity_vendor_contracts"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_vendor_contracts_activity_id_vendor_id_valid_from__key" ON "activity_vendor_contracts"("activity_id", "vendor_id", "valid_from", "valid_to", "seasonType");

-- CreateIndex
CREATE INDEX "trip_activity_templates_trip_id_day_number_idx" ON "trip_activity_templates"("trip_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "trip_activity_templates_trip_id_day_number_activity_id_key" ON "trip_activity_templates"("trip_id", "day_number", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "departure_activities_voucher_number_key" ON "departure_activities"("voucher_number");

-- CreateIndex
CREATE INDEX "departure_activities_trip_id_departure_date_idx" ON "departure_activities"("trip_id", "departure_date");

-- CreateIndex
CREATE INDEX "departure_activities_activity_id_idx" ON "departure_activities"("activity_id");

-- CreateIndex
CREATE INDEX "passenger_activity_allocations_booking_id_idx" ON "passenger_activity_allocations"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "passenger_activity_allocations_departure_activity_id_bookin_key" ON "passenger_activity_allocations"("departure_activity_id", "booking_id", "passenger_index");

-- CreateIndex
CREATE INDEX "OpsVendorPayment_tenantId_idx" ON "OpsVendorPayment"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorPayment_tripId_departureDate_idx" ON "OpsVendorPayment"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsVendorPayment_collectionAccountId_idx" ON "OpsVendorPayment"("collectionAccountId");

-- CreateIndex
CREATE INDEX "OpsVendorPayment_approvalStatus_idx" ON "OpsVendorPayment"("approvalStatus");

-- CreateIndex
CREATE INDEX "OpsClientPayment_tenantId_idx" ON "OpsClientPayment"("tenantId");

-- CreateIndex
CREATE INDEX "OpsClientPayment_bookingId_idx" ON "OpsClientPayment"("bookingId");

-- CreateIndex
CREATE INDEX "OpsClientPayment_collectionAccountId_idx" ON "OpsClientPayment"("collectionAccountId");

-- CreateIndex
CREATE INDEX "OpsClientPayment_approvalStatus_idx" ON "OpsClientPayment"("approvalStatus");

-- CreateIndex
CREATE INDEX "OpsDocument_tenantId_idx" ON "OpsDocument"("tenantId");

-- CreateIndex
CREATE INDEX "OpsDocument_tripId_departureDate_idx" ON "OpsDocument"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsMessage_tenantId_idx" ON "OpsMessage"("tenantId");

-- CreateIndex
CREATE INDEX "OpsMessage_tripId_departureDate_idx" ON "OpsMessage"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsAllocationAudit_tenantId_idx" ON "OpsAllocationAudit"("tenantId");

-- CreateIndex
CREATE INDEX "OpsAllocationAudit_tripId_departureDate_idx" ON "OpsAllocationAudit"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "OpsAccommodationRate_vendorId_idx" ON "OpsAccommodationRate"("vendorId");

-- CreateIndex
CREATE INDEX "OpsAccommodationRate_city_idx" ON "OpsAccommodationRate"("city");

-- CreateIndex
CREATE INDEX "OpsAccommodationRate_sharingType_idx" ON "OpsAccommodationRate"("sharingType");

-- CreateIndex
CREATE INDEX "OpsVendorVehicle_tenantId_idx" ON "OpsVendorVehicle"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVendorVehicle_vendorId_idx" ON "OpsVendorVehicle"("vendorId");

-- CreateIndex
CREATE INDEX "OpsRoutePricingGroup_tenantId_idx" ON "OpsRoutePricingGroup"("tenantId");

-- CreateIndex
CREATE INDEX "OpsRoutePricingGroup_vendorId_idx" ON "OpsRoutePricingGroup"("vendorId");

-- CreateIndex
CREATE INDEX "OpsVehicleRate_tenantId_idx" ON "OpsVehicleRate"("tenantId");

-- CreateIndex
CREATE INDEX "OpsVehicleRate_routePricingGroupId_idx" ON "OpsVehicleRate"("routePricingGroupId");

-- CreateIndex
CREATE INDEX "OpsVehicleRate_vehicleId_idx" ON "OpsVehicleRate"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsVehicleRate_routePricingGroupId_vehicleId_key" ON "OpsVehicleRate"("routePricingGroupId", "vehicleId");

-- CreateIndex
CREATE INDEX "OpsTransportRate_vendorId_idx" ON "OpsTransportRate"("vendorId");

-- CreateIndex
CREATE INDEX "OpsTransportRate_tripCode_idx" ON "OpsTransportRate"("tripCode");

-- CreateIndex
CREATE INDEX "OpsVendorAdditionalCharge_vendorId_idx" ON "OpsVendorAdditionalCharge"("vendorId");

-- CreateIndex
CREATE INDEX "OpsDepartureVendorAllocation_departureId_idx" ON "OpsDepartureVendorAllocation"("departureId");

-- CreateIndex
CREATE INDEX "OpsDepartureVendorAllocation_vendorId_idx" ON "OpsDepartureVendorAllocation"("vendorId");

-- CreateIndex
CREATE INDEX "OpsTripVendor_tripId_idx" ON "OpsTripVendor"("tripId");

-- CreateIndex
CREATE INDEX "OpsTripVendor_vendorId_idx" ON "OpsTripVendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsTripVendor_tripId_vendorId_category_key" ON "OpsTripVendor"("tripId", "vendorId", "category");

-- CreateIndex
CREATE INDEX "OpsTripVendorRate_tripVendorId_idx" ON "OpsTripVendorRate"("tripVendorId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryVendor_vendorCode_key" ON "DirectoryVendor"("vendorCode");

-- CreateIndex
CREATE INDEX "DirectoryVendor_type_isActive_idx" ON "DirectoryVendor"("type", "isActive");

-- CreateIndex
CREATE INDEX "DirectoryVendor_state_city_idx" ON "DirectoryVendor"("state", "city");

-- CreateIndex
CREATE INDEX "DirectoryVendorContact_vendorId_idx" ON "DirectoryVendorContact"("vendorId");

-- CreateIndex
CREATE INDEX "DirectoryVendorRoomRate_vendorId_sharingType_idx" ON "DirectoryVendorRoomRate"("vendorId", "sharingType");

-- CreateIndex
CREATE INDEX "DirectoryVendorRoomRate_validFrom_validTo_idx" ON "DirectoryVendorRoomRate"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "DirectoryVendorTransportRate_vendorId_vehicleType_idx" ON "DirectoryVendorTransportRate"("vendorId", "vehicleType");

-- CreateIndex
CREATE INDEX "DirectoryVendorTransportRate_validFrom_validTo_idx" ON "DirectoryVendorTransportRate"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "DirectoryTripVendorMapping_tripId_departureDate_idx" ON "DirectoryTripVendorMapping"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "DirectoryTripVendorMapping_vendorId_idx" ON "DirectoryTripVendorMapping"("vendorId");

-- CreateIndex
CREATE INDEX "DirectoryTripCostSnapshot_tripId_departureDate_idx" ON "DirectoryTripCostSnapshot"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "DirectoryVendorContract_vendorId_idx" ON "DirectoryVendorContract"("vendorId");

-- CreateIndex
CREATE INDEX "DirectoryVendorPayment_vendorId_idx" ON "DirectoryVendorPayment"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelDeskWorkspace_tripId_key" ON "TravelDeskWorkspace"("tripId");

-- CreateIndex
CREATE INDEX "TravelDeskWorkspace_tripId_idx" ON "TravelDeskWorkspace"("tripId");

-- CreateIndex
CREATE INDEX "TravelDeskCategory_workspaceId_idx" ON "TravelDeskCategory"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskArticle_workspaceId_idx" ON "TravelDeskArticle"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskArticle_categoryId_idx" ON "TravelDeskArticle"("categoryId");

-- CreateIndex
CREATE INDEX "TravelDeskArticle_status_idx" ON "TravelDeskArticle"("status");

-- CreateIndex
CREATE INDEX "TravelDeskArticleVersion_articleId_createdAt_idx" ON "TravelDeskArticleVersion"("articleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TravelDeskArticleVersion_articleId_version_key" ON "TravelDeskArticleVersion"("articleId", "version");

-- CreateIndex
CREATE INDEX "TravelDeskVendorLink_workspaceId_idx" ON "TravelDeskVendorLink"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskVendorLink_vendorId_idx" ON "TravelDeskVendorLink"("vendorId");

-- CreateIndex
CREATE INDEX "TravelDeskVendorLink_departureDate_idx" ON "TravelDeskVendorLink"("departureDate");

-- CreateIndex
CREATE INDEX "TravelDeskNotice_workspaceId_idx" ON "TravelDeskNotice"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskNotice_departureDate_idx" ON "TravelDeskNotice"("departureDate");

-- CreateIndex
CREATE INDEX "TravelDeskNotice_status_idx" ON "TravelDeskNotice"("status");

-- CreateIndex
CREATE INDEX "TravelDeskNoticeAck_userId_acknowledgedAt_idx" ON "TravelDeskNoticeAck"("userId", "acknowledgedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TravelDeskNoticeAck_noticeId_userId_key" ON "TravelDeskNoticeAck"("noticeId", "userId");

-- CreateIndex
CREATE INDEX "TravelDeskLearning_workspaceId_idx" ON "TravelDeskLearning"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskLearning_departureDate_idx" ON "TravelDeskLearning"("departureDate");

-- CreateIndex
CREATE INDEX "TravelDeskAuditLog_workspaceId_idx" ON "TravelDeskAuditLog"("workspaceId");

-- CreateIndex
CREATE INDEX "TravelDeskAuditLog_entityType_entityId_idx" ON "TravelDeskAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PaymentReceivingAccount_tenantId_idx" ON "PaymentReceivingAccount"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentReceivingAccount_tenantId_isActive_isApproved_idx" ON "PaymentReceivingAccount"("tenantId", "isActive", "isApproved");

-- CreateIndex
CREATE INDEX "CollectionAccountSubmission_tenantId_idx" ON "CollectionAccountSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "CollectionAccountSubmission_accountId_idx" ON "CollectionAccountSubmission"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StationPaymentCollection_receiptNumber_key" ON "StationPaymentCollection"("receiptNumber");

-- CreateIndex
CREATE INDEX "StationPaymentCollection_tenantId_idx" ON "StationPaymentCollection"("tenantId");

-- CreateIndex
CREATE INDEX "StationPaymentCollection_bookingId_idx" ON "StationPaymentCollection"("bookingId");

-- CreateIndex
CREATE INDEX "StationPaymentCollection_tripId_departureDate_idx" ON "StationPaymentCollection"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "StationPaymentCollection_collectedByAdminId_idx" ON "StationPaymentCollection"("collectedByAdminId");

-- CreateIndex
CREATE INDEX "StationPaymentCollection_utrNumber_idx" ON "StationPaymentCollection"("utrNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StationPaymentCollection_tenantId_utrNumber_key" ON "StationPaymentCollection"("tenantId", "utrNumber");

-- CreateIndex
CREATE INDEX "StationCashHandover_tenantId_idx" ON "StationCashHandover"("tenantId");

-- CreateIndex
CREATE INDEX "StationCashHandover_collectorId_idx" ON "StationCashHandover"("collectorId");

-- CreateIndex
CREATE INDEX "StationCashHandover_tripId_departureDate_idx" ON "StationCashHandover"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "EmployeeCollectionSubmission_tenantId_idx" ON "EmployeeCollectionSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "EmployeeCollectionSubmission_employeeAdminId_idx" ON "EmployeeCollectionSubmission"("employeeAdminId");

-- CreateIndex
CREATE INDEX "TripKnowledge_tripId_section_idx" ON "TripKnowledge"("tripId", "section");

-- CreateIndex
CREATE INDEX "TripKnowledge_createdAt_idx" ON "TripKnowledge"("createdAt");

-- CreateIndex
CREATE INDEX "TripSOP_tripId_idx" ON "TripSOP"("tripId");

-- CreateIndex
CREATE INDEX "TripSOP_tripId_category_idx" ON "TripSOP"("tripId", "category");

-- CreateIndex
CREATE INDEX "TripActivityLog_tripId_idx" ON "TripActivityLog"("tripId");

-- CreateIndex
CREATE INDEX "TripActivityLog_createdAt_idx" ON "TripActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_isCustom_idx" ON "Role"("isCustom");

-- CreateIndex
CREATE INDEX "Role_isSystem_idx" ON "Role"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_key" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_key" ON "UserRoleAssignment"("userId", "roleId");

-- CreateIndex
CREATE INDEX "UserCustomPermission_userId_idx" ON "UserCustomPermission"("userId");

-- CreateIndex
CREATE INDEX "UserCustomPermission_permissionId_idx" ON "UserCustomPermission"("permissionId");

-- CreateIndex
CREATE INDEX "UserCustomPermission_expiresAt_idx" ON "UserCustomPermission"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserCustomPermission_userId_permissionId_key" ON "UserCustomPermission"("userId", "permissionId");

-- CreateIndex
CREATE INDEX "PermissionDelegation_fromUserId_idx" ON "PermissionDelegation"("fromUserId");

-- CreateIndex
CREATE INDEX "PermissionDelegation_toUserId_idx" ON "PermissionDelegation"("toUserId");

-- CreateIndex
CREATE INDEX "PermissionDelegation_expiresAt_idx" ON "PermissionDelegation"("expiresAt");

-- CreateIndex
CREATE INDEX "RbacAuditLog_tenantId_idx" ON "RbacAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "RbacAuditLog_userId_idx" ON "RbacAuditLog"("userId");

-- CreateIndex
CREATE INDEX "RbacAuditLog_action_idx" ON "RbacAuditLog"("action");

-- CreateIndex
CREATE INDEX "RbacAuditLog_createdAt_idx" ON "RbacAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "trips_slug_key" ON "trips"("slug");

-- CreateIndex
CREATE INDEX "trips_created_at_idx" ON "trips"("created_at");

-- CreateIndex
CREATE INDEX "trips_month_idx" ON "trips"("month");

-- CreateIndex
CREATE UNIQUE INDEX "trip_details_trip_id_key" ON "trip_details"("trip_id");

-- CreateIndex
CREATE INDEX "trip_details_trip_id_idx" ON "trip_details"("trip_id");

-- CreateIndex
CREATE INDEX "travel_modes_trip_id_idx" ON "travel_modes"("trip_id");

-- CreateIndex
CREATE INDEX "room_sharing_trip_id_idx" ON "room_sharing"("trip_id");

-- CreateIndex
CREATE INDEX "itinerary_trip_id_idx" ON "itinerary"("trip_id");

-- CreateIndex
CREATE INDEX "itinerary_day_idx" ON "itinerary"("day");

-- CreateIndex
CREATE INDEX "inclusions_trip_id_idx" ON "inclusions"("trip_id");

-- CreateIndex
CREATE INDEX "exclusions_trip_id_idx" ON "exclusions"("trip_id");

-- CreateIndex
CREATE INDEX "stays_trip_id_idx" ON "stays"("trip_id");

-- CreateIndex
CREATE INDEX "highlights_trip_id_idx" ON "highlights"("trip_id");

-- CreateIndex
CREATE INDEX "reviews_trip_id_idx" ON "reviews"("trip_id");

-- CreateIndex
CREATE INDEX "reviews_featured_idx" ON "reviews"("featured");

-- CreateIndex
CREATE INDEX "reviews_date_idx" ON "reviews"("date");

-- CreateIndex
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "stories_featured_idx" ON "stories"("featured");

-- CreateIndex
CREATE INDEX "stories_published_at_idx" ON "stories"("published_at");

-- CreateIndex
CREATE INDEX "destinations_order_idx" ON "destinations"("order");

-- CreateIndex
CREATE INDEX "faqs_trip_id_idx" ON "faqs"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "departures_departureCode_key" ON "departures"("departureCode");

-- CreateIndex
CREATE INDEX "departures_tenantId_tripId_departureDate_idx" ON "departures"("tenantId", "tripId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "departures_tripId_departureDate_key" ON "departures"("tripId", "departureDate");

-- CreateIndex
CREATE INDEX "RefundTransaction_tenantId_idx" ON "RefundTransaction"("tenantId");

-- CreateIndex
CREATE INDEX "RefundTransaction_bookingId_idx" ON "RefundTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "RefundTransaction_status_idx" ON "RefundTransaction"("status");

-- CreateIndex
CREATE INDEX "RefundTransaction_createdById_idx" ON "RefundTransaction"("createdById");

-- CreateIndex
CREATE INDEX "RefundTransaction_approvedById_idx" ON "RefundTransaction"("approvedById");

-- CreateIndex
CREATE INDEX "CreditNoteUsage_tenantId_idx" ON "CreditNoteUsage"("tenantId");

-- CreateIndex
CREATE INDEX "CreditNoteUsage_refundTransactionId_idx" ON "CreditNoteUsage"("refundTransactionId");

-- CreateIndex
CREATE INDEX "CreditNoteUsage_targetBookingId_idx" ON "CreditNoteUsage"("targetBookingId");

-- CreateIndex
CREATE INDEX "CreditNoteUsage_appliedById_idx" ON "CreditNoteUsage"("appliedById");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_tenantId_idx" ON "Coupon"("tenantId");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_status_idx" ON "Coupon"("status");

-- CreateIndex
CREATE INDEX "Coupon_createdById_idx" ON "Coupon"("createdById");

-- CreateIndex
CREATE INDEX "CouponRedemption_tenantId_idx" ON "CouponRedemption"("tenantId");

-- CreateIndex
CREATE INDEX "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");

-- CreateIndex
CREATE INDEX "CouponRedemption_bookingId_idx" ON "CouponRedemption"("bookingId");

-- CreateIndex
CREATE INDEX "Ticket_tenantId_idx" ON "Ticket"("tenantId");

-- CreateIndex
CREATE INDEX "Ticket_bookingId_idx" ON "Ticket"("bookingId");

-- CreateIndex
CREATE INDEX "Ticket_pnr_idx" ON "Ticket"("pnr");

-- CreateIndex
CREATE INDEX "Ticket_type_idx" ON "Ticket"("type");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_journeyDate_idx" ON "Ticket"("journeyDate");

-- CreateIndex
CREATE INDEX "ServiceRegistry_tenantId_idx" ON "ServiceRegistry"("tenantId");

-- CreateIndex
CREATE INDEX "ServiceRegistry_bookingId_idx" ON "ServiceRegistry"("bookingId");

-- CreateIndex
CREATE INDEX "ServiceRegistry_serviceType_idx" ON "ServiceRegistry"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceRegistry_status_idx" ON "ServiceRegistry"("status");

-- CreateIndex
CREATE INDEX "ServiceRegistry_vendorId_idx" ON "ServiceRegistry"("vendorId");

-- CreateIndex
CREATE INDEX "TaskAllotment_tenantId_idx" ON "TaskAllotment"("tenantId");

-- CreateIndex
CREATE INDEX "TaskAllotment_bookingId_idx" ON "TaskAllotment"("bookingId");

-- CreateIndex
CREATE INDEX "TaskAllotment_assignedToId_idx" ON "TaskAllotment"("assignedToId");

-- CreateIndex
CREATE INDEX "TaskAllotment_assignedById_idx" ON "TaskAllotment"("assignedById");

-- CreateIndex
CREATE INDEX "TaskAllotment_status_idx" ON "TaskAllotment"("status");

-- CreateIndex
CREATE INDEX "TaskAllotment_priority_idx" ON "TaskAllotment"("priority");

-- CreateIndex
CREATE INDEX "TaskAllotment_deadline_idx" ON "TaskAllotment"("deadline");

-- CreateIndex
CREATE INDEX "TaskComment_tenantId_idx" ON "TaskComment"("tenantId");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE INDEX "TaskComment_authorId_idx" ON "TaskComment"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "TripAccounting_bookingId_key" ON "TripAccounting"("bookingId");

-- CreateIndex
CREATE INDEX "TripAccounting_tenantId_idx" ON "TripAccounting"("tenantId");

-- CreateIndex
CREATE INDEX "TripAccounting_bookingId_idx" ON "TripAccounting"("bookingId");

-- CreateIndex
CREATE INDEX "TripAccounting_tripId_idx" ON "TripAccounting"("tripId");

-- CreateIndex
CREATE INDEX "TripAccounting_paymentStatus_idx" ON "TripAccounting"("paymentStatus");

-- CreateIndex
CREATE INDEX "TripAccounting_refundStatus_idx" ON "TripAccounting"("refundStatus");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "FinanceAuditLog_tenantId_idx" ON "FinanceAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "FinanceAuditLog_entityType_entityId_idx" ON "FinanceAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FinanceAuditLog_performedBy_idx" ON "FinanceAuditLog"("performedBy");

-- CreateIndex
CREATE INDEX "FinanceAuditLog_performedAt_idx" ON "FinanceAuditLog"("performedAt");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_salesAdminId_fkey" FOREIGN KEY ("salesAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripVendor" ADD CONSTRAINT "TripVendor_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripVendor" ADD CONSTRAINT "TripVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_salesAdminId_fkey" FOREIGN KEY ("salesAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDeparturePriceOverride" ADD CONSTRAINT "TripDeparturePriceOverride_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sourceBookingLinkId_fkey" FOREIGN KEY ("sourceBookingLinkId") REFERENCES "BookingLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_salesAdminId_fkey" FOREIGN KEY ("salesAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAttachment" ADD CONSTRAINT "BookingAttachment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingEmailLog" ADD CONSTRAINT "BookingEmailLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLink" ADD CONSTRAINT "BookingLink_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLinkEvent" ADD CONSTRAINT "BookingLinkEvent_bookingLinkId_fkey" FOREIGN KEY ("bookingLinkId") REFERENCES "BookingLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripAssignment" ADD CONSTRAINT "TripAssignment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripAssignment" ADD CONSTRAINT "TripAssignment_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_verifications" ADD CONSTRAINT "booking_verifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_verifications" ADD CONSTRAINT "booking_verifications_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_verification_logs" ADD CONSTRAINT "booking_verification_logs_bookingVerificationId_fkey" FOREIGN KEY ("bookingVerificationId") REFERENCES "booking_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_verification_logs" ADD CONSTRAINT "booking_verification_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_ticket_requests" ADD CONSTRAINT "train_ticket_requests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_ticket_travellers" ADD CONSTRAINT "train_ticket_travellers_trainTicketRequestId_fkey" FOREIGN KEY ("trainTicketRequestId") REFERENCES "train_ticket_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_ticket_logs" ADD CONSTRAINT "train_ticket_logs_trainTicketRequestId_fkey" FOREIGN KEY ("trainTicketRequestId") REFERENCES "train_ticket_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_ticket_logs" ADD CONSTRAINT "train_ticket_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicket" ADD CONSTRAINT "TrainTicket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicket" ADD CONSTRAINT "TrainTicket_supersedesTicketId_fkey" FOREIGN KEY ("supersedesTicketId") REFERENCES "TrainTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicket" ADD CONSTRAINT "TrainTicket_submittedByAdminId_fkey" FOREIGN KEY ("submittedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicket" ADD CONSTRAINT "TrainTicket_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TrainTicketGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketHistory" ADD CONSTRAINT "TrainTicketHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TrainTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketHistory" ADD CONSTRAINT "TrainTicketHistory_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTemplate" ADD CONSTRAINT "TrainTemplate_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketGroup" ADD CONSTRAINT "TrainTicketGroup_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketGroup" ADD CONSTRAINT "TrainTicketGroup_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketApproval" ADD CONSTRAINT "TrainTicketApproval_trainTicketId_fkey" FOREIGN KEY ("trainTicketId") REFERENCES "TrainTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainTicketApproval" ADD CONSTRAINT "TrainTicketApproval_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketApproval" ADD CONSTRAINT "TicketApproval_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketApproval" ADD CONSTRAINT "TicketApproval_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketApproval" ADD CONSTRAINT "TicketApproval_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntry" ADD CONSTRAINT "AccountingEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntry" ADD CONSTRAINT "AccountingEntry_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntry" ADD CONSTRAINT "AccountingEntry_actionedById_fkey" FOREIGN KEY ("actionedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntry" ADD CONSTRAINT "AccountingEntry_collectionAccountId_fkey" FOREIGN KEY ("collectionAccountId") REFERENCES "PaymentReceivingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntryLog" ADD CONSTRAINT "AccountingEntryLog_accountingEntryId_fkey" FOREIGN KEY ("accountingEntryId") REFERENCES "AccountingEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEntryLog" ADD CONSTRAINT "AccountingEntryLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorRoom" ADD CONSTRAINT "OpsVendorRoom_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorSeasonalRate" ADD CONSTRAINT "OpsVendorSeasonalRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorDestination" ADD CONSTRAINT "OpsVendorDestination_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorContact" ADD CONSTRAINT "OpsVendorContact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorContract" ADD CONSTRAINT "OpsVendorContract_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorCalendar" ADD CONSTRAINT "OpsVendorCalendar_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorLedger" ADD CONSTRAINT "OpsVendorLedger_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorPriceHistory" ADD CONSTRAINT "OpsVendorPriceHistory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorTimeline" ADD CONSTRAINT "OpsVendorTimeline_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsHotelBooking" ADD CONSTRAINT "OpsHotelBooking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsHotelBooking" ADD CONSTRAINT "OpsHotelBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorHotelRate" ADD CONSTRAINT "OpsVendorHotelRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartureHotelRateOverride" ADD CONSTRAINT "DepartureHotelRateOverride_departureHotelId_fkey" FOREIGN KEY ("departureHotelId") REFERENCES "OpsHotelBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRoomInventory" ADD CONSTRAINT "OpsRoomInventory_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTransportFleet" ADD CONSTRAINT "OpsTransportFleet_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTransportFleet" ADD CONSTRAINT "OpsTransportFleet_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsGuidePayment" ADD CONSTRAINT "OpsGuidePayment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsGuidePayment" ADD CONSTRAINT "OpsGuidePayment_guideAdminId_fkey" FOREIGN KEY ("guideAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsGuidePayment" ADD CONSTRAINT "OpsGuidePayment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsGuidePayment" ADD CONSTRAINT "OpsGuidePayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsMiscExpense" ADD CONSTRAINT "OpsMiscExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSeatConfig" ADD CONSTRAINT "OpsSeatConfig_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopTemplate" ADD CONSTRAINT "OpsSopTemplate_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopVersion" ADD CONSTRAINT "OpsSopVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OpsSopTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopTaskTemplate" ADD CONSTRAINT "OpsSopTaskTemplate_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OpsSopVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripChecklist" ADD CONSTRAINT "OpsTripChecklist_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripChecklist" ADD CONSTRAINT "OpsTripChecklist_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES "OpsSopTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripChecklist" ADD CONSTRAINT "OpsTripChecklist_sopVersionId_fkey" FOREIGN KEY ("sopVersionId") REFERENCES "OpsSopVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripChecklist" ADD CONSTRAINT "OpsTripChecklist_sopTaskTemplateId_fkey" FOREIGN KEY ("sopTaskTemplateId") REFERENCES "OpsSopTaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripChecklist" ADD CONSTRAINT "OpsTripChecklist_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsChecklistActivity" ADD CONSTRAINT "OpsChecklistActivity_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "OpsTripChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsChecklistActivity" ADD CONSTRAINT "OpsChecklistActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsIncidentLog" ADD CONSTRAINT "OpsIncidentLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsIncidentLog" ADD CONSTRAINT "OpsIncidentLog_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsIncidentLog" ADD CONSTRAINT "OpsIncidentLog_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsIncidentActivity" ADD CONSTRAINT "OpsIncidentActivity_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "OpsIncidentLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsIncidentActivity" ADD CONSTRAINT "OpsIncidentActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsAllocationRun" ADD CONSTRAINT "OpsAllocationRun_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsAllocationRun" ADD CONSTRAINT "OpsAllocationRun_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsAllocationOverride" ADD CONSTRAINT "OpsAllocationOverride_allocationRunId_fkey" FOREIGN KEY ("allocationRunId") REFERENCES "OpsAllocationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsAllocationOverride" ADD CONSTRAINT "OpsAllocationOverride_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVehicleAllocation" ADD CONSTRAINT "OpsVehicleAllocation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVehicleAllocation" ADD CONSTRAINT "OpsVehicleAllocation_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "OpsTransportFleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVehicleAllocation" ADD CONSTRAINT "OpsVehicleAllocation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRoomAllocation" ADD CONSTRAINT "OpsRoomAllocation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRoomAllocation" ADD CONSTRAINT "OpsRoomAllocation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDayItinerary" ADD CONSTRAINT "OpsDayItinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripExpense" ADD CONSTRAINT "OpsTripExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopLibrary" ADD CONSTRAINT "OpsSopLibrary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopLibrary" ADD CONSTRAINT "OpsSopLibrary_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsSopLibrary" ADD CONSTRAINT "OpsSopLibrary_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeader" ADD CONSTRAINT "OpsTripLeader_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeader" ADD CONSTRAINT "OpsTripLeader_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeader" ADD CONSTRAINT "OpsTripLeader_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeader" ADD CONSTRAINT "OpsTripLeader_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeaderActivity" ADD CONSTRAINT "OpsTripLeaderActivity_leaderAssignmentId_fkey" FOREIGN KEY ("leaderAssignmentId") REFERENCES "OpsTripLeader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripLeaderActivity" ADD CONSTRAINT "OpsTripLeaderActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingActivityLog" ADD CONSTRAINT "BookingActivityLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingActivityLog" ADD CONSTRAINT "BookingActivityLog_performedByAdminId_fkey" FOREIGN KEY ("performedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTask" ADD CONSTRAINT "BookingTask_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTask" ADD CONSTRAINT "BookingTask_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTask" ADD CONSTRAINT "BookingTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripNoticeAck" ADD CONSTRAINT "TripNoticeAck_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "TripNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_trainTicketId_fkey" FOREIGN KEY ("trainTicketId") REFERENCES "TrainTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageCity" ADD CONSTRAINT "PackageCity_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "PackageState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageHotel" ADD CONSTRAINT "PackageHotel_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "PackageCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageHotel" ADD CONSTRAINT "PackageHotel_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PackageVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageHotelTariff" ADD CONSTRAINT "PackageHotelTariff_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "PackageHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageVehicle" ADD CONSTRAINT "PackageVehicle_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "PackageCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageVehicle" ADD CONSTRAINT "PackageVehicle_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PackageVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageVehicleTariff" ADD CONSTRAINT "PackageVehicleTariff_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "PackageVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTransferRoute" ADD CONSTRAINT "PackageTransferRoute_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "PackageCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTransferRoute" ADD CONSTRAINT "PackageTransferRoute_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "PackageCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageActivity" ADD CONSTRAINT "PackageActivity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "PackageCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageActivity" ADD CONSTRAINT "PackageActivity_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PackageVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageMealPlan" ADD CONSTRAINT "PackageMealPlan_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "PackageVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDraft" ADD CONSTRAINT "PackageDraft_salesAdminId_fkey" FOREIGN KEY ("salesAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDraft" ADD CONSTRAINT "PackageDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDraft" ADD CONSTRAINT "PackageDraft_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItineraryDay" ADD CONSTRAINT "PackageItineraryDay_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "PackageDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItineraryDay" ADD CONSTRAINT "PackageItineraryDay_stayCityId_fkey" FOREIGN KEY ("stayCityId") REFERENCES "PackageCity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItineraryItem" ADD CONSTRAINT "PackageItineraryItem_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "PackageItineraryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketingSop" ADD CONSTRAINT "TicketingSop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketingSopItem" ADD CONSTRAINT "TicketingSopItem_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "TicketingSop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketingLink" ADD CONSTRAINT "TicketingLink_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryRouteMap" ADD CONSTRAINT "ItineraryRouteMap_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryInclusion" ADD CONSTRAINT "ItineraryInclusion_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryExclusion" ADD CONSTRAINT "ItineraryExclusion_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryNote" ADD CONSTRAINT "ItineraryNote_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSop" ADD CONSTRAINT "TripSop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSopVersion" ADD CONSTRAINT "TripSopVersion_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "TripSop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSopItem" ADD CONSTRAINT "TripSopItem_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "TripSop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDocument" ADD CONSTRAINT "TripDocument_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDocumentVersion" ADD CONSTRAINT "TripDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TripDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TripDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelQuestion" ADD CONSTRAINT "TravelQuestion_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripGallery" ADD CONSTRAINT "TripGallery_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripNote" ADD CONSTRAINT "TripNote_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsActivity" ADD CONSTRAINT "OpsActivity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsActivity" ADD CONSTRAINT "OpsActivity_responsibleGuideId_fkey" FOREIGN KEY ("responsibleGuideId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsActivity" ADD CONSTRAINT "OpsActivity_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_documents" ADD CONSTRAINT "activity_documents_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_vendor_contracts" ADD CONSTRAINT "activity_vendor_contracts_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_vendor_contracts" ADD CONSTRAINT "activity_vendor_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_activity_templates" ADD CONSTRAINT "trip_activity_templates_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_activity_templates" ADD CONSTRAINT "trip_activity_templates_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure_activities" ADD CONSTRAINT "departure_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure_activities" ADD CONSTRAINT "departure_activities_activity_vendor_contract_id_fkey" FOREIGN KEY ("activity_vendor_contract_id") REFERENCES "activity_vendor_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure_activities" ADD CONSTRAINT "departure_activities_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "DirectoryVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure_activities" ADD CONSTRAINT "departure_activities_responsible_guide_id_fkey" FOREIGN KEY ("responsible_guide_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_activity_allocations" ADD CONSTRAINT "passenger_activity_allocations_departure_activity_id_fkey" FOREIGN KEY ("departure_activity_id") REFERENCES "departure_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_activity_allocations" ADD CONSTRAINT "passenger_activity_allocations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorPayment" ADD CONSTRAINT "OpsVendorPayment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorPayment" ADD CONSTRAINT "OpsVendorPayment_collectionAccountId_fkey" FOREIGN KEY ("collectionAccountId") REFERENCES "PaymentReceivingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsClientPayment" ADD CONSTRAINT "OpsClientPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsClientPayment" ADD CONSTRAINT "OpsClientPayment_collectionAccountId_fkey" FOREIGN KEY ("collectionAccountId") REFERENCES "PaymentReceivingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDocument" ADD CONSTRAINT "OpsDocument_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDocument" ADD CONSTRAINT "OpsDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsMessage" ADD CONSTRAINT "OpsMessage_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsAccommodationRate" ADD CONSTRAINT "OpsAccommodationRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorVehicle" ADD CONSTRAINT "OpsVendorVehicle_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRoutePricingGroup" ADD CONSTRAINT "OpsRoutePricingGroup_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVehicleRate" ADD CONSTRAINT "OpsVehicleRate_routePricingGroupId_fkey" FOREIGN KEY ("routePricingGroupId") REFERENCES "OpsRoutePricingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVehicleRate" ADD CONSTRAINT "OpsVehicleRate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "OpsVendorVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTransportRate" ADD CONSTRAINT "OpsTransportRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsVendorAdditionalCharge" ADD CONSTRAINT "OpsVendorAdditionalCharge_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDepartureVendorAllocation" ADD CONSTRAINT "OpsDepartureVendorAllocation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDepartureVendorAllocation" ADD CONSTRAINT "OpsDepartureVendorAllocation_accommodationRateId_fkey" FOREIGN KEY ("accommodationRateId") REFERENCES "OpsAccommodationRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDepartureVendorAllocation" ADD CONSTRAINT "OpsDepartureVendorAllocation_transportRateId_fkey" FOREIGN KEY ("transportRateId") REFERENCES "OpsTransportRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDepartureVendorAllocation" ADD CONSTRAINT "OpsDepartureVendorAllocation_tripVendorRateId_fkey" FOREIGN KEY ("tripVendorRateId") REFERENCES "OpsTripVendorRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripVendor" ADD CONSTRAINT "OpsTripVendor_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripVendor" ADD CONSTRAINT "OpsTripVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "OpsVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTripVendorRate" ADD CONSTRAINT "OpsTripVendorRate_tripVendorId_fkey" FOREIGN KEY ("tripVendorId") REFERENCES "OpsTripVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorContact" ADD CONSTRAINT "DirectoryVendorContact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorRoomRate" ADD CONSTRAINT "DirectoryVendorRoomRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorTransportRate" ADD CONSTRAINT "DirectoryVendorTransportRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorFoodRate" ADD CONSTRAINT "DirectoryVendorFoodRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorGuideRate" ADD CONSTRAINT "DirectoryVendorGuideRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorMiscCharge" ADD CONSTRAINT "DirectoryVendorMiscCharge_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryTripVendorMapping" ADD CONSTRAINT "DirectoryTripVendorMapping_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorContract" ADD CONSTRAINT "DirectoryVendorContract_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVendorPayment" ADD CONSTRAINT "DirectoryVendorPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "DirectoryVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskWorkspace" ADD CONSTRAINT "TravelDeskWorkspace_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskCategory" ADD CONSTRAINT "TravelDeskCategory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskArticle" ADD CONSTRAINT "TravelDeskArticle_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskArticle" ADD CONSTRAINT "TravelDeskArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TravelDeskCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskArticle" ADD CONSTRAINT "TravelDeskArticle_originLearningId_fkey" FOREIGN KEY ("originLearningId") REFERENCES "TravelDeskLearning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskArticleVersion" ADD CONSTRAINT "TravelDeskArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "TravelDeskArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskVendorLink" ADD CONSTRAINT "TravelDeskVendorLink_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskVendorLink" ADD CONSTRAINT "TravelDeskVendorLink_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskNotice" ADD CONSTRAINT "TravelDeskNotice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskNoticeAck" ADD CONSTRAINT "TravelDeskNoticeAck_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "TravelDeskNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskLearning" ADD CONSTRAINT "TravelDeskLearning_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelDeskAuditLog" ADD CONSTRAINT "TravelDeskAuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TravelDeskWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceivingAccount" ADD CONSTRAINT "PaymentReceivingAccount_linkedAdminId_fkey" FOREIGN KEY ("linkedAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceivingAccount" ADD CONSTRAINT "PaymentReceivingAccount_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceivingAccount" ADD CONSTRAINT "PaymentReceivingAccount_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionAccountSubmission" ADD CONSTRAINT "CollectionAccountSubmission_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PaymentReceivingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionAccountSubmission" ADD CONSTRAINT "CollectionAccountSubmission_recordedByAdminId_fkey" FOREIGN KEY ("recordedByAdminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_collectedByAdminId_fkey" FOREIGN KEY ("collectedByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_reversedByAdminId_fkey" FOREIGN KEY ("reversedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_receivingAccountId_fkey" FOREIGN KEY ("receivingAccountId") REFERENCES "PaymentReceivingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPaymentCollection" ADD CONSTRAINT "StationPaymentCollection_handoverId_fkey" FOREIGN KEY ("handoverId") REFERENCES "StationCashHandover"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationCashHandover" ADD CONSTRAINT "StationCashHandover_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationCashHandover" ADD CONSTRAINT "StationCashHandover_handoverRecipientId_fkey" FOREIGN KEY ("handoverRecipientId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationCashHandover" ADD CONSTRAINT "StationCashHandover_financeConfirmedById_fkey" FOREIGN KEY ("financeConfirmedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationCashHandover" ADD CONSTRAINT "StationCashHandover_reconciledById_fkey" FOREIGN KEY ("reconciledById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCollectionSubmission" ADD CONSTRAINT "EmployeeCollectionSubmission_employeeAdminId_fkey" FOREIGN KEY ("employeeAdminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCollectionSubmission" ADD CONSTRAINT "EmployeeCollectionSubmission_recordedByAdminId_fkey" FOREIGN KEY ("recordedByAdminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripKnowledge" ADD CONSTRAINT "TripKnowledge_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripKnowledge" ADD CONSTRAINT "TripKnowledge_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSOP" ADD CONSTRAINT "TripSOP_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSOP" ADD CONSTRAINT "TripSOP_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripActivityLog" ADD CONSTRAINT "TripActivityLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripActivityLog" ADD CONSTRAINT "TripActivityLog_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustomPermission" ADD CONSTRAINT "UserCustomPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PermissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionDelegation" ADD CONSTRAINT "PermissionDelegation_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_details" ADD CONSTRAINT "trip_details_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_modes" ADD CONSTRAINT "travel_modes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_sharing" ADD CONSTRAINT "room_sharing_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inclusions" ADD CONSTRAINT "inclusions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusions" ADD CONSTRAINT "exclusions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stays" ADD CONSTRAINT "stays_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departures" ADD CONSTRAINT "departures_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departures" ADD CONSTRAINT "departures_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundTransaction" ADD CONSTRAINT "RefundTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundTransaction" ADD CONSTRAINT "RefundTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundTransaction" ADD CONSTRAINT "RefundTransaction_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNoteUsage" ADD CONSTRAINT "CreditNoteUsage_refundTransactionId_fkey" FOREIGN KEY ("refundTransactionId") REFERENCES "RefundTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNoteUsage" ADD CONSTRAINT "CreditNoteUsage_targetBookingId_fkey" FOREIGN KEY ("targetBookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNoteUsage" ADD CONSTRAINT "CreditNoteUsage_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRegistry" ADD CONSTRAINT "ServiceRegistry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRegistry" ADD CONSTRAINT "ServiceRegistry_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRegistry" ADD CONSTRAINT "ServiceRegistry_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAllotment" ADD CONSTRAINT "TaskAllotment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAllotment" ADD CONSTRAINT "TaskAllotment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAllotment" ADD CONSTRAINT "TaskAllotment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TaskAllotment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripAccounting" ADD CONSTRAINT "TripAccounting_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

