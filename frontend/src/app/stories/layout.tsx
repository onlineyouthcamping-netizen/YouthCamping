import type { ReactNode } from "react";
import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Travel Stories | YouthCamping",
  description:
    "Travel diaries, packing notes, and route stories from YouthCamping trips.",
  path: "/stories",
});

export default function StoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
