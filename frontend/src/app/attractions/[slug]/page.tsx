import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, 
  TrendingUp, 
  Clock, 
  Ticket, 
  Info, 
  HelpCircle,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { normalizeImageUrl, fetchAttractionBySlug, fetchSettings } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export default async function AttractionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [attraction, settings] = await Promise.all([
    fetchAttractionBySlug(slug),
    fetchSettings()
  ]);

  if (!attraction) {
    notFound();
  }

  const overviewItems = [
    { label: "Location", val: attraction.location, icon: MapPin },
    { label: "Altitude", val: attraction.altitude, icon: TrendingUp },
    { label: "Best Time", val: attraction.bestTime, icon: Clock },
    { label: "Visiting Hours", val: attraction.visitingHours, icon: Clock },
    { label: "Entry Fee", val: attraction.entryFee, icon: Ticket },
  ].filter(i => i.val);

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full">
        <OptimizedImage 
          src={normalizeImageUrl(attraction.image) || "https://images.unsplash.com/photo-1520209759395-820217e92824"} 
          alt={attraction.name} className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-20 text-white">
          <div className="max-w-4xl space-y-4">
             <div className="flex items-center gap-2 text-primary-orange font-black uppercase text-xs tracking-widest">
                <MapPin className="w-4 h-4" /> {attraction.location}
             </div>
             <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8]">{attraction.name}</h1>
             <p className="text-lg md:text-xl font-medium opacity-80 max-w-2xl">{attraction.category} • {attraction.altitude}</p>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Overview */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1 h-8 bg-primary-orange rounded-full" />
                 <h2 className="text-3xl font-black text-navy uppercase tracking-tighter italic">Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-zinc-50 p-10 rounded-[40px] border border-zinc-100">
                {overviewItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-orange shadow-sm">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</p>
                      <p className="text-sm font-bold text-navy">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-lg text-zinc-500 leading-relaxed font-medium">
                {attraction.description}
              </p>
            </div>

            {/* Etiquette */}
            {attraction.etiquette && attraction.etiquette.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-8 bg-primary-orange rounded-full" />
                   <h2 className="text-3xl font-black text-navy uppercase tracking-tighter italic">Responsible Travel & Etiquette</h2>
                </div>
                <div className="bg-navy text-white p-10 md:p-14 rounded-[40px] shadow-2xl relative overflow-hidden">
                  <ShieldCheck className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
                  <ul className="space-y-6 relative z-10">
                    {attraction.etiquette.map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-primary-orange flex items-center justify-center shrink-0 mt-1">
                           <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-medium opacity-90">{rule}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* FAQs */}
            {attraction.faqs && attraction.faqs.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-8 bg-primary-orange rounded-full" />
                   <h2 className="text-3xl font-black text-navy uppercase tracking-tighter italic">FAQs</h2>
                </div>
                <div className="space-y-4">
                  {attraction.faqs.map((faq: any, i: number) => (
                    <div key={i} className="p-8 border border-zinc-100 rounded-[32px] hover:border-primary-orange/20 transition-all group">
                       <div className="flex items-start gap-4">
                          <HelpCircle className="w-6 h-6 text-primary-orange shrink-0 mt-1" />
                          <div className="space-y-3">
                             <h4 className="text-xl font-bold text-navy">{faq.question}</h4>
                             <p className="text-zinc-500 font-medium leading-relaxed">{faq.answer}</p>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
               <div className="p-10 bg-primary-orange rounded-[40px] text-white shadow-xl shadow-orange-100 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight italic">Experience {attraction.name} with us</h3>
                     <p className="text-sm opacity-90 font-medium">Join our curated Spiti expeditions to explore this magical place and many others.</p>
                     <Link href="/trips" className="w-full h-14 bg-white text-primary-orange rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:bg-navy hover:text-white transition-all shadow-xl">
                        View Expeditions
                     </Link>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      <Footer 
        logoUrl={settings?.footer?.logoUrl} 
        address={settings?.footer?.address} 
        phone={settings?.footer?.phone} 
      />
    </main>
  );
}
