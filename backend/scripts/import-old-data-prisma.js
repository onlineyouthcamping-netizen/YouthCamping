const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// Premium destination-specific photo presets to replace any empty or logo-contaminated galleries
const DESTINATION_PHOTOS = {
  kedarnath: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1707312154378-f7b764c676d1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200"
  ],
  spiti: [
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1200"
  ],
  kerala: [
    "https://images.unsplash.com/photo-1602216056096-3c40cc0c9944?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1200"
  ],
  ladakh: [
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1619103801164-1166263cb3b6?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=1200"
  ],
  manali: [
    "https://images.unsplash.com/photo-1595054350563-397193f8e5b4?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1582239014603-7b3b7548d80c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1200"
  ],
  kasol: [
    "https://images.unsplash.com/photo-1598214817158-99ed26703f83?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&q=80&w=1200"
  ],
  shimla: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544735716-392fe2709496?auto=format&fit=crop&q=80&w=1200"
  ],
  kashmir: [
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1566833925222-630444508493?auto=format&fit=crop&q=80&w=1200"
  ]
};

// Premium Reviews Seeding Data
const REVIEWS_DATA = [
  { userName: "Zeel", instagram: "@_zeel_1608", tripSearch: "Manali", rating: 5, comment: "Had an amazing time on the Manali-Kasol trip. The vibes, people & memories were truly unforgettable. Everything was fun, smooth and full of adventure. Can't wait for the next trip already!" },
  { userName: "Neeki", instagram: "@neeki_0606", tripSearch: "Spiti", rating: 5, comment: "Spiti was pure magic. Crazy roads, breathtaking views & unforgettable moments throughout the journey. Every day felt like a new adventure. Definitely a once in a lifetime experience." },
  { userName: "Suru Chaudhary", instagram: "@suru_chaudhary2927", tripSearch: "Kerala", rating: 5, comment: "Kerala was full of peace, fun & beautiful vibes. From beaches to backwaters, every moment felt refreshing. The whole trip was relaxing and memorable. So many beautiful memories made together." },
  { userName: "Vidhi", instagram: "@vidhiithummar", tripSearch: "Manali", rating: 5, comment: "Had an amazing time on the Manali-Kasol trip. The vibes, people & memories were truly unforgettable. Everything was fun, smooth and full of adventure. Can't wait for the next trip already!" },
  { userName: "Ankit Shah", instagram: "@ankit_shah_22", tripSearch: "Kedarnath", rating: 5, comment: "A truly spiritual and breathtaking journey. Walking to Kedarnath Dham with the mountains in the background was a dream. The guides were extremely supportive!" },
  { userName: "Megha Patel", instagram: "@megha_patel", tripSearch: "Ladakh", rating: 5, comment: "Nubra Valley and Pangong Lake are out of this world. Riding bikes across Leh Ladakh was an incredible experience. Safe, structured, and extremely professional." }
];

// Premium Blog Articles Seeding Data
const BLOGS_DATA = [
  {
    title: "Walking the Frozen Zanskar River: The Ultimate Chadar Trek Guide",
    author: "Aman Sharma",
    readTime: "8 MIN READ",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200",
    hasVideo: false,
    content: "The Chadar Trek is not just a journey; it is a pilgrimage through ice. Located in the Ladakh region, walking on the frozen Zanskar river is a magical, once-in-a-lifetime adventure. Temperatures drop down below -20°C, and every step requires patience and balanced breathing. Make sure to choose warm layerings and high-quality boots before starting."
  },
  {
    title: "Spiti Valley in Winter: Surviving -20°C in the Middle Land",
    author: "Karan Johar",
    readTime: "12 MIN READ",
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=1200",
    hasVideo: false,
    content: "The quietude of Spiti in winter is deafening. With frozen waterfalls, ancient monasteries blanketed in white snow, and traditional local home stays, Spiti Valley transforms into a serene, untouched cold paradise. Here is how we lived with local families, drank hot butter tea, and captured visual masterworks on our expedition."
  },
  {
    title: "The Pristine Colors of Kasol: Riverside Cafes & Parvati Valley Trails",
    author: "Siddharth",
    readTime: "5 MIN READ",
    image: "https://images.unsplash.com/photo-1598214817158-99ed26703f83?auto=format&fit=crop&q=80&w=1200",
    hasVideo: false,
    content: "From the serene banks of the Parvati River to the hidden high-altitude trails of Chalal and Tosh, the natural vibe of Kasol is unmatched. It is the perfect place to unwind, meet fellow globetrotters, try authentic Israeli food in cozy wood cafes, and breathe the fresh mountain air of Himachal Pradesh."
  }
];

async function seed() {
  console.log("🚀 Starting Dynamic Data Import from trips-data.json...");

  try {
    const dataPath = path.join(__dirname, 'trips-data.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Scraped file not found at: ${dataPath}`);
    }

    const rawTrips = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📦 Loaded ${rawTrips.length} raw trips from file.`);

    // 1. Dynamic Seeding with Strict Formatting
    for (const trip of rawTrips) {
      const slug = slugify(trip.title, { lower: true, strict: true });

      // Clean images and remove all logo-contaminated files
      let cleanImages = (trip.images || []).filter(img => {
        if (!img) return false;
        const lower = img.toLowerCase();
        return !(
          lower.includes('img_6911') ||
          lower.includes('pngwing') ||
          lower.includes('logo') ||
          lower.includes('seeklogo') ||
          lower.includes('images.png') ||
          lower.includes('whatsapp') ||
          lower.includes('gujarat-tourism') ||
          lower.includes('/x110gt/') ||
          lower.includes('/x210gt/') ||
          lower.includes('/thumbnail/')
        );
      });

      // Detect correct destination preset photos to use as clean fallbacks or additions
      let photosKey = 'manali';
      const titleLower = trip.title.toLowerCase();
      if (titleLower.includes('kedarnath') || titleLower.includes('badrinath')) photosKey = 'kedarnath';
      else if (titleLower.includes('spiti')) photosKey = 'spiti';
      else if (titleLower.includes('kerala')) photosKey = 'kerala';
      else if (titleLower.includes('ladakh') || titleLower.includes('leh')) photosKey = 'ladakh';
      else if (titleLower.includes('shimla')) photosKey = 'shimla';
      else if (titleLower.includes('kashmir')) photosKey = 'kashmir';
      else if (titleLower.includes('kasol')) photosKey = 'kasol';

      const fallbackPhotos = DESTINATION_PHOTOS[photosKey];
      
      // Merge high-quality fallback photos if clean images list is small or lacks quality
      if (cleanImages.length < 3) {
        cleanImages = [...cleanImages, ...fallbackPhotos];
      }

      // Ensure zero empty spots and remove duplicates
      cleanImages = Array.from(new Set(cleanImages)).filter(Boolean);

      const heroImage = cleanImages[0] || fallbackPhotos[0];

      // Format Day-wise Itinerary with Real Photos and exact content
      const formattedItinerary = (trip.itinerary || []).map((dayItem, index) => {
        const dayImage = cleanImages[index % cleanImages.length] || fallbackPhotos[index % fallbackPhotos.length];
        return {
          day: Number(dayItem.day || index + 1),
          title: (dayItem.title || `Day ${index + 1}`).trim(),
          description: (dayItem.description || "").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '').trim(),
          image: dayImage
        };
      });

      // Parse dates safely and extract real prices
      let parsedDates = [];
      let minPrice = 11999;
      if (trip.availableDates && Array.isArray(trip.availableDates)) {
        parsedDates = trip.availableDates.map(d => {
          const rawPrice = Number(d.price);
          if (!isNaN(rawPrice) && rawPrice > 2000) {
            minPrice = Math.min(minPrice, rawPrice);
          }
          return {
            date: "2026-05-15", // Seed normalized production dates
            capacity: 20,
            price: !isNaN(rawPrice) && rawPrice > 2000 ? rawPrice : 11999
          };
        });
      }

      // Parse final price
      const finalPrice = typeof trip.price === 'number' ? trip.price : (minPrice || 11999);

      const tripData = {
        title: trip.title.trim(),
        price: Number(finalPrice),
        location: trip.location || (photosKey.charAt(0).toUpperCase() + photosKey.slice(1)),
        duration: trip.duration || `${formattedItinerary.length} Days`,
        description: trip.description.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '').trim(),
        category: titleLower.includes('backpack') ? 'backpacking' : titleLower.includes('road') ? 'road trip' : 'himalayan',
        heroImage: heroImage,
        images: cleanImages,
        itinerary: formattedItinerary,
        status: "published",
        isActive: true,
        inclusions: trip.inclusions && trip.inclusions.length > 0 ? trip.inclusions : [
          "Double/Triple Sharing Accommodation",
          "All internal road transfers by private vehicles",
          "Group leader & certified local guide support",
          "Meals (Breakfast & Dinner as per sitemap itinerary)",
          "All permit fees, toll taxes, driver allowance, and parking charges"
        ],
        exclusions: trip.exclusions && trip.exclusions.length > 0 ? trip.exclusions : [
          "Flights or train tickets to starting city",
          "Meals not mentioned in sitemap itinerary (Lunch)",
          "Entrance tickets to monuments, museums & adventure parks",
          "Personal expenses (laundry, tips, shopping, gear hire)",
          "GST (5%) extra"
        ],
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
      console.log(`✅ Seeded Trip: ${trip.title}`);
    }

    // 2. Clear and Seed Premium Reviews
    await prisma.review.deleteMany({});
    for (const r of REVIEWS_DATA) {
      const trip = await prisma.trip.findFirst({
        where: { title: { contains: r.tripSearch, mode: 'insensitive' } }
      });
      
      await prisma.review.create({
        data: {
          userName: r.userName,
          instagram: r.instagram,
          comment: r.comment,
          rating: r.rating,
          tripId: trip ? trip.id : null,
          tripName: trip ? trip.title : "General Testimonial",
          isActive: true,
          tenantId: 'default'
        }
      });
      console.log(`✅ Seeded Review for ${r.userName}`);
    }

    // 3. Clear and Seed Premium Blogs
    await prisma.blog.deleteMany({});
    for (const b of BLOGS_DATA) {
      const slug = slugify(b.title, { lower: true, strict: true });
      await prisma.blog.create({
        data: {
          title: b.title,
          slug: slug,
          content: b.content,
          image: b.image,
          author: b.author,
          readTime: b.readTime,
          status: "published",
          isActive: true,
          tenantId: 'default'
        }
      });
      console.log(`✅ Seeded Blog: ${b.title}`);
    }

    const dbCount = await prisma.trip.count();
    console.log(`\n🌟 ALL-IN-ONE SEEDING COMPLETE! Verified ${dbCount} active trips in database.`);
  } catch (error) {
    console.error("❌ High-Fidelity Seeding Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
