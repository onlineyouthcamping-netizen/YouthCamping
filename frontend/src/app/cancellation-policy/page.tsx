import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RefundSchedule } from "@/components/legal/RefundSchedule";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cancellation Policy | YouthCamping",
  description:
    "Official cancellation and refund terms for YouthCamping adventure trips.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-24 font-montserrat pb-20">
      <section className="bg-[#0B1528] text-white py-16 sm:py-20 px-5 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="bg-white/10 text-[#D4541A] font-extrabold tracking-widest uppercase text-xs px-3.5 py-1.5 rounded-full inline-block">
            Transparent refund timelines
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Cancellation & <span className="text-[#D4541A]">Refund Policy</span>
          </h1>
          <div className="w-16 h-1.5 bg-[#D4541A] rounded-full mx-auto my-3" />
          <p className="text-xs sm:text-sm text-zinc-300 font-semibold max-w-xl mx-auto leading-relaxed">
            Cancellation policy is mentioned on every trip page. If not mentioned
            specifically, this policy is considered final.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <div className="bg-white border border-zinc-200/90 rounded-[28px] p-6 sm:p-10 space-y-8">
          <section className="space-y-3 border-b border-zinc-100 pb-8">
            <h2 className="text-lg sm:text-xl font-black text-[#0B1528] uppercase tracking-tight">
              How cancellation is granted
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
              <p>
                Cancellation would be granted by the Higher Authorities on
                receiving a cancellation request through registered mail ID
                only. The cancellation amount below mentioned will be counted on
                total fees only.
              </p>
              <p>
                The refund amount will be paid in 7 to 12 working days through a
                bank transfer.
              </p>
            </div>
          </section>

          <section className="space-y-4 border-b border-zinc-100 pb-8">
            <h2 className="text-lg sm:text-xl font-black text-[#0B1528] uppercase tracking-tight">
              Refund schedule
            </h2>
            <RefundSchedule />
            <ul className="list-disc space-y-2 pl-5 text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
              <li>The above charges will be applied on the total package cost.</li>
              <li>
                Full payment has to be done before 15 days of trip departure. If
                not paid, participation will be cancelled.
              </li>
              <li>
                If the trip is called off by management due to a natural
                calamity or unforeseen circumstances, we will issue a refund of
                fees after deducting train tickets cancellation charges.
              </li>
            </ul>
          </section>

          <p className="text-xs sm:text-sm text-zinc-600 font-medium">
            These rules form part of our{" "}
            <Link
              href="/terms-and-conditions"
              className="text-[#D4541A] font-bold underline underline-offset-2"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
