export type DemoBrand = "axeon" | "ideal";

export type DemoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Official destinations are configured per brand, never from an entry URL. */
export const DEMO_BRANDS = {
  axeon: {
    name: "AXEON",
    siteUrl: "https://www.axeon.jp/",
    contactUrl: "https://www.axeon.jp/contact?demo=construction-hub",
    contactOrigins: ["https://www.axeon.jp", "https://axeon.jp"],
  },
  ideal: {
    name: "ideal",
    siteUrl: "https://ideal-official-three.vercel.app/",
    contactUrl: "https://ideal-official-three.vercel.app/contact?service=ai-consulting&intent=gallery&demo=construction-hub",
    contactOrigins: ["https://ideal-official-three.vercel.app"],
  },
} as const;

export const DEMO_BRAND_NAMES: Record<DemoBrand, string> = {
  axeon: DEMO_BRANDS.axeon.name,
  ideal: DEMO_BRANDS.ideal.name,
};

/** Unspecified legacy construction links continue to use ideal. */
export function parseDemoBrand(raw: string | string[] | null | undefined): DemoBrand {
  return raw === "axeon" ? "axeon" : "ideal";
}

/** Only app-relative paths are accepted; preserve route-specific query and hash. */
export function demoHref(path: string, brand: DemoBrand): string {
  const base = "https://construction-demo.invalid";
  const url = new URL(path, base);
  if (!path.startsWith("/") || url.origin !== base) {
    throw new Error("Expected a construction demo path");
  }
  url.searchParams.set("brand", brand);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Consume a one-time handoff without dropping the brand or other parameters. */
export function consumeDemoFrom(path: string, brand: DemoBrand): string {
  const url = new URL(demoHref(path, brand), "https://construction-demo.invalid");
  url.searchParams.delete("from");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getContactUrl(brand: DemoBrand, override?: string): string {
  const config = DEMO_BRANDS[brand];
  if (override?.trim()) {
    try {
      const url = new URL(override.trim());
      const allowedOrigins: readonly string[] = config.contactOrigins;
      if (allowedOrigins.includes(url.origin) && !url.username && !url.password) {
        return url.toString();
      }
    } catch {
      // Invalid settings must not replace the resolved brand's official destination.
    }
  }
  return config.contactUrl;
}
