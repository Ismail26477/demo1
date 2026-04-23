import { useState, type FormEvent } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFile, type MedicalFile } from "@/lib/store";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function EditFileModal({
  file,
  onClose,
  onSaved,
}: {
  file: MedicalFile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(file.name);
  const [category, setCategory] = useState<MedicalFile["category"]>(file.category);
  const [notes, setNotes] = useState(file.notes ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    updateFile(file.id, { name: name.trim() || file.name, category, notes: notes.trim() });
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Edit record</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rname">Name</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_ORDER.map((c) => {
                const m = CATEGORY_META[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all",
                      category === c
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn("flex h-7 w-7 items-center justify-center rounded-lg", m.tone)}
                    >
                      {m.icon}
                    </span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rnotes">Notes (optional)</Label>
            <textarea
              id="rnotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Knee MRI, Dr. Singh, June 2025"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
