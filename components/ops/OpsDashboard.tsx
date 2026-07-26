"use client";

import type { OpsMissingPhoto, OpsNotification } from "@/lib/opsSample";

type Props = {
  notifications: OpsNotification[];
  missing: OpsMissingPhoto[];
  arrival?: boolean;
  onOpenNotification: (id: string) => void;
  onOpenNudge: (id: string) => void;
};

export function OpsDashboard({
  notifications,
  missing,
  arrival,
  onOpenNotification,
  onOpenNudge
}: Props) {
  const unread = notifications.filter((n) => n.status === "unread").length;
  const photoCount = notifications.reduce(
    (sum, n) => sum + n.images.length,
    0
  );
  const missingOpen = missing.filter((m) => !m.nudged).length;

  return (
    <div className="opsDash">
      {arrival ? (
        <div className="opsArrival" role="status">
          日報が届きました
        </div>
      ) : null}

      <section className="opsKpiRow" aria-label="概要">
        <article className="opsKpi">
          <p>未確認</p>
          <strong>{unread}</strong>
          <span>件</span>
        </article>
        <article className="opsKpi opsKpiAccent">
          <p>写真</p>
          <strong>{photoCount || 4}</strong>
          <span>枚</span>
        </article>
        <article className="opsKpi opsKpiWarn">
          <p>不足</p>
          <strong>{missingOpen}</strong>
          <span>件</span>
        </article>
      </section>

      <div className="opsGrid">
        <section className="opsCard">
          <div className="opsCardHead">
            <h2>通知</h2>
            <span>日報</span>
          </div>
          <ul className="opsFeed">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`opsFeedItem ${
                    item.highlight ? "isHighlight" : ""
                  } ${item.status === "reviewed" ? "isReviewed" : ""}`}
                  onClick={() => onOpenNotification(item.id)}
                >
                  <span className="opsFeedIcon" aria-hidden>
                    {item.status === "reviewed" ? "✓" : "●"}
                  </span>
                  <span className="opsFeedBody">
                    <strong>{item.title}</strong>
                    <em>
                      {item.summary} · {item.relativeTime}
                      {item.status === "reviewed" ? " · 確認済" : ""}
                    </em>
                  </span>
                  <span className="opsFeedAction" aria-hidden>
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="opsCard">
          <div className="opsCardHead">
            <h2>不足写真</h2>
            <span>催促</span>
          </div>
          <ul className="opsMissingList">
            {missing.map((item) => (
              <li key={item.id} className="opsMissingItem">
                <div className="opsMissingMain">
                  <strong>{item.label}</strong>
                  <p>{item.reason}</p>
                </div>
                <button
                  type="button"
                  className="opsPrimaryBtn opsNudgeBtn"
                  disabled={item.nudged}
                  onClick={() => onOpenNudge(item.id)}
                >
                  {item.nudged ? "済" : "催促"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
