import { Trip, ItineraryDay } from "@/types";
import { fetchWithRetry } from "./fetchWithRetry";

const DEFAULT_API =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3001/api"
    : "https://api.youthcamping.online/api";
let apiURL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API;

if (!apiURL || apiURL.includes("onrender.com")) {
  apiURL = DEFAULT_API;
}

export const API_BASE_URL = apiURL.replace(/\/api$/, "") + "/api";
const IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");

type PublicRequestInit = RequestInit & {
  next?: { revalidate?: number };
};

const publicRevalidate = (seconds: number): PublicRequestInit => {
  if (process.env.NODE_ENV !== "production") {
    return { cache: "no-store" } as any;
  }
  return {
    next: { revalidate: Math.min(seconds, 600) },
  };
};

/**
 * Normalizes image URLs to be fully qualified and accessible.
 * Handles: local uploads (/uploads/...), external URLs (https://...), and empty values.
 */
export const normalizeImageUrl = (url: any): string | undefined => {
  if (!url || typeof url !== "string") return undefined;
  if (url.trim() === "") return undefined;

  // Block WordPress hotlinked images (403 forbidden)
  if (
    url.includes("youthcamping.in/wp-content") ||
    url.includes("youthcamping.online/wp-content")
  ) {
    return undefined;
  }

  // Block old broken black & white thumbs-up PNG placeholders uploaded to /uploads/trips/
  if (
    url.includes("image-1778570") ||
    url.includes("image-1778571") ||
    url.includes("177857099") ||
    url.includes("177857100")
  ) {
    return undefined;
  }

  // Enforce valid HTTP/HTTPS URLs
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url === "https://images.unsplash.com/photo-" || url.endsWith("photo-"))
      return undefined;
    return url;
  }

  // Handle local upload paths
  const normalizedPath = (url || "").replace(/\\/g, "/");
  if (
    normalizedPath &&
    (normalizedPath.startsWith("/uploads/") ||
      normalizedPath.startsWith("uploads/"))
  ) {
    const fullPath = normalizedPath.startsWith("/")
      ? normalizedPath
      : `/${normalizedPath}`;
    return `${IMAGE_BASE_URL}${fullPath}`;
  }

  if (url.startsWith("/")) {
    return url;
  }

  return undefined;
};

export async function fetchTrips(init?: RequestInit): Promise<Trip[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/trips`,
      init ?? publicRevalidate(120),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchTrips network error:", err);
    return [];
  }
}

export async function fetchPublicTrips(
  init?: PublicRequestInit,
): Promise<Trip[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/trips/public/cards`,
      init ?? publicRevalidate(180),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchPublicTrips network error:", err);
    return [];
  }
}

export async function fetchHomepageTrips(limit = 50): Promise<Trip[]> {
  try {
    const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
    const res = await fetch(
      `${API_BASE_URL}/trips/public/cards?limit=${safeLimit}`,
      publicRevalidate(180),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHomepageTrips network error:", err);
    return [];
  }
}

export async function fetchTripBySlug(
  slug: string,
  init?: PublicRequestInit,
): Promise<Trip | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/trips/${slug}`,
      init ?? publicRevalidate(60),
    );
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn(`fetchTripBySlug error slug=${slug}:`, err);
  }

  // MOCK_SLUG_MAP was removed. Demo trips must not appear unless an explicit
  // NEXT_PUBLIC_ENABLE_DEMO_DATA=true flag is added with a real demo source.
  // NODE_ENV=development alone must never invent trips.
  return null;
}

export async function fetchItinerary(tripId: string): Promise<ItineraryDay[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/itinerary/${tripId}`,
      publicRevalidate(300),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn(`fetchItinerary error tripId=${tripId}:`, err);
    return [];
  }
}

export async function fetchReviews(init?: RequestInit): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/reviews`,
      init ?? { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchReviews network error:", err);
    return [];
  }
}

export async function fetchPublicReviews(
  init?: PublicRequestInit,
): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/reviews`,
      init ?? publicRevalidate(30),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchPublicReviews network error:", err);
    return [];
  }
}

export async function fetchHomepageReviews(limit = 8): Promise<any[]> {
  try {
    const safeLimit = Math.max(1, Math.min(16, Math.trunc(limit)));
    const res = await fetch(
      `${API_BASE_URL}/reviews?limit=${safeLimit}`,
      publicRevalidate(30),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHomepageReviews network error:", err);
    return [];
  }
}

export async function fetchBlogs(init?: RequestInit): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blogs`,
      init ?? { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchBlogs network error:", err);
    return [];
  }
}

export async function fetchPublicBlogs(
  init?: PublicRequestInit,
): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blogs/public/cards`,
      init ?? publicRevalidate(30),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchPublicBlogs network error:", err);
    return [];
  }
}

export async function fetchHomepageBlogs(limit = 8): Promise<any[]> {
  try {
    const safeLimit = Math.max(1, Math.min(16, Math.trunc(limit)));
    const res = await fetch(
      `${API_BASE_URL}/blogs/public/cards?limit=${safeLimit}`,
      publicRevalidate(30),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHomepageBlogs network error:", err);
    return [];
  }
}

export async function fetchAttractions(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/attractions`,
      publicRevalidate(300),
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchAttractions network error:", err);
    return [];
  }
}

export async function fetchAttractionBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/attractions/slug/${slug}`,
      publicRevalidate(300),
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn(`fetchAttractionBySlug error slug=${slug}:`, err);
    return null;
  }
}

export async function fetchBlogBySlug(
  slug: string,
  init?: PublicRequestInit,
): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blogs/public/slug/${slug}`,
      init ?? publicRevalidate(30),
    );
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn(`fetchBlogBySlug network error slug=${slug}:`, err);
  }

  // Return null so the page renders a proper 404/error state instead of fake data.
  return null;

  // Legacy fallback (unreachable — kept for reference only):
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: `blog-${slug}`,
    title: formattedTitle || "Explore The Great Outdoors",
    slug: slug,
    category: "Travel & Expedition",
    author: "Suresh Chaudhary",
    authorRole: "Lead Himalayan Expedition Specialist",
    readTime: "6 min read",
    createdAt: new Date().toISOString(),
    image:
      "https://images.unsplash.com/photo-1597037750734-450f6f406560?q=80&w=2070",
    excerpt: `Discover why ${formattedTitle} is one of India's most breathtaking winter travel experiences with expert tips, packing essentials, and secret spots.`,
    highlights: [
      {
        title: "Snowy Mountain Vistas",
        desc: "Experience 360-degree panoramic views of frozen peaks & alpine valleys.",
      },
      {
        title: "Guided Mountain Treks",
        desc: "Lead by certified safety professionals and experienced local guides.",
      },
      {
        title: "Curated Stays & Culture",
        desc: "Cozy fireside stays, local delicacies, and warm mountain hospitality.",
      },
    ],
    tips: [
      "Layering is key: Pack high-density thermals, a windproof outer jacket, and fleece gloves.",
      "Footwear matters: Sturdy waterproof trekking boots with good ankle support are essential.",
      "Stay Hydrated: Cold weather masks dehydration; carry a thermal thermos flask on day hikes.",
      "Respect Local Heritage: Embrace local mountain customs and leave zero trace in nature.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1597037750734-450f6f406560?q=80&w=1200",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200",
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1200",
    ],
    intro: `Kashmir in winter is a mesmerizing wonderland. Blanketed under pure white snow, the valleys of Gulmarg, Pahalgam, and Sonamarg transform into landscapes straight out of an alpine fairytale.`,
    content: `Kashmir in winter is a mesmerizing wonderland. Blanketed under pure white snow, the valleys of Gulmarg, Pahalgam, and Sonamarg transform into landscapes straight out of an alpine fairytale.

Whether you are seeking thrilling ski slopes in Gulmarg, peaceful morning rides on a frosty Dal Lake in Srinagar, or fireside evenings sipping hot Kashmiri Kahwa, a winter expedition to Kashmir is an unmissable bucket-list journey.`,
  };
}

export async function fetchPageBySlug(
  slug: string,
  init?: PublicRequestInit,
): Promise<any | null> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE_URL}/page-builder/public/${slug}`,
      init ?? publicRevalidate(60),
    );
    if (!res || !res.ok) return null;
    const json = await res.json();

    if (json.success && json.data) {
      return {
        ...json.data,
        sections: (json.data.sections || []).map((s: any) => ({
          ...s,
          data: s.draft || s.content || s.data || s,
        })),
      };
    }

    return null;
  } catch (error) {
    console.warn(`Public page fetch failed for ${slug}:`, error);
    return null;
  }
}

export async function fetchDraftPageBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/page-builder/${slug}/draft`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();

    if (json.success && json.data) {
      return {
        ...json.data,
        sections: (json.data.sections || []).map((s: any) => ({
          ...s,
          data: s.draft || s.content || s.data || s,
        })),
      };
    }

    return null;
  } catch (error) {
    console.warn(`Draft page fetch failed for ${slug}:`, error);
    return null;
  }
}

export async function fetchSettings(init?: RequestInit): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/settings`,
      init ?? publicRevalidate(300),
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("fetchSettings error:", err);
    return null;
  }
}

export async function fetchPublicSettings(
  init?: PublicRequestInit,
): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/settings/public`,
      init ?? publicRevalidate(600),
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("fetchPublicSettings error:", err);
    return null;
  }
}

export async function submitInquiry(
  data: any,
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      message:
        json.message || (res.ok ? undefined : "Failed to submit inquiry"),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error submitting inquiry",
    };
  }
}

export async function fetchTheme(init?: PublicRequestInit): Promise<any> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE_URL}/theme/public`,
      init ?? publicRevalidate(600),
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("fetchTheme error:", err);
    return null;
  }
}

export async function fetchWebsitePages(
  init?: PublicRequestInit,
): Promise<any[]> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE_URL}/website/pages`,
      init ?? publicRevalidate(60),
    );
    if (!res || !res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchWebsitePages error:", err);
    return [];
  }
}

export async function fetchWebsitePageBySlug(
  slug: string,
  init?: PublicRequestInit,
): Promise<any | null> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE_URL}/website/pages/${encodeURIComponent(slug)}`,
      init ?? publicRevalidate(60),
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn(`fetchWebsitePageBySlug error slug=${slug}:`, err);
    return null;
  }
}

export async function fetchPublicFooterSettings(
  init?: PublicRequestInit,
): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/settings/footer/public`,
      init ?? publicRevalidate(600),
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("fetchPublicFooterSettings error:", err);
    return null;
  }
}

export async function fetchWebsiteSettings(
  init?: PublicRequestInit,
): Promise<Record<string, any>> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE_URL}/website/settings`,
      init ?? publicRevalidate(600),
    );
    if (!res || !res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch (err) {
    console.warn("fetchWebsiteSettings error:", err);
    return {};
  }
}
