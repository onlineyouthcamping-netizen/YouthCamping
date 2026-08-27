import type { ReactNode } from "react";
import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQs | YouthCamping",
  description:
    "Answers to common YouthCamping questions on booking, payments, train tickets, and stays.",
  path: "/questions",
});

export default function QuestionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
