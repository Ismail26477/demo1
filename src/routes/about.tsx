import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Lock, KeyRound, EyeOff, HeartPulse, FileLock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MediSync" },
      {
        name: "description",
        content:
          "MediSync is a personal, single-user health hub for medical records. You own the data, the QR, and the access.",
      },
      { property: "og:title", content: "About MediSync" },
      { property: "og:description", content: "A personal, private medical record health hub — controlled by you." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden bg-gradient-soft py-20">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Our promise
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-foreground sm:text-6xl">
            Your records belong to <span className="italic text-gradient">one person</span>. You.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            MediSync is a single-user health hub. There are no hospital
            dashboards, no doctor accounts, no admin overrides. Just you, your
            files, and a QR you control.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: <Lock className="h-5 w-5" />, t: "Single user", d: "One health hub. One owner. No multi-role complexity." },
            { icon: <FileLock className="h-5 w-5" />, t: "All your records", d: "Upload X-rays, lab PDFs, prescriptions, anything." },
            { icon: <KeyRound className="h-5 w-5" />, t: "QR is a key", d: "Issue, revoke and rotate access tokens at will." },
            { icon: <EyeOff className="h-5 w-5" />, t: "Sealed by default", d: "Sharing is off until you flip it on." },
            { icon: <HeartPulse className="h-5 w-5" />, t: "Emergency view", d: "When enabled, only critical info is exposed." },
            { icon: <ShieldCheck className="h-5 w-5" />, t: "No external access", d: "Demo runs entirely in your browser." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {v.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{v.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-gradient-card p-10 text-center shadow-soft">
          <h2 className="font-serif text-3xl text-foreground">Ready in 60 seconds.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create your health hub, add your first record, and generate your QR.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-hero shadow-soft">
            <Link to="/signup">Create my health hub</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
