import { getQuotationSmartResult } from "@/lib/db-smart";
import PremiumQuoteLanding from "@/components/PremiumQuoteLanding";
import ServiceUnavailable from "@/components/ServiceUnavailable";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const isAdmin = sParams.isAdmin === "true";
  const token = typeof sParams.token === "string" ? sParams.token : "";

  const result = await getQuotationSmartResult(slug, isAdmin, token);

  if (!result.ok) {
    return (
      <ServiceUnavailable title="This quote is temporarily unavailable" />
    );
  }

  const data = result.data;
  if (!data) {
    return notFound();
  }

  if (data.status?.toLowerCase() === "draft" && !isAdmin && !token) {
    return notFound();
  }

  return <PremiumQuoteLanding q={data} />;
}
