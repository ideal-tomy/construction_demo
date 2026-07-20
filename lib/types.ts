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
