import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  Pencil,
  Droplet,
  Heart,
  Ruler,
  Scale,
  Stethoscope,
  Phone,
  MapPin,
  AlertTriangle,
  Pill,
  FileText,
  Mail,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileModal } from "@/components/ProfileModal";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Health Summary — MediSync" },
      { name: "description", content: "Your complete health profile at a glance." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { user, loading, refresh } = useAuth();
  const [editing, setEditing] = useState(false);

  if (loading || !user) {
    return (
      <AppShell title="Health Summary">
        <Skeleton className="h-72 rounded-3xl" />
      </AppShell>
    );
  }

  const p = user.profile;
  const bmi =
    p.height && p.weight
      ? (Number(p.weight) / Math.pow(Number(p.height) / 100, 2)).toFixed(1)
      : null;

  return (
    <AppShell title="Health Summary" subtitle="The full picture of your profile">
      <div className="rounded-3xl border border-border bg-gradient-card p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-3xl text-foreground">{p.fullName || "Add your name"}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[p.age && `${p.age} yrs`, p.gender, p.bloodGroup].filter(Boolean).join(" · ") || "No vitals yet"}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit profile
          </Button>
        </div>

        <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={<Droplet />} label="Blood" value={p.bloodGroup || "—"} />
          <Stat icon={<Heart />} label="Age" value={p.age || "—"} />
          <Stat icon={<Ruler />} label="Height" value={p.height ? `${p.height} cm` : "—"} />
          <Stat icon={<Scale />} label="Weight" value={p.weight ? `${p.weight} kg` : "—"} />
          <Stat icon={<Stethoscope />} label="BMI" value={bmi || "—"} />
          <Stat
            icon={<Calendar />}
            label="Last checkup"
            value={p.lastCheckup ? new Date(p.lastCheckup).toLocaleDateString() : "—"}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Section title="Critical info" icon={<AlertTriangle className="h-4 w-4 text-destructive" />}>
          <Row label="Allergies" value={p.allergies || "None recorded"} />
          <Row label="Conditions" value={p.conditions || "None recorded"} />
          <Row label="Current medications" value={p.medications || "None recorded"} />
        </Section>

        <Section title="Contact" icon={<Phone className="h-4 w-4 text-primary" />}>
          <Row label="Phone" value={p.phone || "—"} icon={<Phone className="h-3 w-3" />} />
          <Row label="Email" value={user.email} icon={<Mail className="h-3 w-3" />} />
          <Row
            label="Emergency contact"
            value={p.emergencyContact || "—"}
            icon={<AlertTriangle className="h-3 w-3" />}
          />
          <Row label="Address" value={p.address || "—"} icon={<MapPin className="h-3 w-3" />} />
        </Section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Counter icon={<FileText className="h-4 w-4" />} label="Records" value={user.files.length} />
        <Counter icon={<Pill className="h-4 w-4" />} label="Medications" value={user.medications?.length ?? 0} />
        <Counter icon={<Calendar className="h-4 w-4" />} label="Appointments" value={user.appointments?.length ?? 0} />
      </div>

      {editing && (
        <ProfileModal
          initial={p}
          onClose={() => setEditing(false)}
          onSaved={() => {
            refresh();
            setEditing(false);
          }}
        />
      )}
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-serif text-xl text-foreground">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-0.5 text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Counter({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
