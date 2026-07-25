"use client";

import type { ReactNode } from "react";
import type { ReportDraft, ReportHeader, ReportSections } from "@/lib/types";

type Props = {
  draft: ReportDraft;
  statusLabel?: string;
};

const HEADER_ROWS: { key: keyof ReportHeader; label: string }[] = [
  { key: "projectName", label: "案件名" },
  { key: "siteName", label: "現場名" },
  { key: "date", label: "報告日" },
  { key: "reporter", label: "報告者" },
  { key: "weather", label: "天候" }
];

/** 写真より前に置く本文 */
const BEFORE_PHOTO_SECTIONS: { key: keyof ReportSections; label: string }[] = [
  { key: "workSummary", label: "本日の作業内容" },
  { key: "progress", label: "進捗・完了状況" },
  { key: "materials", label: "使用資材・機材" },
  { key: "safety", label: "安全・ヒヤリハット" }
];

/** 写真行のあとに置く本文 */
const AFTER_PHOTO_SECTIONS: { key: keyof ReportSections; label: string }[] = [
  { key: "photoFindings", label: "写真所見" },
  { key: "nextPlan", label: "翌日予定" },
  { key: "requests", label: "要請事項" }
];

function formatReportDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value || "—";
  const year = match[1];
  const month = String(Number(match[2]));
  const day = String(Number(match[3]));
  return `${year}年${month}月${day}日`;
}

function displayValue(
  key: keyof ReportHeader | keyof ReportSections,
  value: string
) {
  if (key === "date") return formatReportDate(value);
  return value.trim() || "—";
}

function SectionBlock({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="printFormSection">
      <h4 className="printFormSectionTitle">{label}</h4>
      <div className="printFormBody">{children}</div>
    </section>
  );
}

export function ReportPrintView({ draft, statusLabel = "確認済" }: Props) {
  return (
    <article className="printForm reportPrintForm print-target">
      <header className="printFormTop">
        <div className="printFormTopMain">
          <p className="printFormEyebrow">CONSTRUCTION SITE REPORT</p>
          <h3>{draft.title}</h3>
          <p className="printFormLead">
            以下のとおり現場の状況を確認したので、その結果を報告します。
          </p>
        </div>
        <div className="printFormMeta">
          <span className="printFormStamp">{statusLabel}</span>
          <dl>
            <div>
              <dt>報告日</dt>
              <dd>{formatReportDate(draft.header.date)}</dd>
            </div>
            <div>
              <dt>報告者</dt>
              <dd>{draft.header.reporter || "—"}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="printFormSection">
        <h4 className="printFormSectionTitle">基本情報</h4>
        <table className="printFormTable printFormTableCompact">
          <tbody>
            {HEADER_ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                <td>{displayValue(row.key, draft.header[row.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {BEFORE_PHOTO_SECTIONS.map((row) => (
        <SectionBlock key={row.key} label={row.label}>
          {displayValue(row.key, draft.sections[row.key])}
        </SectionBlock>
      ))}

      {draft.sourceImages.length > 0 ? (
        <section className="printFormSection printFormPhotoSection">
          <h4 className="printFormSectionTitle">
            添付写真（{draft.sourceImages.length}枚）
          </h4>
          <div className="printFormPhotoGrid">
            {draft.sourceImages.map((image, index) => (
              <figure key={`${image.name}-${index}`} className="printFormPhoto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt={`写真${index + 1}`} />
                <figcaption>
                  <strong>写真{index + 1}</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {AFTER_PHOTO_SECTIONS.map((row) => (
        <SectionBlock key={row.key} label={row.label}>
          {displayValue(row.key, draft.sections[row.key])}
        </SectionBlock>
      ))}

      <footer className="printFormFooter">
        <p>本報告書は現場写真をもとに作成した確認済み帳票です。送付・保管用</p>
      </footer>
    </article>
  );
}
