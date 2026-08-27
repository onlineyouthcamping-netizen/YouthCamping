import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mountain } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Manali Trekking Camp with YouthCamping",
  description:
    "A YouthCamping Manali trekking camp story from the trail — and the current Manali group trips you can join.",
  path: "/manali-trekking-camp-with-youthcamping",
});

export default function ManaliTrekkingCampPage() {
  return (
    <div className="bg-white min-h-screen pt-24 font-montserrat pb-20">
      <section className="bg-[#0B1528] text-white py-16 sm:py-20 px-5 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="bg-white/10 text-[#D4541A] font-extrabold tracking-widest uppercase text-xs px-3.5 py-1.5 rounded-full inline-block">
            Trip story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            MANALI TREKKING <span className="text-[#D4541A]">CAMP</span>
          </h1>
          <div className="w-16 h-1.5 bg-[#D4541A] rounded-full mx-auto my-3" />
          <p className="text-xs sm:text-sm text-zinc-300 font-semibold max-w-xl mx-auto leading-relaxed">
            This page keeps the old Manali trekking camp URL alive. It was a
            traveller diary from a YouthCamping batch, not a current departure
            listing.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-8">
        <div className="bg-white border border-zinc-200/90 rounded-[28px] p-6 sm:p-10 space-y-4">
          <Mountain className="w-8 h-8 text-[#D4541A]" />
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            The original page was a first-person account of a Manali trekking
            camp: a long train journey from Gujarat, a halt at Pathankot, and
            days in the mountains with a YouthCamping group. That diary is not
            a live trip product on this website.
          </p>
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            If you are looking for a current Manali group trip, use the live
            itineraries below rather than this historical URL.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-black text-[#0B1528] uppercase tracking-tight">
            Current Manali trips
          </h2>
          <Link
            href="/trips/manali-kasol-adventure"
            className="flex items-center justify-between border border-zinc-200/90 rounded-2xl px-5 py-4 text-sm font-bold text-[#0B1528] hover:border-[#D4541A] hover:text-[#D4541A] transition-colors"
          >
            Manali Kasol Adventure <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/trips/manali-kasol-summer-2026"
            className="flex items-center justify-between border border-zinc-200/90 rounded-2xl px-5 py-4 text-sm font-bold text-[#0B1528] hover:border-[#D4541A] hover:text-[#D4541A] transition-colors"
          >
            Manali Kasol Summer 2026 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4541A] pt-2"
          >
            Browse all trips <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
