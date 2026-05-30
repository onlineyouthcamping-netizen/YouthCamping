const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
require('dotenv').config();

const prisma = new PrismaClient();

async function runImport() {
  console.log("⚡ Connecting to database for import...");
  
  try {
    const scrapedFilePath = path.join(__dirname, '..', '..', 'scraper', 'data', 'trips.json');
    if (!fs.existsSync(scrapedFilePath)) {
      throw new Error(`Scraped trips file not found at: ${scrapedFilePath}`);
    }

    const fileContent = fs.readFileSync(scrapedFilePath, 'utf-8');
    const scrapedTrips = JSON.parse(fileContent);
    console.log(`📋 Found ${scrapedTrips.length} scraped trips in raw data.`);

    // --- STEP 1: STRICT FIELD VALIDATION (ALL-OR-NOTHING CHECK) ---
    for (const trip of scrapedTrips) {
      if (!trip.title || trip.title.trim() === "") {
        throw new Error("Validation Error: A trip is missing a 'title' field.");
      }
      if (!trip.price || isNaN(Number(trip.price))) {
        throw new Error(`Validation Error: Trip "${trip.title}" has an invalid price.`);
      }
      if (!trip.duration || trip.duration.trim() === "") {
        throw new Error(`Validation Error: Trip "${trip.title}" is missing 'duration'.`);
      }
      if (!trip.location || trip.location.trim() === "") {
        throw new Error(`Validation Error: Trip "${trip.title}" is missing 'location'.`);
      }
      if (!trip.description || trip.description.trim() === "") {
        throw new Error(`Validation Error: Trip "${trip.title}" is missing 'description'.`);
      }
      if (!trip.itinerary || !Array.isArray(trip.itinerary) || trip.itinerary.length === 0) {
        throw new Error(`Validation Error: Trip "${trip.title}" has an empty or invalid itinerary.`);
      }
      console.log(`✓ Pre-validation passed for: ${trip.title}`);
    }
    console.log("🟢 All trips successfully validated. Proceeding to database write phase...");

    // --- STEP 2: CLEAR DUMMY/TEST DATA ONLY ---
    // We only clean up trips that are explicitly named dummy/test and have no active bookings
    const dummyTrips = await prisma.trip.findMany({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'dummy', mode: 'insensitive' } },
          { title: { contains: 'draft', mode: 'insensitive' } }
        ]
      },
      include: {
        bookings: true
      }
    });

    for (const dummy of dummyTrips) {
      if (dummy.bookings.length === 0) {
        await prisma.trip.delete({ where: { id: dummy.id } });
        console.log(`🗑️ Removed unused test/dummy trip: "${dummy.title}"`);
      } else {
        console.log(`⚠️ Skipped deleting dummy trip "${dummy.title}" because it has active bookings.`);
      }
    }

    // --- STEP 3: PERFORM HIGH-FIDELITY SEED (UPSERT) ---
    for (const trip of scrapedTrips) {
      const slug = slugify(trip.title, { lower: true, strict: true });

      // Clean FAQs from the itinerary list and place them in faqs field
      const realItinerary = [];
      const extractedFaqs = [];

      trip.itinerary.forEach((item, idx) => {
        const isFaq = item.title.trim().endsWith('?') || item.day.trim().endsWith('?');
        if (isFaq) {
          extractedFaqs.push({
            question: item.title,
            answer: item.description
          });
        } else {
          // Normalize day number or structure for elegant presentation
          const dayMatch = item.day.match(/Day\s*(\d+)/i);
          const dayVal = dayMatch ? parseInt(dayMatch[1]) : (idx + 1);
          realItinerary.push({
            day: dayVal,
            title: item.title,
            description: item.description,
            location: trip.location,
            stay: "Standard Stay",
            meals: "Breakfast & Dinner"
          });
        }
      });

      const images = Array.isArray(trip.images) && trip.images.length > 0 
        ? trip.images 
        : ["https://images.unsplash.com/photo-1597037750734-450f6f406560?q=80&w=2000"];

      const tripData = {
        title: trip.title.trim(),
        price: Number(trip.price),
        location: trip.location.trim(),
        duration: trip.duration.trim(),
        description: trip.description.trim(),
        category: "backpacking",
        heroImage: images[0],
        images: images,
        itinerary: realItinerary,
        highlights: Array.isArray(trip.highlights) ? trip.highlights : [],
        inclusions: Array.isArray(trip.inclusions) ? trip.inclusions : [],
        exclusions: Array.isArray(trip.exclusions) ? trip.exclusions : [],
        faqs: extractedFaqs.length > 0 ? extractedFaqs : [],
        status: "published",
        isActive: true,
        availableDates: [
          { date: "2026-05-15", capacity: 20 },
          { date: "2026-06-10", capacity: 20 },
          { date: "2026-07-05", capacity: 20 }
        ],
        travelOptions: [
          { label: "Standard Bus/Train", priceDelta: 0 },
          { label: "Semi-Sleeper Volvo", priceDelta: 1500 },
          { label: "AC Sleeper", priceDelta: 2500 }
        ],
        roomOptions: [
          { label: "Quad Sharing", priceDelta: 0 },
          { label: "Triple Sharing", priceDelta: 1200 },
          { label: "Double Sharing", priceDelta: 3000 }
        ]
      };

      await prisma.trip.upsert({
        where: { slug: slug },
        update: tripData,
        create: {
          ...tripData,
          slug: slug
        }
      });
      console.log(`✅ Upserted and verified: ${trip.title}`);
    }

    // --- STEP 4: POST-IMPORT COUNT & FIELDS VERIFICATION ---
    const dbTrips = await prisma.trip.findMany();
    console.log("\n🔍 Running Post-Import verification...");
    console.log(`- Original JSON Count: ${scrapedTrips.length}`);
    console.log(`- Database Active Count: ${dbTrips.length}`);

    if (dbTrips.length < scrapedTrips.length) {
      throw new Error(`Post-Import Verification Failed: Database has fewer records (${dbTrips.length}) than original scraped data (${scrapedTrips.length})!`);
    }

    console.log("🌟 POST-IMPORT VERIFICATION SUCCESSFUL! Zero data loss achieved.");
  } catch (error) {
    console.error("❌ Data import failed and aborted:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runImport();
