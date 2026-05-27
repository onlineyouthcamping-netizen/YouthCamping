"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

interface TripFAQProps {
  faqs?: FAQ[];
}

export default function TripFAQ({ faqs = [] }: TripFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Use provided FAQs or fall back to default ones if empty
  const displayFaqs = faqs && faqs.length > 0 ? faqs : [
    { question: "Is this trip suitable for solo travelers?", answer: "Absolutely! 60% of our community consists of solo travelers. You'll join a group of like-minded adventurers and leave with a bag full of memories and friends." },
    { question: "What about the altitude and oxygen?", answer: "Spiti is high altitude. We carry oxygen cylinders in all our vehicles and our captains are trained for basic medical emergencies. We ensure slow acclimatization." },
    { question: "What kind of stays are provided?", answer: "We provide a mix of boutique hotels, heritage homestays, and high-altitude camps to give you the most authentic experience of the Himalayas." },
    { question: "How much luggage can I carry?", answer: "We recommend a Rucksack (50-60L) and a Day Bag. Avoid trolley bags as they are difficult to manage in mountain terrain." },
  ];

  return (
    <section className="mb-24">
      <h2 className="text-3xl font-bold text-navy mb-10 tracking-tight italic">FAQ</h2>
      <div className="space-y-4">
        {displayFaqs.map((faq, i) => (
          <div key={i} className="border border-zinc-100 rounded-[25px] overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-8 text-left hover:bg-zinc-50 transition-all"
            >
              <span className="text-lg font-bold text-navy">{faq.question}</span>
              <div className={cn("transition-transform duration-300", openIndex === i ? "rotate-45" : "")}>
                <Plus className="w-6 h-6 text-zinc-400" />
              </div>
            </button>
            <div className={cn(
              "grid transition-all duration-300 ease-in-out",
              openIndex === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <p className="p-8 pt-0 text-zinc-500 font-medium leading-relaxed italic border-t border-zinc-50">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
