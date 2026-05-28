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
import { fetchTrips, fetchReviews, fetchBlogs, fetchPageBySlug, fetchSettings, fetchTheme } from "@/lib/api";

import { Trip, Review, Blog } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let trips: Trip[] = [];
  let reviews: Review[] = [];
  let blogs: Blog[] = [];
  let page: any = null;
  let settings: any = null;
  let theme: any = null;
  
  try {
    const results = await Promise.allSettled([
      fetchTrips(),
      fetchReviews(),
      fetchBlogs(),
      fetchPageBySlug('home'),
      fetchSettings(),
      fetchTheme()
    ]);
    
    const tripsData = results[0].status === 'fulfilled' ? results[0].value : [];
    const reviewsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const blogsData = results[2].status === 'fulfilled' ? results[2].value : [];
    const pageData = results[3].status === 'fulfilled' ? results[3].value : null;
    const settingsData = results[4].status === 'fulfilled' ? results[4].value : null;
    const themeData = results[5].status === 'fulfilled' ? results[5].value : null;
    
    trips = (tripsData || []).filter((t: any) => t.status === 'published');
    reviews = reviewsData || [];
    blogs = (blogsData || []).filter((b: any) => b.status === 'published');
    page = pageData;
    settings = settingsData;
    theme = themeData;
  } catch (error) {
    console.error("Error fetching home data:", error);
  }

  // Construct dynamic section map for default template
  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    social_proof: <SocialProofBar key="social_proof" />,
    community_trips: <CommunityTrips key="community_trips" trips={trips} />,
    cta_banner: <CTABanner key="cta_banner" />,
    destinations: <Destinations key="destinations" />,
    bestie: <BestieSection key="bestie" />,
    cta_slider: <CTASlider key="cta_slider" />,
    blogs: <BlogSection key="blogs" blogs={blogs} />,
    reviews: <ReviewsSection key="reviews" reviews={reviews} />,
    vibe: <VibeSection key="vibe" />
  };

  const order = theme?.sectionOrder || [
    'hero', 'social_proof', 'community_trips', 'cta_banner', 
    'destinations', 'bestie', 'cta_slider', 'blogs', 'reviews', 'vibe'
  ];
  const visibility = theme?.sectionVisibility || {};
  const visibleSectionKeys = order.filter((key: string) => {
    return visibility[key] !== false && sectionMap[key];
  });

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
          {visibleSectionKeys.map((key: string, idx: number) => {
            const isAlternate = theme?.sectionBgAlternate ?? true;
            const alternateClass = isAlternate && idx % 2 === 1 ? "bg-zinc-50/50" : "bg-transparent";
            
            // Skip spacing wrapper for hero/cta to keep layouts full-screen
            if (key === 'hero' || key === 'cta_banner') {
              return sectionMap[key];
            }
            
            const spacingPx = theme?.sectionSpacing != null ? `${theme.sectionSpacing}px` : '80px';
            
            return (
              <div 
                key={key} 
                className={alternateClass}
                style={{ 
                  paddingTop: spacingPx,
                  paddingBottom: spacingPx 
                }}
              >
                {sectionMap[key]}
              </div>
            );
          })}
        </>
      )}
      <FloatingSocialBar settings={settings} />
    </div>
  );
}
