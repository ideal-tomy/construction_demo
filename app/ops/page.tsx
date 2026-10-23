import { OpsApp } from "@/components/ops/OpsApp";
import { parseDemoBrand, type DemoPageProps } from "@/lib/demo-brand";

export default async function OpsPage({ searchParams }: DemoPageProps) {
  const brand = parseDemoBrand((await searchParams).brand);
  return <OpsApp brand={brand} />;
}
