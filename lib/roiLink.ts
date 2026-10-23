import type { DemoBrand } from "./demo-brand";

const ROI_PARAMS = {
  kit: "report-auto",
  industry: "construction",
  cat: "internal",
  from: "construction-demo",
} as const;

/** roi-simulator への導線URL。未設定時は null（CTA非表示）。 */
export function getRoiSimulatorUrl(brand: DemoBrand, origin?: string): string | null {
  const raw = origin?.trim();
  if (!raw) return null;

  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  for (const [key, value] of Object.entries(ROI_PARAMS)) url.searchParams.set(key, value);
  url.searchParams.set("brand", brand);
  return url.toString();
}
