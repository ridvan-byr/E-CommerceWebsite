"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Link2, X, ImageIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadProductImage } from "@/lib/api/productsApi";
import { resolveImageUrl } from "@/lib/imageUrl";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

type Tab = "file" | "url";
type UploadState = "idle" | "uploading" | "done" | "error";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

export default function ImageUpload({ value, onChange, disabled = false }: ImageUploadProps) {
  const [tab, setTab] = useState<Tab>("file");
  const [urlInput, setUrlInput] = useState(value.startsWith("/") || value === "" ? "" : value);
  const [dragging, setDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = resolveImageUrl(value) || value;

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        setErrorMsg("Sadece JPG, PNG, WEBP veya GIF yüklenebilir.");
        setUploadState("error");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setErrorMsg(`Dosya boyutu ${MAX_MB} MB sınırını aşıyor.`);
        setUploadState("error");
        return;
      }

      setUploadState("uploading");
      setProgress(0);
      setErrorMsg("");

      try {
        const url = await uploadProductImage(file, setProgress);
        onChange(url);
        setUploadState("done");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Yükleme başarısız.");
        setUploadState("error");
      }
    },
    [onChange],
  );

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUploadState("idle");
    setErrorMsg("");
  };

  const clearImage = () => {
    onChange("");
    setUploadState("idle");
    setProgress(0);
    setErrorMsg("");
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90">
        {(["file", "url"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            disabled={disabled}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t === "file" ? <Upload size={13} /> : <Link2 size={13} />}
            {t === "file" ? "Dosya Yükle" : "URL ile Ekle"}
          </button>
        ))}
      </div>

      {/* File tab */}
      {tab === "file" && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => !disabled && uploadState !== "uploading" && fileInputRef.current?.click()}
          className={`relative flex h-40 cursor-pointer select-none flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all
            ${dragging ? "scale-[1.01] border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/25"}
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
            ${uploadState === "uploading" ? "pointer-events-none" : ""}
            `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={onFilePicked}
            className="hidden"
            disabled={disabled}
          />

          {uploadState === "uploading" ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Yükleniyor… {progress}%</span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/50">
                <Upload size={22} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sürükle & bırak veya <span className="text-indigo-600 dark:text-indigo-400">dosya seç</span>
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  JPG, PNG, WEBP, GIF — maks. {MAX_MB} MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={disabled || !urlInput.trim()}
            className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
          >
            Uygula
          </button>
        </div>
      )}

      {/* Error / success banners */}
      {uploadState === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={15} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}
      {uploadState === "done" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-300">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          Görsel başarıyla yüklendi.
        </div>
      )}

      {/* Preview */}
      {previewSrc ? (
        <div className="relative w-fit group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Ürün görseli önizlemesi"
            className="h-48 w-48 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-slate-700"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <button
            type="button"
            onClick={clearImage}
            disabled={disabled}
            title="Görseli kaldır"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow transition-all hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-500">
          <ImageIcon size={32} />
          <span className="text-xs">Önizleme yok</span>
        </div>
      )}
    </div>
  );
}
