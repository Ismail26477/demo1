import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SettingsIcon, LogOut, Trash2, ShieldCheck, Pencil, Mail, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileModal } from "@/components/ProfileModal";
import { useAuth, emitAuthChange } from "@/lib/useAuth";
import { signOut } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MediSync" },
      { name: "description", content: "Manage your account, profile and session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const handleSignOut = () => {
    signOut();
    emitAuthChange();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const handleWipe = () => {
    if (
      !confirm(
        "Erase ALL local hub data, including files? This cannot be undone.",
      )
    )
      return;
    localStorage.removeItem("phv_users");
    localStorage.removeItem("phv_session");
    indexedDB.deleteDatabase("phv_files");
    emitAuthChange();
    toast.success("Health hub erased");
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <AppShell title="Settings">
        <Skeleton className="h-64 rounded-3xl" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Account, profile and privacy controls">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={<SettingsIcon className="h-5 w-5" />} title="Profile" tone="primary">
          <Row label="Name" value={user.profile.fullName || "—"} />
          <Row label="Email" value={user.email} icon={<Mail className="h-3 w-3" />} />
          <Row label="Phone" value={user.profile.phone || "—"} />
          <Button size="sm" className="mt-2 bg-gradient-hero shadow-soft" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit profile
          </Button>
        </Card>

        <Card icon={<ShieldCheck className="h-5 w-5" />} title="Privacy" tone="success">
          <p className="text-sm text-muted-foreground">
            Your data lives only on this device. We never see it. Sharing is
            controlled by your QR — sealed by default.
          </p>
          <Row label="Storage" value="Local (this browser)" icon={<Lock className="h-3 w-3" />} />
          <Row
            label="Files stored"
            value={`${user.files.length} files · ${(
              user.files.reduce((s, f) => s + f.size, 0) /
              (1024 * 1024)
            ).toFixed(1)} MB`}
          />
        </Card>

        <Card icon={<LogOut className="h-5 w-5" />} title="Session" tone="muted">
          <p className="text-sm text-muted-foreground">
            Sign out to lock your health hub on shared devices.
          </p>
          <Button size="sm" variant="outline" className="mt-2" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign out
          </Button>
        </Card>

        <Card icon={<Trash2 className="h-5 w-5" />} title="Danger zone" tone="destructive">
          <p className="text-sm text-muted-foreground">
            Permanently delete this health hub and all local files.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleWipe}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Erase health hub
          </Button>
        </Card>
      </div>

      {editing && (
        <ProfileModal
          initial={user.profile}
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

function Card({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "primary" | "success" | "muted" | "destructive";
  children: React.ReactNode;
}) {
  const t =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "bg-success/15 text-success"
        : tone === "destructive"
          ? "bg-destructive/15 text-destructive"
          : "bg-secondary text-muted-foreground";
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t}`}>{icon}</span>
        <h3 className="font-serif text-xl text-foreground">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
