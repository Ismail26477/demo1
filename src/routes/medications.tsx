import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Plus, Trash2, Pill } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/useAuth";
import { addMedication, removeMedication, timeAgo } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/medications")({
  head: () => ({
    meta: [
      { title: "Medications — MediSync" },
      { name: "description", content: "Track your active medications and dosages." },
    ],
  }),
  component: MedicationsPage,
});

function MedicationsPage() {
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Medication name is required");
    addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim() || "As prescribed",
      notes: notes.trim() || undefined,
    });
    refresh();
    toast.success("Medication added");
    setName("");
    setDosage("");
    setFrequency("");
    setNotes("");
    setAdding(false);
  };

  const handleRemove = (id: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return;
    removeMedication(id);
    refresh();
    toast.success("Medication removed");
  };

  const meds = user?.medications ?? [];

  return (
    <AppShell title="Medications" subtitle="What you're currently taking">
      {loading || !user ? (
        <Skeleton className="h-32 rounded-3xl" />
      ) : (
        <>
          <div className="rounded-3xl border border-border bg-gradient-card p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl text-foreground">Active medications</h2>
                  <p className="text-sm text-muted-foreground">
                    {meds.length} {meds.length === 1 ? "entry" : "entries"} in your medication list.
                  </p>
                </div>
              </div>
              {!adding && (
                <Button size="sm" onClick={() => setAdding(true)} className="bg-gradient-hero shadow-soft">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add
                </Button>
              )}
            </div>

            <AnimatePresence>
              {adding && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={submit}
                  className="mt-5 grid gap-3 overflow-hidden sm:grid-cols-2"
                >
                  <div className="space-y-1.5">
                    <Label>Medication</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Metformin" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Dosage</Label>
                    <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500 mg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Frequency</Label>
                    <Input
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="Twice daily, after meals"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="flex justify-end gap-2 sm:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-hero shadow-soft">
                      Add medication
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {meds.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-secondary/40 py-16 text-center">
              <Pill className="mx-auto h-7 w-7 text-success" />
              <h3 className="mt-3 font-serif text-2xl text-foreground">No medications listed</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep a current list — it shows up on your emergency card too.
              </p>
            </div>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {meds.map((m, i) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{m.name}</p>
                      {m.dosage && <p className="text-xs text-muted-foreground">{m.dosage}</p>}
                    </div>
                    <button
                      onClick={() => handleRemove(m.id, m.name)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{m.frequency}</p>
                  {m.notes && (
                    <p className="mt-1 text-xs italic text-muted-foreground">"{m.notes}"</p>
                  )}
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Added {timeAgo(m.startedAt)}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </>
      )}
    </AppShell>
  );
}
