import { constructionPhotoSample } from "@/lib/photoSample";
import { PHOTO_FLOW_SAMPLE_ID, SAMPLE_SETS } from "@/lib/samples";
import type {
  ReportHeader,
  ReportSections,
  SourceImage
} from "@/lib/types";

export const OPS_HANDOFF_KEY = "construction_ops_handoff";

export type OpsHandoffPayload = {
  from: "report";
  submittedAt: string;
  title: string;
  header: ReportHeader;
  sections: Pick<
    ReportSections,
    "workSummary" | "progress" | "requests" | "photoFindings"
  >;
  images: SourceImage[];
};

export type OpsNotificationStatus = "unread" | "reviewed";

export type OpsNotification = {
  id: string;
  kind: "daily_report";
  title: string;
  summary: string;
  sender: string;
  relativeTime: string;
  status: OpsNotificationStatus;
  highlight?: boolean;
  titleDoc: string;
  header: ReportHeader;
  sections: {
    workSummary: string;
    progress: string;
    requests: string;
    photoFindings: string;
  };
  images: SourceImage[];
};

export type OpsMissingPhoto = {
  id: string;
  label: string;
  reason: string;
  siteName: string;
  assignee: string;
  nudgePreview: string;
  nudged?: boolean;
};

function defaultReportDraft() {
  const sample = SAMPLE_SETS.find((item) => item.id === PHOTO_FLOW_SAMPLE_ID);
  if (!sample || sample.draft.templateId !== "site_daily_report_v1") {
    throw new Error("report-from-photo sample missing");
  }
  return sample.draft;
}

function defaultImages(): SourceImage[] {
  return constructionPhotoSample.results.map((r) => ({
    name: r.newName,
    previewUrl: r.src
  }));
}

export function buildDefaultOpsNotification(
  overrides?: Partial<OpsNotification>
): OpsNotification {
  const draft = defaultReportDraft();
  return {
    id: "n-report-a",
    kind: "daily_report",
    title: "現場太郎から日報が届きました",
    summary: `${draft.header.projectName} / ${draft.header.siteName}`,
    sender: draft.header.reporter,
    relativeTime: "30分前",
    status: "unread",
    titleDoc: draft.title,
    header: { ...draft.header },
    sections: {
      workSummary: draft.sections.workSummary,
      progress: draft.sections.progress,
      requests: draft.sections.requests,
      photoFindings: draft.sections.photoFindings
    },
    images: defaultImages(),
    ...overrides
  };
}

export function buildOpsNotificationFromHandoff(
  handoff: OpsHandoffPayload
): OpsNotification {
  return {
    id: "n-report-handoff",
    kind: "daily_report",
    title: `${handoff.header.reporter || "現場"}から日報が届きました`,
    summary: `${handoff.header.projectName} / ${handoff.header.siteName}`,
    sender: handoff.header.reporter,
    relativeTime: "たった今",
    status: "unread",
    highlight: true,
    titleDoc: handoff.title,
    header: { ...handoff.header },
    sections: { ...handoff.sections },
    images: handoff.images.length ? handoff.images : defaultImages()
  };
}

export const defaultMissingPhotos: OpsMissingPhoto[] = [
  {
    id: "m-rebar-closeup",
    label: "配筋検査の接写",
    reason: "検査前の配筋は全体写真のみ。継手部の接写が未提出です。",
    siteName: "現場A 基礎工区",
    assignee: "現場太郎",
    nudgePreview:
      "【催促】配筋検査前の継手部接写写真を追加で送ってください。全体写真は受領済みです。"
  },
  {
    id: "m-safety-sign",
    label: "安全看板の設置状況",
    reason: "朝礼写真はありますが、現場入口の安全看板が確認できません。",
    siteName: "現場A 基礎工区",
    assignee: "現場太郎",
    nudgePreview:
      "【催促】現場入口の安全看板（設置状況）の写真を1枚追加でお願いします。"
  }
];

export function saveOpsHandoff(payload: OpsHandoffPayload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(OPS_HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function readOpsHandoff(): OpsHandoffPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OPS_HANDOFF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OpsHandoffPayload;
  } catch {
    return null;
  }
}

export function clearOpsHandoff() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(OPS_HANDOFF_KEY);
  } catch {
    /* ignore */
  }
}

export function createOpsHandoffFromDraft(input: {
  title: string;
  header: ReportHeader;
  sections: ReportSections;
  images: SourceImage[];
}): OpsHandoffPayload {
  return {
    from: "report",
    submittedAt: new Date().toISOString(),
    title: input.title,
    header: { ...input.header },
    sections: {
      workSummary: input.sections.workSummary,
      progress: input.sections.progress,
      requests: input.sections.requests,
      photoFindings: input.sections.photoFindings
    },
    images: input.images.map((image) => ({ ...image }))
  };
}
