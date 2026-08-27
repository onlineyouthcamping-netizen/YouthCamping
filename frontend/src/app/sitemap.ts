import { MetadataRoute } from "next";
import {
  fetchPublicTrips,
  fetchPublicBlogs,
  fetchAttractions,
} from "@/lib/api";
import { PUBLIC_SITE_ORIGIN } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = PUBLIC_SITE_ORIGIN;

  const staticRoutes = [
    "",
    "/about-us",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cancellation-policy",
    "/questions",
    "/reviews",
    "/trips",
    "/stories",
    "/how-it-works",
    "/join-our-team",
    "/packing-list",
    "/manali-trekking-camp-with-youthcamping",
    "/sitemap",
  ].map((route) => ({
    url: route === "" ? `${baseUrl}/` : `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let tripRoutes: MetadataRoute.Sitemap = [];
  try {
    const trips = await fetchPublicTrips();
    if (trips && Array.isArray(trips)) {
      tripRoutes = trips
        .filter((trip) => trip?.slug && trip.status !== "draft")
        .map((trip) => ({
          url: `${baseUrl}/trips/${trip.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error("Sitemap trips fetch error:", error);
  }

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await fetchPublicBlogs();
    if (blogs && Array.isArray(blogs)) {
      blogRoutes = blogs
        .filter((b) => b && b.status === "published" && b.slug)
        .map((blog) => ({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: new Date(blog.createdAt || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch (error) {
    console.error("Sitemap blogs fetch error:", error);
  }

  let attractionRoutes: MetadataRoute.Sitemap = [];
  try {
    const attractions = await fetchAttractions();
    if (attractions && Array.isArray(attractions)) {
      attractionRoutes = attractions
        .filter((attraction) => attraction?.slug)
        .map((attraction) => ({
          url: `${baseUrl}/attractions/${attraction.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }));
    }
  } catch (error) {
    console.error("Sitemap attractions fetch error:", error);
  }

  const seen = new Set<string>();
  return [...staticRoutes, ...tripRoutes, ...blogRoutes, ...attractionRoutes].filter(
    (entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    },
  );
}
