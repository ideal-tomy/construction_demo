"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { KANRI_OPS_URL } from "@/lib/hub";

type Props = {
  children: ReactNode;
  toast?: string | null;
};

const NAV_ITEMS = [
  { id: "dash", label: "ダッシュボード", active: true },
  { id: "inbox", label: "通知", active: false },
  { id: "sites", label: "現場", active: false }
] as const;

export function OpsShell({ children, toast }: Props) {
  return (
    <div className="opsRoot">
      <aside className="opsSidebar" aria-label="管理メニュー">
        <div className="opsBrand">
          <span className="opsBrandMark">G</span>
          <div>
            <strong>現場オペ</strong>
            <p>内勤ダッシュボード</p>
          </div>
        </div>
        <nav className="opsNav">
          {NAV_ITEMS.map((item) => (
            <span
              key={item.id}
              className={`opsNavItem ${item.active ? "isActive" : "isMuted"}`}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </span>
          ))}
        </nav>
        <p className="opsSidebarNote">デモ用・主要操作はこの画面で完結します</p>
      </aside>

      <div className="opsMain">
        <header className="opsTopbar">
          <div className="opsTopbarLeft">
            <Link href="/" className="opsBack">
              ← ハブ
            </Link>
            <div>
              <p className="opsEyebrow">③ 現場オペ</p>
              <h1>管理ダッシュボード</h1>
            </div>
          </div>
          <div className="opsTopbarRight">
            <span className="opsModePill">内勤モード</span>
            <span className="opsSitePill">現場A 住宅新築工事</span>
          </div>
        </header>

        <div className="opsContent">{children}</div>

        <footer className="opsFooter">
          <p>セッション内の体験用データです。実サーバには保存されません。</p>
          <a
            href={KANRI_OPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="opsExternal"
          >
            本格アプリを見る ↗
          </a>
        </footer>
      </div>

      {toast ? (
        <div className="opsToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
