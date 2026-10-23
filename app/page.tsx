import { HubView } from "@/components/HubView";
import { CameraStory } from "@/components/CameraStory";
import { parseDemoBrand, type DemoPageProps } from "@/lib/demo-brand";
import { getDemoLinks } from "@/lib/demo-links";

export default async function HubPage({ searchParams }: DemoPageProps) {
  const sp = await searchParams;
  if (sp.embed === "intro") {
    const stage = sp.view === "stage";
    return (
      <main className={`ki-embed-intro${stage ? " ki-embed-stage" : ""}`}>
        <CameraStory stage={stage} embed />
      </main>
    );
  }
  const brand = parseDemoBrand(sp.brand);
  return <HubView brand={brand} {...getDemoLinks(brand)} />;
}
