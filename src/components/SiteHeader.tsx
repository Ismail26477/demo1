import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, emitAuthChange } from "@/lib/useAuth";
import { signOut } from "@/lib/store";
import {
  Lock,
  LogOut,
  ScanLine,
  LayoutDashboard,
  QrCode,
  Menu,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  const handleSignOut = () => {
    signOut();
    emitAuthChange();
    toast.success("Signed out", { description: "Your session has ended." });
    navigate({ to: "/" });
  };

  const initials =
    user?.profile.fullName
      ?.split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ME";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-soft transition-transform group-hover:scale-105">
            <Lock className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-teal ring-2 ring-background" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl text-foreground">MediSync</div>
            <div className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Personal Health Hub
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user ? (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/scans" label="My Scans" />
              <NavLink to="/qr" label="My QR" />
              <NavLink to="/summary" label="Summary" />
            </>
          ) : (
            <>
              <NavLink to="/scan" label="Emergency View" />
              <NavLink to="/about" label="About" />
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-hero shadow-soft hover:opacity-95">
                <Link to="/signup">Create hub</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1 lg:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-hero text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </div>
                <span className="max-w-[140px] truncate text-xs font-medium text-foreground">
                  {user.profile.fullName || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                <LogOut className="h-4 w-4" />
                <span className="ml-1.5 hidden lg:inline">Sign out</span>
              </Button>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {user ? (
            <>
              <MobileLink to="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <MobileLink to="/scans" label="My Scans" icon={<ScanLine className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <MobileLink to="/qr" label="My QR" icon={<QrCode className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <MobileLink to="/summary" label="Summary" icon={<ScanLine className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-foreground">{user.profile.fullName || "You"}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setOpen(false); handleSignOut(); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <MobileLink to="/scan" label="Emergency View" icon={<ScanLine className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <MobileLink to="/about" label="About" icon={<User className="h-4 w-4" />} onClick={() => setOpen(false)} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-hero" onClick={() => setOpen(false)}>
                  <Link to="/signup">Create hub</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

type SiteRoute = "/dashboard" | "/scans" | "/qr" | "/scan" | "/about" | "/summary";

function NavLink({ to, label }: { to: SiteRoute; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-primary/10" }}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  to,
  label,
  icon,
  onClick,
}: {
  to: SiteRoute;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
      activeProps={{ className: "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold text-primary bg-primary/10" }}
    >
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ScanLine className="h-4 w-4 text-primary" />
          <span className="font-serif text-base text-foreground">MediSync</span>
          <span>· Your health, in your pocket.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MediSync. Demo build — your data stays in your browser.
        </p>
      </div>
    </footer>
  );
}
