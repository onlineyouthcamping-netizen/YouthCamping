import { Metadata } from "next";
import { TermsAndConditionsDocument } from "@/components/legal/TermsAndConditionsDocument";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions | YouthCamping",
  description:
    "Official terms and conditions for YouthCamping adventure and leisure trips, including booking, payments, cancellation, and liability.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return <TermsAndConditionsDocument />;
}
