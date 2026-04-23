import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  enableShare,
  disableShare,
  rotateShareToken,
  getShareState,
  type ShareState,
} from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { QRDisplay } from "@/components/QRDisplay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  Unlock,
  RefreshCw,
  ShieldCheck,
  Eye,
  Clock,
  Copy,
  CheckCircle2,
  Siren,
  Share2,
  KeyRound,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "My QR Code — MediSync" },
      { name: "description", content: "Generate and control your private medical QR code." },
    ],
  }),
  component: QRPage,
});

const DURATIONS = [
  { label: "15 min", value: 15 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
  { label: "Until I turn it off", value: null as number | null },
];

function QRPage() {
  const { user, loading } = useAuth();
  const [share, setShare] = useState<ShareState>({ enabled: false, token: "", expiresAt: null });
  const [duration, setDuration] = useState<number | null>(60 * 60 * 1000);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!user) return;
    setShare(getShareState());
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading || !user) {
    return (
      <AppShell title="QR Code">
        <Skeleton className="h-72 rounded-3xl" />
      </AppShell>
    );
  }

  const expired = !!(share.expiresAt && now > share.expiresAt);
  const liveEnabled = share.enabled && !expired;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/emergency/${share.token}`
      : `/emergency/${share.token}`;

  const onEnable = () => {
    setShare(enableShare(duration));
    toast.success("Sharing enabled", {
      description: duration ? "QR is live and will auto-expire." : "Active until you turn it off.",
    });
  };
  const onDisable = () => {
    setShare(disableShare());
    toast.success("Sharing disabled");
  };
  const onRotate = () => {
    if (!confirm("Generate a new QR? Old scans will stop working immediately.")) return;
    setShare(rotateShareToken());
    toast.success("New QR token generated");
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };
  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My MediSync emergency view",
          text: "Scan or open in case of emergency.",
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <AppShell title="QR Code" subtitle="Your private key for emergency access">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* QR card */}
        <div className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-gradient-card p-4 shadow-soft sm:p-6 lg:p-8">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
              liveEnabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", liveEnabled ? "bg-success" : "bg-muted-foreground")} />
            {liveEnabled ? "Live · Sharing on" : "Sealed · Sharing off"}
          </div>

          <div className="mt-4 flex w-full justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className={cn("transition-all", !liveEnabled && "blur-md grayscale")}>
                <QRDisplay value={url} size={240} />
              </div>
              {!liveEnabled && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl bg-background/95 px-4 py-3 text-center shadow-soft">
                    <Lock className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1.5 text-xs font-semibold text-foreground">
                      {expired ? "Share expired" : "QR is sealed"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Enable sharing to reveal</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {liveEnabled && (
            <div className="mt-2 text-center text-[11px] text-muted-foreground">
              Token <span className="font-mono">{share.token.slice(0, 6)}…</span>
              {share.expiresAt && (
                <>
                  {" · "}
                  <Clock className="-mt-0.5 inline h-3 w-3" /> {formatRemaining(share.expiresAt - now)}
                </>
              )}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/summary">
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Health Summary
              </Link>
            </Button>
            <Button onClick={nativeShare} size="sm" disabled={!liveEnabled} className="w-full bg-gradient-hero shadow-soft">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share link
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="min-w-0 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
            <h2 className="font-serif text-2xl text-foreground">Sharing duration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how long your QR stays active. You can turn it off any time.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    duration === d.value
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{d.label}</span>
                  <p className="text-[11px] text-muted-foreground">
                    {d.value ? "Auto-expires" : "Manual revoke"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!liveEnabled ? (
                <Button onClick={onEnable} className="w-full bg-gradient-hero shadow-soft sm:w-auto">
                  <Unlock className="mr-1.5 h-4 w-4" />
                  Enable sharing
                </Button>
              ) : (
                <Button onClick={onDisable} variant="outline" className="w-full sm:w-auto">
                  <Lock className="mr-1.5 h-4 w-4" />
                  Disable now
                </Button>
              )}
              <Button onClick={onRotate} variant="ghost" className="w-full sm:w-auto">
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Rotate token
              </Button>
            </div>
          </div>

          {liveEnabled && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direct link
              </p>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md bg-secondary px-2 py-1.5 font-mono text-xs text-foreground">
                  {url}
                </code>
                <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview emergency view
              </a>
            </div>
          )}

          {/* Security & Privacy */}
          <div className="rounded-3xl border border-border bg-gradient-soft p-4 shadow-soft sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl text-foreground">Security & Privacy</h3>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <PrivacyPoint icon={<Lock className="h-4 w-4" />} title="Encrypted at rest" desc="Stored only in your browser hub." />
              <PrivacyPoint icon={<KeyRound className="h-4 w-4" />} title="You hold the key" desc="No admins, no third parties." />
              <PrivacyPoint icon={<Share2 className="h-4 w-4" />} title="QR-based sharing" desc="One-tap, time-limited access." />
              <PrivacyPoint icon={<Ban className="h-4 w-4" />} title="Revoke anytime" desc="Disable or rotate in one click." />
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PrivacyPoint({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "expired";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${sec}s left`;
  return `${sec}s left`;
}
