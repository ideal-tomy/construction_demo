"use client";

import { ChangeEvent, DragEvent, useRef } from "react";
import type { ImageSlot } from "@/lib/types";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  images: ImageSlot[];
  disabled?: boolean;
  onChange: (images: ImageSlot[]) => void;
  onError: (message: string) => void;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MultiImageUploader({
  images,
  disabled,
  onChange,
  onError
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "JPG、PNG、WebP形式の画像を選択してください。";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "各ファイルは10MB以下にしてください。";
    }
    return null;
  }

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    const next = [...images];
    for (const file of incoming) {
      if (next.length >= MAX_FILES) {
        onError(`画像は最大${MAX_FILES}枚までです。`);
        break;
      }
      const error = validate(file);
      if (error) {
        onError(error);
        continue;
      }
      next.push({
        id: createId(),
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file)
      });
    }
    onChange(next);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) return;
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  }

  function removeAt(id: string) {
    const target = images.find((image) => image.id === id);
    if (target && !target.fromSample) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(images.filter((image) => image.id !== id));
  }

  return (
    <div className="multiUploader no-print">
      <div
        className={`dropZone compact ${images.length ? "hasFiles" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="uploadIcon">↑</div>
        <strong>現場写真をドロップ（最大{MAX_FILES}枚）</strong>
        <span>JPG・PNG・WebP / 各10MBまで</span>
        <button type="button" disabled={disabled}>
          画像を選択
        </button>
      </div>

      <input
        ref={inputRef}
        className="hiddenInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled}
        onChange={handleInput}
      />

      {images.length > 0 && (
        <div className="thumbGrid">
          {images.map((image, index) => (
            <div key={image.id} className="thumbCard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.name} />
              <div className="thumbMeta">
                <strong>
                  {index + 1}. {image.name}
                </strong>
                <button
                  type="button"
                  className="textButton"
                  disabled={disabled}
                  onClick={() => removeAt(image.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
