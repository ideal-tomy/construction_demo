import { HubView } from "@/components/HubView";
import { CameraStory } from "@/components/CameraStory";

type Props = {
  searchParams: Promise<{ embed?: string; from?: string }>;
};

export default async function HubPage({ searchParams }: Props) {
  const sp = await searchParams;
  if (sp.embed === "intro") {
    return (
      <div className="embedIntroRoot">
        <CameraStory />
      </div>
    );
  }
  return <HubView />;
}
