"use client";

type Props = {
  visible: boolean;
  senderName: string;
  photoCount: number;
  onDismiss?: () => void;
};

export function ChatArrivalToast({
  visible,
  senderName,
  photoCount,
  onDismiss
}: Props) {
  if (!visible) return null;

  return (
    <div className="chatToast no-print" role="status" aria-live="polite">
      <div className="chatToastAvatar">{senderName.slice(0, 1)}</div>
      <div className="chatToastBody">
        <strong>{senderName}さんから写真が届きました</strong>
        <span>
          現場チャット経由で {photoCount}{" "}
          枚の写真を受信。下書き作成を開始します…
        </span>
      </div>
      {onDismiss && (
        <button type="button" className="textButton" onClick={onDismiss}>
          閉じる
        </button>
      )}
    </div>
  );
}
