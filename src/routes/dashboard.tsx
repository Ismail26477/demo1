import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileImage,
  FileText,
  Pill,
  HeartPulse,
  Activity,
  Pencil,
  Heart,
  Droplet,
  ScanLine,
  QrCode,
  Plus,
  ShieldCheck,
  Upload,
  Trash2,
  KeyRound,
  RotateCw,
  ArrowRight,
  Stethoscope,
  Ruler,
  Scale,
  Lock,
  ClipboardList,
  RefreshCw,
  CalendarCheck,
} from "lucide-react";
import {
  getActivity,
  type ActivityEvent,
  type MedicalFile,
  formatBytes,
  timeAgo,
} from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { AppShell } from "@/components/AppShell";
import { UploadModal } from "@/components/UploadModal";
import { FileViewer } from "@/components/FileViewer";
import { EditFileModal } from "@/components/EditFileModal";
import { ProfileModal } from "@/components/ProfileModal";
import { FileCard } from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediSync" },
      { name: "description", content: "Your personal health dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, refresh } = useAuth();
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [viewing, setViewing] = useState<MedicalFile | null>(null);
  const [editing, setEditing] = useState<MedicalFile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) setActivity(getActivity());
  }, [loading, user]);

  const refreshAll = () => {
    refresh();
    setActivity(getActivity());
  };

  const counts = useMemo(() => {
    if (!user) return { xray: 0, report: 0, prescription: 0, other: 0, meds: 0, appts: 0 };
    return {
      xray: user.files.filter((f) => f.category === "xray").length,
      report: user.files.filter((f) => f.category === "report").length,
      prescription: user.files.filter((f) => f.category === "prescription").length,
      other: user.files.filter((f) => f.category === "other").length,
      meds: user.medications?.length ?? 0,
      appts: user.appointments?.length ?? 0,
    };
  }, [user]);

  const recentFiles = useMemo(
    () => (user ? [...user.files].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 6) : []),
    [user],
  );

  if (loading || !user) {
    return (
      <AppShell title="Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  const profile = user.profile;
  const firstName = profile.fullName?.split(" ")[0] || "there";

  return (
    <AppShell title="Dashboard" onUpload={() => setUploadOpen(true)}>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8"
      >
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
              Welcome back
            </p>
            <h2 className="mt-1 font-serif text-3xl sm:text-5xl">
              Hello, {firstName}
              <span className="opacity-80">.</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm opacity-90">
              Your full medical history, one tap away. Manage records, share your
              QR in emergencies, and keep your vitals in check.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-white/95 text-primary hover:bg-white"
            >
              <Link to="/qr">
                <QrCode className="mr-1.5 h-4 w-4" />
                My QR
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link to="/summary">
                <ClipboardList className="mr-1.5 h-4 w-4" />
                Health Summary
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <SummaryCard
          to="/scans"
          label="Scans"
          value={counts.xray}
          tone="primary"
          icon={<FileImage className="h-5 w-5" />}
        />
        <SummaryCard
          to="/prescriptions"
          label="Prescriptions"
          value={counts.prescription}
          tone="success"
          icon={<Pill className="h-5 w-5" />}
        />
        <SummaryCard
          to="/reports"
          label="Reports"
          value={counts.report}
          tone="teal"
          icon={<FileText className="h-5 w-5" />}
        />
        <SummaryCard
          to="/medications"
          label="Medications"
          value={counts.meds}
          tone="warning"
          icon={<HeartPulse className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-foreground">Quick actions</h3>
            <p className="text-xs text-muted-foreground">One tap, fewer steps.</p>
          </div>
          <div className="mt-4 grid gap-2.5 grid-cols-2 sm:grid-cols-3">
            <QuickAction
              icon={<ScanLine className="h-5 w-5" />}
              label="Add scan"
              onClick={() => setUploadOpen(true)}
              tone="primary"
            />
            <QuickAction
              icon={<Pill className="h-5 w-5" />}
              label="Add prescription"
              onClick={() => setUploadOpen(true)}
              tone="success"
            />
            <QuickAction
              icon={<FileText className="h-5 w-5" />}
              label="Add lab report"
              onClick={() => setUploadOpen(true)}
              tone="teal"
            />
            <QuickAction
              to="/medications"
              icon={<HeartPulse className="h-5 w-5" />}
              label="Log medication"
              tone="warning"
            />
            <QuickAction
              to="/summary"
              icon={<ClipboardList className="h-5 w-5" />}
              label="Health summary"
              tone="muted"
            />
            <QuickAction
              icon={<Pencil className="h-5 w-5" />}
              label="Update profile"
              onClick={() => setProfileOpen(true)}
              tone="primary"
            />
          </div>
        </section>

        {/* Health Summary card */}
        <section className="rounded-3xl border border-border bg-gradient-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-foreground">Health summary</h3>
            <Button size="sm" variant="ghost" onClick={() => setProfileOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat icon={<Droplet className="h-4 w-4" />} label="Blood" value={profile.bloodGroup || "—"} />
            <Stat icon={<Heart className="h-4 w-4" />} label="Age" value={profile.age ? `${profile.age} yrs` : "—"} />
            <Stat icon={<Ruler className="h-4 w-4" />} label="Height" value={profile.height ? `${profile.height} cm` : "—"} />
            <Stat icon={<Scale className="h-4 w-4" />} label="Weight" value={profile.weight ? `${profile.weight} kg` : "—"} />
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              Last checkup
            </div>
            <div className="mt-0.5 text-sm font-medium text-foreground">
              {profile.lastCheckup
                ? new Date(profile.lastCheckup).toLocaleDateString()
                : "Not recorded"}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link to="/summary">
              View full summary
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </section>
      </div>

      {/* Recent scans + activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-foreground">Recent scans</h3>
              <p className="text-xs text-muted-foreground">Your latest uploads</p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/scans">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {recentFiles.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 py-10 text-center">
              <Upload className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 text-sm font-semibold text-foreground">No uploads yet</p>
              <p className="text-xs text-muted-foreground">Add a scan, prescription, or report.</p>
              <Button onClick={() => setUploadOpen(true)} size="sm" className="mt-3 bg-gradient-hero">
                <Plus className="mr-1 h-4 w-4" />
                Upload Scans &amp; Documents
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentFiles.map((f, i) => (
                <FileCard
                  key={f.id}
                  file={f}
                  index={i}
                  onView={() => setViewing(f)}
                  onEdit={() => setEditing(f)}
                  onDeleted={refreshAll}
                />
              ))}
            </div>
          )}
        </section>

        <RecentActivity events={activity} />
      </div>

      {/* QR + Security */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-gradient-soft p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-4 w-4" />
            </span>
            <h3 className="font-serif text-xl text-foreground">My QR Code</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your private medical key. Sealed by default — share only when you choose.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild size="sm" className="bg-gradient-hero shadow-soft">
              <Link to="/qr">
                <QrCode className="mr-1.5 h-4 w-4" />
                Open QR
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/summary">
                <ClipboardList className="mr-1.5 h-4 w-4" />
                Health Summary
              </Link>
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="font-serif text-xl text-foreground">Security &amp; privacy</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <SecRow icon={<Lock className="h-3.5 w-3.5" />} text="Data is encrypted on your device" />
            <SecRow icon={<KeyRound className="h-3.5 w-3.5" />} text="Only you can access this health hub" />
            <SecRow icon={<QrCode className="h-3.5 w-3.5" />} text="Sharing only via your private QR" />
            <SecRow icon={<RefreshCw className="h-3.5 w-3.5" />} text="Revoke access anytime, instantly" />
          </ul>
        </section>
      </div>

      {viewing && <FileViewer file={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <EditFileModal
          file={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            refreshAll();
            setEditing(null);
          }}
        />
      )}
      {profileOpen && (
        <ProfileModal
          initial={profile}
          onClose={() => setProfileOpen(false)}
          onSaved={() => {
            refreshAll();
            setProfileOpen(false);
          }}
        />
      )}
      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} onUploaded={refreshAll} />
      )}
    </AppShell>
  );
}

type Tone = "primary" | "teal" | "success" | "warning" | "muted";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  teal: "bg-teal/15 text-teal",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  muted: "bg-secondary text-muted-foreground",
};

function SummaryCard({
  to,
  label,
  value,
  icon,
  tone,
}: {
  to:
    | "/scans"
    | "/prescriptions"
    | "/reports"
    | "/medications";
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: Tone;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONES[tone])}>
        {icon}
      </span>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </Link>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  to,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  to?: "/medications" | "/summary";
  tone: Tone;
}) {
  const content = (
    <div className="flex h-full flex-col items-start gap-2 rounded-2xl border border-border bg-secondary/30 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-soft">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONES[tone])}>
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SecRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2 text-foreground">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
        {icon}
      </span>
      {text}
    </li>
  );
}

function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-4 w-4" />
        </span>
        <h3 className="font-serif text-xl text-foreground">Recent activity</h3>
      </div>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your actions will appear here as you use the health hub.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.slice(0, 6).map((e) => (
            <li key={e.id} className="flex items-start gap-3">
              <ActivityDot kind={e.kind} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{e.message}</p>
                <p className="text-[11px] text-muted-foreground">{timeAgo(e.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityDot({ kind }: { kind: ActivityEvent["kind"] }) {
  const map: Record<ActivityEvent["kind"], { icon: React.ReactNode; tone: string }> = {
    upload: { icon: <Upload className="h-3 w-3" />, tone: "bg-primary/15 text-primary" },
    delete: { icon: <Trash2 className="h-3 w-3" />, tone: "bg-destructive/15 text-destructive" },
    edit: { icon: <Pencil className="h-3 w-3" />, tone: "bg-teal/15 text-teal" },
    profile: { icon: <Pencil className="h-3 w-3" />, tone: "bg-teal/15 text-teal" },
    share_on: { icon: <ShieldCheck className="h-3 w-3" />, tone: "bg-success/15 text-success" },
    share_off: { icon: <ShieldCheck className="h-3 w-3" />, tone: "bg-muted text-muted-foreground" },
    rotate: { icon: <RotateCw className="h-3 w-3" />, tone: "bg-warning/20 text-warning-foreground" },
    signin: { icon: <KeyRound className="h-3 w-3" />, tone: "bg-primary/15 text-primary" },
    medication: { icon: <Pill className="h-3 w-3" />, tone: "bg-success/15 text-success" },
    appointment: { icon: <CalendarCheck className="h-3 w-3" />, tone: "bg-teal/15 text-teal" },
    vital: { icon: <HeartPulse className="h-3 w-3" />, tone: "bg-primary/15 text-primary" },
  };
  const m = map[kind];
  return (
    <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", m.tone)}>
      {m.icon}
    </span>
  );
}

// silenced unused import warnings (formatBytes used in cards via store re-export)
void formatBytes;
