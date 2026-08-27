import type { ReactNode } from "react";
import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book a Trip | YouthCamping",
  description: "Book a YouthCamping group adventure trip.",
  path: "/book",
  index: false,
});

export default function BookLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
