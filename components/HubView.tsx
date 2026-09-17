import Link from "next/link";
import { CameraStory } from "@/components/CameraStory";
import { getRoiSimulatorUrl } from "@/lib/roiLink";
import { CONTACT_URL, hubCopy, hubDemos, type HubDemo } from "@/lib/hub";

function DemoCard({ demo }: { demo: HubDemo }) {
  const body = (
    <>
      <div>
        <p className="hubCardStep">
          {demo.step} {demo.title}
        </p>
        <p className="hubCardCore">{demo.core}</p>
        {demo.note ? <p className="hubCardNote">{demo.note}</p> : null}
      </div>
      <span className="hubCardCta">
        {demo.cta}
        {demo.external ? " ↗" : " →"}
      </span>
    </>
  );

  if (demo.external) {
    return (
      <a
        href={demo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="hubCard"
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={demo.href} className="hubCard">
      {body}
    </Link>
  );
}

export function HubView() {
  const roiHref = getRoiSimulatorUrl();
  const { title, englishLabel, comboLine } = hubCopy;

  return (
    <div className="hubRoot">
      <div className="hubInner">
        <p className="hubEyebrow">{englishLabel}</p>
        <h1 className="hubTitle">{title}</h1>

        <div className="hubCombo">
          <p className="hubComboLabel">つながると</p>
          <p className="hubComboText">{comboLine}</p>
        </div>

        <CameraStory />

        <ol className="hubList">
          {hubDemos.map((demo) => (
            <li key={demo.id}>
              <DemoCard demo={demo} />
            </li>
          ))}
        </ol>

        <div className="hubFooter">
          {roiHref ? (
            <a
              href={roiHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hubRoi"
            >
              投資回収の目安 ↗
            </a>
          ) : null}
          <a href={CONTACT_URL} className="hubContact">
            相談する
          </a>
        </div>
      </div>
    </div>
  );
}
