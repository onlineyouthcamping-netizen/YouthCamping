import { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Compass, Users, ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join Our Team | YouthCamping",
  description:
    "Join the YouthCamping team: trip captains, operations, and volunteers who run group adventure trips across India.",
  path: "/join-our-team",
});

const roles = [
  {
    title: "Make a difference",
    description:
      "Help shape group trip experiences for young travellers and keep trips safe, organised, and memorable.",
    icon: HeartHandshake,
  },
  {
    title: "Work with the crew",
    description:
      "Collaborate with trip captains, operations, and the Ahmedabad team — in the office and on the trail.",
    icon: Users,
  },
  {
    title: "Grow on the road",
    description:
      "Build leadership, outdoor, and traveller-support skills across Himalayan and South India circuits.",
    icon: Compass,
  },
];

export default function JoinOurTeamPage() {
  return (
    <div className="bg-white min-h-screen pt-24 font-montserrat pb-20">
      <section className="bg-[#0B1528] text-white py-16 sm:py-20 px-5 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="bg-white/10 text-[#D4541A] font-extrabold tracking-widest uppercase text-xs px-3.5 py-1.5 rounded-full inline-block">
            Careers & volunteering
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            JOIN OUR <span className="text-[#D4541A]">TEAM</span>
          </h1>
          <div className="w-16 h-1.5 bg-[#D4541A] rounded-full mx-auto my-3" />
          <p className="text-xs sm:text-sm text-zinc-300 font-semibold max-w-xl mx-auto leading-relaxed">
            YouthCamping is looking for people who care about safe group travel,
            honest trip operations, and the outdoors.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.title}
            className="bg-white border border-zinc-200/90 rounded-[28px] p-6 shadow-2xs"
          >
            <role.icon className="w-7 h-7 text-[#D4541A] mb-4" />
            <h2 className="text-lg font-black text-[#0B1528] uppercase tracking-tight mb-2">
              {role.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <p className="text-sm text-zinc-600 font-medium leading-relaxed">
          We do not publish a public job board here. If you want to volunteer on
          trips, join operations, or work as a trip captain, write to us with
          your background and the role you are interested in.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#D4541A] text-white font-extrabold uppercase text-xs tracking-wider px-6 py-3 rounded-full"
        >
          Contact the team <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
