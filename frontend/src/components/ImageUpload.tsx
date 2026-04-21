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
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["file", "url"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-all ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
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
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
            ${dragging ? "border-indigo-400 bg-indigo-50/60 scale-[1.01]" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${uploadState === "uploading" ? "pointer-events-none" : ""}
            h-40`}
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
              <Loader2 size={28} className="text-indigo-500 animate-spin" />
              <span className="text-sm text-slate-600 font-medium">Yükleniyor… {progress}%</span>
              <div className="w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Upload size={22} className="text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Sürükle & bırak veya <span className="text-indigo-600">dosya seç</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
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
            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={disabled || !urlInput.trim()}
            className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Uygula
          </button>
        </div>
      )}

      {/* Error / success banners */}
      {uploadState === "error" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}
      {uploadState === "done" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
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
            className="w-48 h-48 object-cover rounded-2xl border border-slate-200 shadow-sm"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <button
            type="button"
            onClick={clearImage}
            disabled={disabled}
            title="Görseli kaldır"
            className="absolute -top-2 -right-2 w-7 h-7 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 rounded-full shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="w-48 h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-300">
          <ImageIcon size={32} />
          <span className="text-xs">Önizleme yok</span>
        </div>
      )}
    </div>
  );
}
