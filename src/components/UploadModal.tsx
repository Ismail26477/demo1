import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  File as FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { addFile, saveFileBlob, formatBytes, type MedicalFile } from "@/lib/store";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface PendingFile {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
  preview?: string;
}

export function UploadModal({
  defaultCategory = "xray",
  onClose,
  onUploaded,
}: {
  defaultCategory?: MedicalFile["category"];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [category, setCategory] = useState<MedicalFile["category"]>(defaultCategory);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pending.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    };
  }, [pending]);

  const enqueue = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const next: PendingFile[] = arr.map((file) => ({
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      file,
      progress: 0,
      status: "queued",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setPending((prev) => [...prev, ...next]);
  };

  const removePending = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const startUpload = async () => {
    if (pending.length === 0) return;
    setBusy(true);
    let okCount = 0;
    for (const item of pending) {
      if (item.status === "done") continue;
      if (item.file.size > 25 * 1024 * 1024) {
        setPending((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error", error: "Exceeds 25 MB limit" } : p,
          ),
        );
        toast.error(`"${item.file.name}" exceeds 25 MB`);
        continue;
      }
      setPending((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading", progress: 5 } : p)),
      );
      const interval = setInterval(() => {
        setPending((prev) =>
          prev.map((p) =>
            p.id === item.id && p.status === "uploading"
              ? { ...p, progress: Math.min(p.progress + 18, 90) }
              : p,
          ),
        );
      }, 80);
      try {
        const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await saveFileBlob(id, item.file);
        addFile({
          id,
          name: item.file.name,
          type: item.file.type || "application/octet-stream",
          category,
          uploadedAt: Date.now(),
          size: item.file.size,
        });
        clearInterval(interval);
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "done", progress: 100 } : p)),
        );
        okCount++;
      } catch (err) {
        clearInterval(interval);
        const message = err instanceof Error ? err.message : "Upload failed";
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "error", error: message } : p)),
        );
        toast.error(`Failed to upload "${item.file.name}"`);
      }
    }
    setBusy(false);
    onUploaded();
    if (okCount > 0) {
      toast.success(`${okCount} ${okCount === 1 ? "file" : "files"} added to your health hub`);
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-0 sm:p-4 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Upload Scans &amp; Documents</h2>
            <p className="text-xs text-muted-foreground">
              Scans, prescriptions, lab reports — up to 25 MB each.
            </p>
          </div>
          <button
            onClick={() => !busy && onClose()}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_ORDER.map((c) => {
              const m = CATEGORY_META[c];
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
                    category === c
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", m.tone)}>
                    {m.icon}
                  </span>
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              enqueue(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 transition-all",
              dragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary",
            )}
          >
            <Upload className="h-7 w-7 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {dragging ? "Drop to add" : "Drag &amp; drop or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground">JPG, PNG, PDF, DICOM</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.dcm"
            className="hidden"
            onChange={(e) => {
              enqueue(e.target.files);
              e.target.value = "";
            }}
          />

          {pending.length > 0 && (
            <ul className="mt-5 space-y-2">
              <AnimatePresence initial={false}>
                {pending.map((p) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-2.5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
                      {p.preview ? (
                        <img src={p.preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground" title={p.file.name}>
                          {p.file.name}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {formatBytes(p.file.size)}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        {p.status === "done" ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-success">
                            <CheckCircle2 className="h-3 w-3" /> Uploaded
                          </div>
                        ) : p.status === "error" ? (
                          <div className="text-[11px] font-medium text-destructive">{p.error}</div>
                        ) : (
                          <Progress value={p.progress} className="h-1.5" />
                        )}
                      </div>
                    </div>
                    {p.status !== "uploading" && (
                      <button
                        onClick={() => removePending(p.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-card/95 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {pending.length === 0
              ? "Add files to begin"
              : `${pending.filter((p) => p.status === "done").length}/${pending.length} uploaded`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => !busy && onClose()} disabled={busy}>
              {pending.some((p) => p.status === "done") ? "Close" : "Cancel"}
            </Button>
            <Button
              onClick={startUpload}
              disabled={busy || pending.length === 0 || pending.every((p) => p.status === "done")}
              className="bg-gradient-hero shadow-soft"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Start upload
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
