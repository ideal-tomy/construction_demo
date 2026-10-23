import { PhotoSortDemo } from "@/components/PhotoSortDemo";
import { parseDemoBrand, type DemoPageProps } from "@/lib/demo-brand";

export default async function PhotoPage({ searchParams }: DemoPageProps) {
  const brand = parseDemoBrand((await searchParams).brand);
  return <PhotoSortDemo brand={brand} />;
}
