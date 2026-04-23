import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertTriangle, Heart, Pill, Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/useAuth";
import { updateProfile } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/allergies")({
  head: () => ({
    meta: [
      { title: "Allergies & Conditions — MediSync" },
      { name: "description", content: "Critical health info for emergencies." },
    ],
  }),
  component: AllergiesPage,
});

function AllergiesPage() {
  const { user, loading, refresh } = useAuth();
  const [allergies, setAllergies] = useState(user?.profile.allergies ?? "");
  const [conditions, setConditions] = useState(user?.profile.conditions ?? "");
  const [meds, setMeds] = useState(user?.profile.medications ?? "");

  // sync once user loads
  if (user && allergies === "" && (user.profile.allergies || user.profile.conditions || user.profile.medications)) {
    setAllergies(user.profile.allergies);
    setConditions(user.profile.conditions);
    setMeds(user.profile.medications);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ allergies, conditions, medications: meds });
    refresh();
    toast.success("Saved to your profile");
  };

  return (
    <AppShell title="Allergies & Conditions" subtitle="Critical info shown on your emergency card">
      {loading || !user ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Block
            tone="destructive"
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Allergies"
            description="List any drug, food or environmental allergies. Comma-separated."
            value={allergies}
            onChange={setAllergies}
            placeholder="Penicillin, peanuts, latex"
          />
          <Block
            tone="warning"
            icon={<Heart className="h-5 w-5" />}
            title="Chronic conditions"
            description="Diagnoses an emergency responder should know about."
            value={conditions}
            onChange={setConditions}
            placeholder="Type II Diabetes, asthma"
          />
          <Block
            tone="success"
            icon={<Pill className="h-5 w-5" />}
            title="Current medications"
            description="What you're taking right now, including dosages."
            value={meds}
            onChange={setMeds}
            placeholder="Metformin 500mg twice daily"
          />
          <div className="flex justify-end">
            <Button type="submit" className="bg-gradient-hero shadow-soft">
              <Save className="mr-1.5 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}

function Block({
  tone,
  icon,
  title,
  description,
  value,
  onChange,
  placeholder,
}: {
  tone: "destructive" | "warning" | "success";
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "warning"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-success/15 text-success";
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="font-serif text-xl text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>{title}</Label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
