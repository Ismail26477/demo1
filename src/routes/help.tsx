import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  ShieldCheck,
  QrCode,
  Upload,
  Siren,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — MediSync" },
      { name: "description", content: "Guides, FAQs and support for MediSync." },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "How does emergency QR sharing work?",
    a: "Your QR is sealed by default. Open My QR, choose how long it should stay open (15 min, 1 hour, 24 hours, or until you turn it off), and a paramedic can scan it to see only your blood group, allergies, conditions, current medications and emergency contact. Files are never exposed publicly.",
    icon: <Siren className="h-4 w-4" />,
  },
  {
    q: "Where are my files stored?",
    a: "Files live in your browser using IndexedDB and metadata in localStorage. Nothing is uploaded to any server in this demo build. When you connect a backend later, the same flows can switch to Lovable Cloud.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    q: "What kind of files can I upload?",
    a: "JPG, PNG and PDF up to 25 MB each. We also accept .dcm DICOM images. Use Upload Scans & Documents from the dashboard or any record page.",
    icon: <Upload className="h-4 w-4" />,
  },
  {
    q: "Can I print my emergency card?",
    a: "Yes. Open Emergency Card and tap Print — it generates a one-page card you can keep in your wallet.",
    icon: <QrCode className="h-4 w-4" />,
  },
];

function HelpPage() {
  return (
    <AppShell title="Help & Support" subtitle="How MediSync works, and how to reach us">
      <div className="rounded-3xl border border-border bg-gradient-card p-5 shadow-soft sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-serif text-2xl text-foreground">Welcome — let's get you sorted</h2>
            <p className="text-sm text-muted-foreground">
              Quick answers, common workflows, and ways to get in touch.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="font-serif text-xl text-foreground">FAQs</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 text-primary">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  {f.icon}
                </span>
                <h4 className="font-semibold text-foreground">{f.q}</h4>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <Mail className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-xl text-foreground">Email support</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach our support team and we'll get back within one business day.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <a href="mailto:support@medisync.app">
              support@medisync.app
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-xl text-foreground">Live chat</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Mon–Fri, 9am–6pm. Average response under 2 minutes.
          </p>
          <Button asChild size="sm" className="mt-3 bg-gradient-hero shadow-soft">
            <Link to="/dashboard">Start a chat</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
