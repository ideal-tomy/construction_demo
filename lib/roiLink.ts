const ROI_PARAMS = {
  kit: "report-auto",
  industry: "construction",
  cat: "internal",
  from: "construction-demo",
  brand: "ideal",
} as const;

/** roi-simulator への導線URL。未設定時は null（CTA非表示）。 */
export function getRoiSimulatorUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_ROI_SIMULATOR_URL?.trim();
  if (!raw) return null;

  const origin = raw.replace(/\/+$/, "");
  const q = new URLSearchParams(ROI_PARAMS);
  return `${origin}/?${q.toString()}`;
}
