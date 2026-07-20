"use client";

import { getSamplesForMode } from "@/lib/samples";
import type { DemoMode } from "@/lib/types";

type Props = {
  mode: DemoMode;
  disabled?: boolean;
  onSelect: (sampleId: string) => void;
};

export function SampleLauncher({ mode, disabled, onSelect }: Props) {
  const samples = getSamplesForMode(mode);

  return (
    <div className="sampleLauncher no-print">
      <div className="sampleLauncherHeader">
        <strong>サンプルで試す（推奨）</strong>
        <span>APIキー不要。商談の主導線はこちら</span>
      </div>
      <div className="sampleButtons">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(sample.id)}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
