import Hero from "@/components/Hero";
import SocialProofBar from "@/components/SocialProofBar";
import CommunityTrips from "@/components/CommunityTrips";
import BestieSection from "@/components/BestieSection";
import RealitySection from "@/components/RealitySection";
import Destinations from "@/components/Destinations";
import BlogSection from "@/components/BlogSection";
import ReviewsSection from "@/components/ReviewsSection";
import VibeSection from "@/components/VibeSection";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import PageRenderer from "@/components/PageRenderer";
import CTASlider from "@/components/CTASlider";
import CTABanner from "@/components/CTABanner";
import { fetchTrips, fetchReviews, fetchBlogs, fetchPageBySlug, fetchSettings } from "@/lib/api";

import { Trip, Review, Blog } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let trips: Trip[] = [];
  let reviews: Review[] = [];
  let blogs: Blog[] = [];
  let page: any = null;
  let settings: any = null;
  
  try {
    const results = await Promise.allSettled([
      fetchTrips(),
      fetchReviews(),
      fetchBlogs(),
      fetchPageBySlug('home'),
      fetchSettings()
    ]);
    
    const tripsData = results[0].status === 'fulfilled' ? results[0].value : [];
    const reviewsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const blogsData = results[2].status === 'fulfilled' ? results[2].value : [];
    const pageData = results[3].status === 'fulfilled' ? results[3].value : null;
    const settingsData = results[4].status === 'fulfilled' ? results[4].value : null;
    
    trips = (tripsData || []).filter((t: any) => t.status === 'published');
    reviews = reviewsData || [];
    blogs = (blogsData || []).filter((b: any) => b.status === 'published');
    page = pageData;
    settings = settingsData;
  } catch (error) {
    console.error("Error fetching home data:", error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {page && page.sections && page.sections.length > 0 ? (
        <>
          <PageRenderer sections={page.sections} trips={trips} reviews={reviews} blogs={blogs} />
          {/* Force new sections if not in DB */}
          {!page.sections.some((s: any) => s.type === 'cta_slider') && <CTASlider />}
        </>
      ) : (
        <>
          <Hero />
          <SocialProofBar />
          <CommunityTrips trips={trips} />
          <CTABanner />
          <Destinations />
          <BestieSection />
          <CTASlider />
          <BlogSection blogs={blogs} />
          <ReviewsSection reviews={reviews} />
          <VibeSection />
        </>
      )}
      <FloatingSocialBar settings={settings} />
    </div>
  );
}
