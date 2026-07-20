"use client";

import type { DemoMode } from "@/lib/types";

type Props = {
  mode: DemoMode;
  onChange: (mode: DemoMode) => void;
  disabled?: boolean;
};

export function ModeSelector({ mode, onChange, disabled }: Props) {
  return (
    <div className="modeSelector no-print" role="tablist" aria-label="体験モード">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "report"}
        className={mode === "report" ? "active" : ""}
        disabled={disabled}
        onClick={() => onChange("report")}
      >
        報告書作成
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "toolbox"}
        className={mode === "toolbox" ? "active" : ""}
        disabled={disabled}
        onClick={() => onChange("toolbox")}
      >
        朝礼向け解析
      </button>
    </div>
  );
}
