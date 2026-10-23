import { ReportDemo } from "@/components/ReportDemo";
import { parseDemoBrand, type DemoPageProps } from "@/lib/demo-brand";
import { getDemoLinks } from "@/lib/demo-links";

export default async function ReportPage({ searchParams }: DemoPageProps) {
  const brand = parseDemoBrand((await searchParams).brand);
  return <ReportDemo brand={brand} roiHref={getDemoLinks(brand).roiHref} />;
}
