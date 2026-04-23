import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Upload, type LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { AppShell } from "@/components/AppShell";
import { UploadModal } from "@/components/UploadModal";
import { FileViewer } from "@/components/FileViewer";
import { EditFileModal } from "@/components/EditFileModal";
import { FileCard } from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MedicalFile } from "@/lib/store";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface RecordsPageProps {
  title: string;
  subtitle: string;
  category: MedicalFile["category"];
  emptyHeading: string;
  emptyDescription: string;
  HeroIcon: LucideIcon;
}

export function RecordsPage({
  title,
  subtitle,
  category,
  emptyHeading,
  emptyDescription,
  HeroIcon,
}: RecordsPageProps) {
  const { user, loading, refresh } = useAuth();
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<MedicalFile | null>(null);
  const [editing, setEditing] = useState<MedicalFile | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sort, setSort] = useState<"new" | "old" | "size" | "name">("new");

  useEffect(() => {
    // ensure auth gate runs
  }, [loading, user]);

  const files = useMemo(() => {
    if (!user) return [];
    return user.files
      .filter((f) => f.category === category)
      .filter(
        (f) =>
          !query.trim() ||
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.notes ?? "").toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => {
        if (sort === "old") return a.uploadedAt - b.uploadedAt;
        if (sort === "size") return b.size - a.size;
        if (sort === "name") return a.name.localeCompare(b.name);
        return b.uploadedAt - a.uploadedAt;
      });
  }, [user, category, query, sort]);

  const meta = CATEGORY_META[category];

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      onUpload={() => setUploadOpen(true)}
      search={{ value: query, onChange: setQuery, placeholder: `Search ${meta.label.toLowerCase()}…` }}
    >
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-gradient-card p-5 shadow-soft sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.tone)}>
            <HeroIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-foreground">{meta.label}</h2>
            <p className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? "record" : "records"} stored privately on your device.
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="hidden h-9 rounded-md border border-input bg-background px-3 text-xs sm:block"
          >
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="size">Largest first</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-secondary/40 py-16 text-center">
          <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", meta.tone)}>
            <HeroIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-2xl text-foreground">
            {query ? "No matches" : emptyHeading}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {query ? "Try a different search term." : emptyDescription}
          </p>
          {!query && (
            <Button onClick={() => setUploadOpen(true)} className="mt-5 bg-gradient-hero shadow-soft">
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Scans &amp; Documents
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f, i) => (
            <FileCard
              key={f.id}
              file={f}
              index={i}
              onView={() => setViewing(f)}
              onEdit={() => setEditing(f)}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}

      {viewing && <FileViewer file={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <EditFileModal
          file={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            refresh();
            setEditing(null);
          }}
        />
      )}
      {uploadOpen && (
        <UploadModal
          defaultCategory={category}
          onClose={() => setUploadOpen(false)}
          onUploaded={refresh}
        />
      )}
    </AppShell>
  );
}
