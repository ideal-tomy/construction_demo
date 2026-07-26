"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OpsDashboard } from "@/components/ops/OpsDashboard";
import { OpsNotificationDetail } from "@/components/ops/OpsNotificationDetail";
import { OpsNudgeModal } from "@/components/ops/OpsNudgeModal";
import { OpsShell } from "@/components/ops/OpsShell";
import {
  buildDefaultOpsNotification,
  buildOpsNotificationFromHandoff,
  clearOpsHandoff,
  defaultMissingPhotos,
  readOpsHandoff,
  type OpsMissingPhoto,
  type OpsNotification
} from "@/lib/opsSample";

export function OpsApp() {
  const [notifications, setNotifications] = useState<OpsNotification[]>([
    buildDefaultOpsNotification()
  ]);
  const [missing, setMissing] = useState<OpsMissingPhoto[]>(defaultMissingPhotos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nudgeId, setNudgeId] = useState<string | null>(null);
  const [arrival, setArrival] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const booted = useRef(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const fromReport =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("from") === "report";
    const handoff = readOpsHandoff();

    if (handoff) {
      const incoming = buildOpsNotificationFromHandoff(handoff);
      setNotifications([incoming, buildDefaultOpsNotification({ id: "n-report-older", relativeTime: "昨日", status: "reviewed", highlight: false })]);
      clearOpsHandoff();
      if (fromReport) {
        setArrival(true);
        window.history.replaceState({}, "", "/ops");
        window.setTimeout(() => setArrival(false), 4200);
      }
    } else if (fromReport) {
      setNotifications([
        buildDefaultOpsNotification({
          relativeTime: "たった今",
          highlight: true
        })
      ]);
      setArrival(true);
      window.history.replaceState({}, "", "/ops");
      window.setTimeout(() => setArrival(false), 4200);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }

  const active = useMemo(
    () => notifications.find((n) => n.id === activeId) ?? null,
    [notifications, activeId]
  );
  const nudgeItem = useMemo(
    () => missing.find((m) => m.id === nudgeId) ?? null,
    [missing, nudgeId]
  );

  function updateActive(
    updater: (current: OpsNotification) => OpsNotification
  ) {
    if (!activeId) return;
    setNotifications((list) =>
      list.map((item) => (item.id === activeId ? updater(item) : item))
    );
  }

  return (
    <OpsShell toast={toast}>
      <OpsDashboard
        notifications={notifications}
        missing={missing}
        arrival={arrival}
        onOpenNotification={setActiveId}
        onOpenNudge={setNudgeId}
      />

      {active ? (
        <OpsNotificationDetail
          item={active}
          onClose={() => setActiveId(null)}
          onChangeHeader={(key, value) =>
            updateActive((current) => ({
              ...current,
              header: { ...current.header, [key]: value },
              summary: `${key === "projectName" ? value : current.header.projectName} / ${
                key === "siteName" ? value : current.header.siteName
              }`
            }))
          }
          onChangeSection={(key, value) =>
            updateActive((current) => ({
              ...current,
              sections: { ...current.sections, [key]: value }
            }))
          }
          onConfirm={() => {
            updateActive((current) => ({
              ...current,
              status: "reviewed",
              highlight: false
            }));
            showToast("日報を確認済みにしました");
            setActiveId(null);
          }}
        />
      ) : null}

      {nudgeItem ? (
        <OpsNudgeModal
          item={nudgeItem}
          onClose={() => setNudgeId(null)}
          onSend={() => {
            setMissing((list) =>
              list.map((item) =>
                item.id === nudgeItem.id ? { ...item, nudged: true } : item
              )
            );
            setNudgeId(null);
            showToast(`${nudgeItem.assignee}へ催促を送りました`);
          }}
        />
      ) : null}
    </OpsShell>
  );
}
