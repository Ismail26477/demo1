import { useEffect, useState } from "react";
import { Loader2, X, File as FileIcon, Download } from "lucide-react";
import { getFileBlob, formatBytes, type MedicalFile } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";

export function FileViewer({ file, onClose }: { file: MedicalFile; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active: string | null = null;
    getFileBlob(file.id).then((blob) => {
      if (!blob) {
        setLoading(false);
        return;
      }
      active = URL.createObjectURL(blob);
      setUrl(active);
      setLoading(false);
    });
    return () => {
      if (active) URL.revokeObjectURL(active);
    };
  }, [file.id]);

  const isImg = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-2 sm:p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg sm:text-xl text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {CATEGORY_META[file.category].label} · {formatBytes(file.size)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {url && (
              <a
                href={url}
                download={file.name}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-secondary/40 p-2 sm:p-4">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : !url ? (
            <p className="text-sm text-muted-foreground">File could not be loaded.</p>
          ) : isImg ? (
            <img src={url} alt={file.name} className="max-h-[72vh] rounded-lg object-contain shadow-soft" />
          ) : isPdf ? (
            <iframe src={url} title={file.name} className="h-[72vh] w-full rounded-lg border-0 bg-white" />
          ) : (
            <div className="text-center">
              <FileIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No inline preview available.</p>
              <a
                href={url}
                download={file.name}
                className="mt-3 inline-block text-sm font-semibold text-primary"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
