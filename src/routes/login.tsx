import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/store";
import { emitAuthChange } from "@/lib/useAuth";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MediSync" },
      { name: "description", content: "Open your personal health hub." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = signIn(email.trim(), password);
      emitAuthChange();
      toast.success(`Welcome back${u.profile.fullName ? `, ${u.profile.fullName.split(" ")[0]}` : ""}`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Lock className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-xl">MediSync</span>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
              Your records. Your rules.
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              "I finally know where every report is — and I'm the only one who can share it."
            </h2>
            <p className="mt-4 text-sm opacity-80">— A MediSync user</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg">MediSync</span>
          </Link>

          <h1 className="font-serif text-4xl text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open your private health hub.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-hero shadow-soft hover:opacity-95"
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open my health hub"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary-glow">
              Create your health hub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
