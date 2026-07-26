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
          提出した日報が管理画面に届きました
        </div>
      ) : null}

      <section className="opsKpiRow" aria-label="概要">
        <article className="opsKpi">
          <p>未確認通知</p>
          <strong>{unread}</strong>
          <span>件</span>
        </article>
        <article className="opsKpi opsKpiAccent">
          <p>本日の写真</p>
          <strong>{photoCount || 4}</strong>
          <span>枚</span>
        </article>
        <article className="opsKpi opsKpiWarn">
          <p>不足アラート</p>
          <strong>{missingOpen}</strong>
          <span>件</span>
        </article>
      </section>

      <div className="opsGrid">
        <section className="opsCard">
          <div className="opsCardHead">
            <h2>通知</h2>
            <span>写真・日報</span>
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
                    <span>{item.summary}</span>
                    <em>
                      {item.sender} · {item.relativeTime}
                      {item.status === "reviewed" ? " · 確認済み" : ""}
                    </em>
                  </span>
                  <span className="opsFeedAction">開く</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="opsCard">
          <div className="opsCardHead">
            <h2>不足している現場写真</h2>
            <span>催促できます</span>
          </div>
          <ul className="opsMissingList">
            {missing.map((item) => (
              <li key={item.id} className="opsMissingItem">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.reason}</p>
                  <em>
                    {item.siteName} · 担当 {item.assignee}
                  </em>
                </div>
                <button
                  type="button"
                  className="opsPrimaryBtn"
                  disabled={item.nudged}
                  onClick={() => onOpenNudge(item.id)}
                >
                  {item.nudged ? "催促済み" : "催促する"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
