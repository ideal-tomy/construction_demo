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
      <div className={`embedIntroRoot${stage ? " embedIntroStage" : ""}`}>
        <CameraStory stage={stage} />
      </div>
    );
  }
  return <HubView />;
}
