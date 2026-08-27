import { fetchPublicTrips } from "@/lib/api";
import { Trip } from "@/types";
import UpcomingTripsClient from "@/components/UpcomingTripsClient";
import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 30;

export const metadata: Metadata = pageMetadata({
  title: "Upcoming Trips | YouthCamping",
  description:
    "Browse YouthCamping group trips across Himachal, Ladakh, Kashmir, Kerala, and more.",
  path: "/trips",
});

export default async function TripsPage() {
  let trips: Trip[] = [];
  try {
    const allTrips = await fetchPublicTrips();
    trips = allTrips.filter((t) => t.status === "published");
  } catch (error) {
    console.error("Error fetching trips:", error);
  }

  return <UpcomingTripsClient trips={trips} />;
}
