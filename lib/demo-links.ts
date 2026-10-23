import "server-only";
import { getContactUrl, type DemoBrand } from "./demo-brand";
import { getRoiSimulatorUrl } from "./roiLink";

/** Resolve environment configuration on the server, including for completion CTAs. */
export function getDemoLinks(brand: DemoBrand) {
  return {
    roiHref: getRoiSimulatorUrl(brand, process.env.NEXT_PUBLIC_ROI_SIMULATOR_URL),
    contactHref: getContactUrl(
      brand,
      brand === "axeon"
        ? process.env.NEXT_PUBLIC_AXEON_CONTACT_URL
        : process.env.NEXT_PUBLIC_IDEAL_CONTACT_URL || process.env.NEXT_PUBLIC_CONTACT_URL,
    ),
  };
}
