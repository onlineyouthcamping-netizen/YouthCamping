import PageRenderer from "@/components/PageRenderer";
import {
  fetchPublicTripsResult,
  fetchPublicReviewsResult,
  fetchPublicBlogsResult,
  fetchDraftPageBySlugResult,
} from "@/lib/api";
import { unwrapData } from "@/lib/publicData";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import ServiceUnavailable from "@/components/ServiceUnavailable";
import { notFound } from "next/navigation";

import { Trip, Review, Blog } from "@/types";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [tripsResult, reviewsResult, blogsResult, pageResult] =
    await Promise.all([
      fetchPublicTripsResult(),
      fetchPublicReviewsResult(),
      fetchPublicBlogsResult(),
      fetchDraftPageBySlugResult(slug),
    ]);

  if (!pageResult.ok) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 bg-primary-orange text-white text-center py-2 z-[100] font-bold text-sm capitalize tracking-widest">
          Preview Mode: Viewing Draft Version
        </div>
        <div className="pt-10">
          <ServiceUnavailable title="Preview is temporarily unavailable" />
        </div>
      </div>
    );
  }

  const page = pageResult.data;
  if (!page) return notFound();

  const trips: Trip[] = unwrapData(tripsResult, []).filter(
    (t) => t.status === "published",
  );
  const reviews: Review[] = unwrapData(reviewsResult, []);
  const blogs: Blog[] = unwrapData(blogsResult, []).filter(
    (b) => b.status === "published",
  );

  const displaySections = page.sections || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 bg-primary-orange text-white text-center py-2 z-[100] font-bold text-sm capitalize tracking-widest">
        Preview Mode: Viewing Draft Version
      </div>
      <div className="pt-10">
        <PageRenderer
          sections={displaySections}
          trips={trips}
          reviews={reviews}
          blogs={blogs}
        />
      </div>
      <FloatingSocialBar />
    </div>
  );
}
