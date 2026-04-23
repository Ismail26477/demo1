import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Download } from "lucide-react";
import {
  getFileBlob,
  deleteFileBlob,
  removeFile,
  formatBytes,
  type MedicalFile,
} from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FileCard({
  file,
  index,
  onView,
  onEdit,
  onDeleted,
}: {
  file: MedicalFile;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const meta = CATEGORY_META[file.category];
  const isImg = file.type.startsWith("image/");
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (!isImg) return;
    let url: string | null = null;
    getFileBlob(file.id).then((blob) => {
      if (!blob) return;
      url = URL.createObjectURL(blob);
      setThumb(url);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, isImg]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    await deleteFileBlob(file.id);
    removeFile(file.id);
    toast.success("Record deleted");
    onDeleted();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = await getFileBlob(file.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      onClick={onView}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
    >
      <div className="flex h-32 items-center justify-center overflow-hidden bg-secondary/60">
        {thumb ? (
          <img src={thumb} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", meta.tone)}>
            {meta.icon}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", meta.tone)}>
            {meta.label}
          </span>
          <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <span
              onClick={handleDownload}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              role="button"
              aria-label="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </span>
            <span
              onClick={handleEdit}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              role="button"
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </span>
            <span
              onClick={handleDelete}
              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              role="button"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <p className="mt-2 truncate text-sm font-medium text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {new Date(file.uploadedAt).toLocaleDateString()} · {formatBytes(file.size)}
        </p>
        {file.notes && (
          <p className="mt-1.5 line-clamp-2 text-xs italic text-muted-foreground">"{file.notes}"</p>
        )}
      </div>
    </motion.button>
  );
}
