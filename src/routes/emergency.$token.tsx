import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lookupEmergency, type EmergencySnapshot } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import {
  AlertTriangle,
  Heart,
  Droplet,
  Phone,
  Pill,
  Lock,
  ShieldCheck,
  FileLock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/emergency/$token")({
  head: ({ params }) => ({
    meta: [
      { title: `Emergency view · ${params.token.slice(0, 6)} — MediSync` },
      { name: "description", content: "Critical health information shared via MediSync QR." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { token } = Route.useParams();
  const [snap, setSnap] = useState<EmergencySnapshot | null | undefined>(undefined);

  useEffect(() => {
    setSnap(lookupEmergency(token));
  }, [token]);

  if (snap === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (snap === null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-serif text-4xl text-foreground">Sharing is off</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            This QR is sealed, expired, or revoked. The owner has not chosen to
            share their health information right now.
          </p>
          <Button asChild className="mt-6">
            <Link to="/scan">Scan a different QR</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          Emergency view · Read only
        </div>

        <div className="mt-5 rounded-3xl border border-border bg-gradient-card p-6 shadow-soft sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Patient
          </p>
          <h1 className="mt-1 font-serif text-5xl text-foreground">{snap.fullName || "Unnamed"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[snap.gender, snap.dob && `DOB ${snap.dob}`].filter(Boolean).join(" · ") || "—"}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Vital icon={<Droplet className="h-4 w-4" />} label="Blood" value={snap.bloodGroup || "—"} tone="primary" />
            <Vital
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Allergies"
              value={snap.allergies || "None reported"}
              tone={snap.allergies ? "destructive" : "muted"}
            />
            <Vital
              icon={<Heart className="h-4 w-4" />}
              label="Conditions"
              value={snap.conditions || "None reported"}
              tone={snap.conditions ? "warning" : "muted"}
            />
          </div>

          {snap.medications && (
            <div className="mt-3">
              <Vital
                icon={<Pill className="h-4 w-4" />}
                label="Current medications"
                value={snap.medications}
                tone="primary"
              />
            </div>
          )}

          {snap.emergencyContact && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Emergency contact
                </p>
                <p className="text-base font-semibold text-foreground">{snap.emergencyContact}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <FileLock className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{snap.fileCount} private file{snap.fileCount === 1 ? "" : "s"}</p>
              <p className="text-muted-foreground">
                Records (X-rays, reports) are not shared via emergency view.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <p className="font-semibold text-foreground">Owner-controlled</p>
              <p className="text-muted-foreground">
                Access can be revoked at any moment by the owner of this health hub.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Token <span className="font-mono">{token}</span> · MediSync personal health hub
        </p>
      </div>
    </div>
  );
}

function Vital({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "destructive" | "warning" | "muted";
}) {
  const map = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    destructive: "border-destructive/30 bg-destructive/5 text-destructive",
    warning: "border-warning/40 bg-warning/10 text-warning-foreground",
    muted: "border-border bg-secondary/50 text-muted-foreground",
  } as const;
  return (
    <div className={`rounded-2xl border p-4 ${map[tone]}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
