import { HubView } from "@/components/HubView";
import { CameraStory } from "@/components/CameraStory";

type Props = {
  searchParams: Promise<{ embed?: string; from?: string; view?: string }>;
};

export default async function HubPage({ searchParams }: Props) {
  const sp = await searchParams;
  if (sp.embed === "intro") {
    const stage = sp.view === "stage";
    return (
      <main className={`ki-embed-intro${stage ? " ki-embed-stage" : ""}`}>
        <CameraStory stage={stage} embed />
      </main>
    );
  }
  return <HubView />;
}
