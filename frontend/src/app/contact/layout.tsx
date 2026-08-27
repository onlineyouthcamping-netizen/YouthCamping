import type { ReactNode } from "react";
import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us | YouthCamping",
  description:
    "Talk to the YouthCamping team about group trips, dates, and bookings.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
