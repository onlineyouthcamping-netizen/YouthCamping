import { Quotation } from "@/types";
import { API_BASE_URL } from "./api";

export async function getQuotationSmart(
  idOrSlug: string,
  isAdmin: boolean = false,
  token: string = "",
): Promise<Quotation | null> {
  console.log(
    `[db-smart] Fetching: "${idOrSlug}" (isAdmin: ${isAdmin}, token: ${token})`,
  );

  // 1. Try local CRM API (Production Fallback)
  let CRM_BASE = process.env.CRM_API_URL || API_BASE_URL;
  if (!CRM_BASE || CRM_BASE.includes("onrender.com")) {
    console.warn(
      "[db-smart] Stale Render URL detected. Forcing fallback to Hostinger VPS.",
    );
    CRM_BASE = "https://api.youthcamping.online/api";
  }
  // Ensure it ends with /api for consistency with backend routes
  if (!CRM_BASE.endsWith("/api")) {
    CRM_BASE = `${CRM_BASE}/api`;
  }

  // Safety check: if API_BASE_URL already contains /api, don't double it
  const finalUrl = `${CRM_BASE.replace(/\/api\/api$/, "/api")}/quotations/${idOrSlug}?isAdmin=${isAdmin}&token=${token}`;
  console.log(`[db-smart] Checking CRM API at: ${finalUrl}`);
  try {
    const crmRes = await fetch(finalUrl, { cache: "no-store" });
    if (crmRes.ok) {
      const crmData = await crmRes.json();
      if (crmData.success && crmData.data) {
        console.log(`[db-smart] Found in CRM API: "${idOrSlug}"`, crmData.data);
        const record = crmData.data;

        console.log(`[db-smart] CRM Record Keys:`, Object.keys(record));
        console.log(`[db-smart] Hotels Data:`, {
          low: record.lowLevelHotels?.length,
          high: record.highLevelHotels?.length,
        });

        return {
          ...record,
          tripTitle: record.tripTitle || record.destination || "Premium Trip",
          id: record.id,
          slug: record.slug,
          customerName: record.customerName || "Valued Traveler",
          duration: record.duration || "5D/4N",
          travelDates: record.travelDates,
          paxCount: record.pax || 2,
          pax: record.pax || 2,
          basePrice: record.totalPrice || 0,
          totalPrice: record.totalPrice || 0,
          discount: record.discount || 0,
          finalPrice: record.finalPrice || 0,
          advancePayment: record.advanceAmount || 5000,

          // Unified System Fields
          heroImage:
            record.coverImage ||
            record.heroImage ||
            "https://images.unsplash.com/photo-1506929113675-b92417bbbe8d?q=80&w=2000",
          coverImage:
            record.coverImage ||
            record.heroImage ||
            "https://images.unsplash.com/photo-1506929113675-b92417bbbe8d?q=80&w=2000",
          experiencePhotos: record.experiencePhotos || [],

          // Fallback to record.hotels if specific levels are missing
          lowLevelHotels:
            record.lowLevelHotels && record.lowLevelHotels.length > 0
              ? record.lowLevelHotels
              : record.hotels || [],
          highLevelHotels:
            record.highLevelHotels && record.highLevelHotels.length > 0
              ? record.highLevelHotels
              : record.hotels || [],
          lowLevelPrice: record.lowLevelPrice || record.finalPrice,
          highLevelPrice: record.highLevelPrice || record.finalPrice * 1.2,

          overview: record.overview || record.description || "",
          itinerary: (record.itinerary || []).map((day: any) => ({
            ...day,
            photos: day.photos && day.photos.length > 0 ? day.photos : [],
          })),
          inclusions: record.inclusions || [],
          exclusions: record.exclusions || [],
          agent: {
            name: record.expert?.name || "Suresh Chaudhary",
            photo:
              record.expert?.photo ||
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
            role:
              record.expert?.designation ||
              record.expert?.role ||
              "Verified Travel Expert",
            phone:
              record.expert?.whatsapp || record.expert?.phone || "919000000000",
          },
          expert: record.expert,
          expiryTime:
            record.expiresAt || record.expiryTime || record.expiryDate,
          status: (record.status || "draft").toLowerCase(),
          expired: record.isExpired || false,
        } as any;
      }
    }
  } catch (e: any) {
    console.warn(`[db-smart] CRM API fetch failed: ${e.message}`);
  }

  // Never invent a quotation. Missing API data is empty, not demo Kashmir/Parth.
  return null;
}
