import { Metadata } from "next";
import Link from "next/link";
import { Backpack, CheckCircle2 } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Packing List | YouthCamping",
  description:
    "What to pack for a YouthCamping group trip: documents, clothing, shoes, and mountain essentials.",
  path: "/packing-list",
});

const groups = [
  {
    title: "Documents",
    items: [
      "Government photo ID (original + a photocopy or phone photo)",
      "Booking confirmation / trip WhatsApp group details",
      "Any medical notes or prescriptions you already use",
    ],
  },
  {
    title: "Clothing",
    items: [
      "Quick-dry t-shirts and a warm layer for cold evenings",
      "Comfortable trekking pants or joggers",
      "Rain jacket or poncho (Himalayan weather changes fast)",
      "Extra socks and a cap or buff",
    ],
  },
  {
    title: "Shoes & bag",
    items: [
      "Broken-in walking or trekking shoes with grip",
      "A 40–60L backpack for clothing and a small daypack if you have one",
      "A dry bag or zip pouches for electronics and wet clothes",
    ],
  },
  {
    title: "Personal kit",
    items: [
      "Sunscreen, lip balm, and a basic first-aid pouch",
      "Reusable water bottle",
      "Power bank and phone charger",
      "Personal toiletries (keep it light)",
    ],
  },
];

export default function PackingListPage() {
  return (
    <div className="bg-white min-h-screen pt-24 font-montserrat pb-20">
      <section className="bg-[#0B1528] text-white py-16 sm:py-20 px-5 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="bg-white/10 text-[#D4541A] font-extrabold tracking-widest uppercase text-xs px-3.5 py-1.5 rounded-full inline-block">
            Before you leave
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            PACKING <span className="text-[#D4541A]">LIST</span>
          </h1>
          <div className="w-16 h-1.5 bg-[#D4541A] rounded-full mx-auto my-3" />
          <p className="text-xs sm:text-sm text-zinc-300 font-semibold max-w-xl mx-auto leading-relaxed">
            A practical checklist for YouthCamping group trips. Your trip
            captain may add destination-specific notes in the batch WhatsApp
            group.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-6">
        {groups.map((group) => (
          <section
            key={group.title}
            className="bg-white border border-zinc-200/90 rounded-[28px] p-6 sm:p-8 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Backpack className="w-5 h-5 text-[#D4541A]" />
              <h2 className="text-lg font-black text-[#0B1528] uppercase tracking-tight">
                {group.title}
              </h2>
            </div>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-zinc-600 font-medium leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D4541A] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-xs sm:text-sm text-zinc-500 font-medium text-center">
          Need trip-specific help?{" "}
          <Link href="/contact" className="text-[#D4541A] font-bold">
            Contact us
          </Link>{" "}
          or read{" "}
          <Link href="/how-it-works" className="text-[#D4541A] font-bold">
            how booking works
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
