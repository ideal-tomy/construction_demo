"use client";

import { OpsDashboard } from "@/components/ops/OpsDashboard";
import {
  buildDefaultOpsNotification,
  defaultMissingPhotos,
  type OpsMissingPhoto,
  type OpsNotification,
} from "@/lib/opsSample";

export type OpsStoryPhase =
  | "idle"
  | "arrive"
  | "reviewed"
  | "nudged"
  | "submitPress"
  | "submitted";

type Props = {
  phase: OpsStoryPhase;
};

function notificationsFor(phase: OpsStoryPhase): OpsNotification[] {
  const older = buildDefaultOpsNotification({
    id: "n-report-older",
    relativeTime: "昨日",
    status: "reviewed",
    highlight: false,
  });

  if (phase === "idle") return [older];

  const incoming = buildDefaultOpsNotification({
    id: "n-report-now",
    relativeTime: "たった今",
    highlight: phase === "arrive",
    status: phase === "arrive" ? "unread" : "reviewed",
  });

  return [incoming, older];
}

function missingFor(phase: OpsStoryPhase): OpsMissingPhoto[] {
  const nudged = phase === "nudged" || phase === "submitPress" || phase === "submitted";
  return defaultMissingPhotos.map((item, index) =>
    index === 0 ? { ...item, nudged } : { ...item }
  );
}

export function OpsStoryPane({ phase }: Props) {
  const notifications = notificationsFor(phase);
  const missing = missingFor(phase);
  const submitted = phase === "submitted";
  const pressing = phase === "submitPress";

  return (
    <div className="opsRoot opsStoryRoot">
      <div className="opsMain">
        <header className="opsTopbar">
          <div className="opsTopbarLeft">
            <div>
              <p className="opsEyebrow">③ 現場オペ</p>
              <h1>承認</h1>
            </div>
          </div>
          <div className="opsTopbarRight">
            <span className="opsModePill">責任者 · 現場A</span>
          </div>
        </header>
        <div className="opsContent">
          <OpsDashboard
            notifications={notifications}
            missing={missing}
            arrival={phase === "arrive"}
            onOpenNotification={() => {}}
            onOpenNudge={() => {}}
          />
          <div className="opsStorySubmit">
            <button
              type="button"
              className={`opsPrimaryBtn opsStorySubmitBtn${pressing ? " isStoryPress" : ""}${
                submitted ? " isDone" : ""
              }`}
              tabIndex={-1}
              disabled
            >
              {submitted ? "承認済" : "承認する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
