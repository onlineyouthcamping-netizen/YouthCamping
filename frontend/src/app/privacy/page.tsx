import { Metadata } from "next";
import { PrivacyPolicyDocument } from "@/components/legal/PrivacyPolicyDocument";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | YouthCamping",
  description:
    "Official privacy policy for YouthCamping: what information we collect, how it is used, and how it is protected.",
  path: "/privacy-policy",
});

export default function PrivacyAliasPage() {
  return <PrivacyPolicyDocument />;
}
