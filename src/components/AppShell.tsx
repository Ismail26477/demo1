import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanLine,
  Pill,
  FileText,
  HeartPulse,
  AlertTriangle,
  QrCode,
  ClipboardList,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Lock,
  Menu,
  X,
  ChevronLeft,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, emitAuthChange } from "@/lib/useAuth";
import { signOut } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ProtectedRoute =
  | "/dashboard"
  | "/scans"
  | "/prescriptions"
  | "/reports"
  | "/medications"
  | "/allergies"
  | "/qr"
  | "/summary"
  | "/settings"
  | "/help";

interface NavItem {
  to: ProtectedRoute;
  label: string;
  icon: typeof LayoutDashboard;
  group: "main" | "health" | "tools";
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { to: "/scans", label: "My Scans", icon: ScanLine, group: "main" },
  { to: "/summary", label: "Health Summary", icon: ClipboardList, group: "main" },
  { to: "/prescriptions", label: "Prescriptions", icon: Pill, group: "main" },
  { to: "/reports", label: "Reports", icon: FileText, group: "main" },
  { to: "/medications", label: "Medications", icon: HeartPulse, group: "health" },
  { to: "/allergies", label: "Allergies", icon: AlertTriangle, group: "health" },
  { to: "/qr", label: "QR Code", icon: QrCode, group: "tools" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, group: "tools" },
  { to: "/help", label: "Help & Support", icon: HelpCircle, group: "tools" },
];

const BOTTOM_NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, group: "main" },
  { to: "/scans", label: "Scans", icon: ScanLine, group: "main" },
  { to: "/qr", label: "QR", icon: QrCode, group: "tools" },
  { to: "/summary", label: "Summary", icon: ClipboardList, group: "tools" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, group: "tools" },
];

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  onUpload?: () => void;
  back?: ProtectedRoute;
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  search,
  onUpload,
  back,
}: AppShellProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const handleSignOut = () => {
    signOut();
    emitAuthChange();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const initials =
    user.profile.fullName
      ?.split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ME";

  const firstName = user.profile.fullName?.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen w-full bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <SidebarBrand />
        <SidebarNav onNavigate={() => {}} />
        <SidebarFooter
          name={user.profile.fullName || user.email}
          email={user.email}
          initials={initials}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-72 max-w-[85vw] flex-col bg-card shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SidebarBrand compact />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter
              name={user.profile.fullName || user.email}
              email={user.email}
              initials={initials}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            {back && (
              <Link
                to={back}
                className="hidden items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Link>
            )}
            <div className="min-w-0 flex-1">
              {title ? (
                <>
                  <h1 className="truncate font-serif text-xl text-foreground sm:text-2xl">{title}</h1>
                  {subtitle && (
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">
                      {subtitle}
                    </p>
                  )}
                </>
              ) : (
                <p className="truncate text-sm text-muted-foreground">
                  Hi <span className="font-semibold text-foreground">{firstName}</span>, welcome back.
                </p>
              )}
            </div>

            {search && (
              <div className="relative hidden w-72 md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder ?? "Search records…"}
                  className="h-9 pl-9"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              {onUpload && (
                <Button
                  size="sm"
                  onClick={onUpload}
                  className="bg-gradient-hero shadow-soft"
                >
                  <Plus className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              )}
              {actions}
              <button
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <Link
                to="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground shadow-soft"
                aria-label="Profile"
              >
                {initials}
              </Link>
            </div>
          </div>
          {search && (
            <div className="border-t border-border bg-card/40 px-4 py-2 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder ?? "Search records…"}
                  className="h-9 pl-9"
                />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

function SidebarBrand({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        "flex items-center gap-2.5 border-b border-border px-5 py-4",
        compact && "border-0 px-0 py-0",
      )}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
        <Lock className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-teal ring-2 ring-card" />
      </div>
      <div className="leading-tight">
        <div className="font-serif text-lg text-foreground">MediSync</div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Personal Health Hub
        </div>
      </div>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const groups: { key: "main" | "health" | "tools"; label: string }[] = [
    { key: "main", label: "Records" },
    { key: "health", label: "Health" },
    { key: "tools", label: "Tools" },
  ];
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((g) => (
        <div key={g.key} className="mb-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {g.label}
          </p>
          <ul className="space-y-0.5">
            {NAV.filter((i) => i.group === g.key).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold bg-primary/10 text-primary",
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({
  name,
  email,
  initials,
  onSignOut,
}: {
  name: string;
  email: string;
  initials: string;
  onSignOut: () => void;
}) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2.5 rounded-xl bg-secondary/60 p-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{email}</div>
        </div>
        <button
          onClick={onSignOut}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BottomNav() {
  const router = useRouterState();
  const path = router.location.pathname;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV.map((item) => {
          const active = path === item.to;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "fill-primary/10")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
