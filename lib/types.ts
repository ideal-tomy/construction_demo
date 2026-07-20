export type OcrField = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  needsReview: boolean;
};

export type OcrResult = {
  documentType: string;
  summary: string;
  fields: OcrField[];
  warnings: string[];
};

export type DemoMode = "report" | "toolbox";

export type WorkflowStatus =
  | "idle"
  | "receiving"
  | "reading"
  | "drafting"
  | "draft"
  | "reviewed"
  | "submitted"
  | "error";

export type ReviewField = {
  path: string;
  reason: string;
};

export type SourceImage = {
  name: string;
  previewUrl: string;
};

export type ReportHeader = {
  projectName: string;
  siteName: string;
  date: string;
  reporter: string;
  weather: string;
};

export type ReportSections = {
  workSummary: string;
  progress: string;
  materials: string;
  safety: string;
  photoFindings: string;
  nextPlan: string;
  requests: string;
};

export type ReportDraft = {
  templateId: "site_daily_report_v1";
  title: string;
  header: ReportHeader;
  sections: ReportSections;
  reviewFields: ReviewField[];
  sourceImages: SourceImage[];
  ocrDetail?: OcrResult;
};

export type ToolboxBriefing = {
  templateId: "morning_briefing_v1";
  title: string;
  date: string;
  siteName: string;
  summary: string;
  focusWorks: string[];
  safetyPoints: string[];
  cautionAreas: string[];
  talkScripts: string[];
  reviewFields: ReviewField[];
  sourceImages: SourceImage[];
  ocrDetail?: OcrResult;
};

export type DraftResult = ReportDraft | ToolboxBriefing;

export type ImageSlot = {
  id: string;
  file?: File;
  name: string;
  previewUrl: string;
  fromSample?: boolean;
};

export function isReportDraft(draft: DraftResult): draft is ReportDraft {
  return draft.templateId === "site_daily_report_v1";
}

export function isToolboxBriefing(
  draft: DraftResult
): draft is ToolboxBriefing {
  return draft.templateId === "morning_briefing_v1";
}
