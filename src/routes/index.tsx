import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ScanLine,
  QrCode,
  FileImage,
  FileText,
  ArrowRight,
  Lock,
  Pill,
  EyeOff,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediSync — Your Personal Health Hub" },
      {
        name: "description",
        content:
          "A private, encrypted health hub for your medical records. Generate a QR you control — share it only in emergencies.",
      },
      { property: "og:title", content: "MediSync — Personal Health Hub" },
      {
        property: "og:description",
        content: "Carry your full medical history. Share it only when you choose.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Sections />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
            Private by default · You hold the key
          </div>
          <h1 className="mt-5 text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Your health,{" "}
            <span className="italic text-gradient">in your pocket</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            MediSync is your personal health hub for X-rays, prescriptions and
            reports. Generate a private QR you control — keep it sealed, or flip
            it on for an ER visit. Nobody sees your records unless you say so.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-hero shadow-elegant hover:opacity-95"
            >
              <Link to="/signup">
                Create my health hub
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/scan">
                <ScanLine className="mr-1.5 h-4 w-4" />
                Emergency view
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <Stat label="One owner" value="You" />
            <Stat label="Files" value="Scans · PDF · Rx" />
            <Stat label="Access" value="QR-based" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-hero opacity-20 blur-2xl" />
          <div className="w-full max-w-sm rounded-3xl border border-border bg-gradient-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Health Hub</div>
                  <div className="text-sm font-semibold">Aarav · Private</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <EyeOff className="h-3 w-3" /> SHARING OFF
              </span>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40">
                  <QrCode className="h-20 w-20 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/85 backdrop-blur-sm">
                  <div className="text-center">
                    <Lock className="mx-auto h-6 w-6 text-primary" />
                    <p className="mt-2 text-xs font-semibold text-foreground">
                      QR is sealed
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Tap "Share" to enable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <Mini icon={<FileImage className="h-3.5 w-3.5" />} label="12 scans" />
              <Mini icon={<FileText className="h-3.5 w-3.5" />} label="8 reports" />
              <Mini icon={<Pill className="h-3.5 w-3.5" />} label="3 Rx" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
              <div className="rounded-md bg-secondary/60 px-2 py-1.5 text-center">
                <span className="font-semibold text-foreground">A+</span> · Blood
              </div>
              <div className="rounded-md bg-secondary/60 px-2 py-1.5 text-center">
                <span className="font-semibold text-foreground">170 cm</span> · 65 kg
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg bg-secondary px-2 py-2 text-xs text-secondary-foreground">
      <div className="flex items-center justify-center gap-1.5">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function Sections() {
  const items = [
    {
      icon: <FileImage className="h-5 w-5" />,
      title: "My Records",
      desc: "Every X-ray, lab report and prescription — organized, searchable, always with you.",
      to: "/dashboard" as const,
      cta: "Open hub",
    },
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "My QR Code",
      desc: "Your private key. Sealed by default. Toggle on to share critical info instantly.",
      to: "/qr" as const,
      cta: "View my QR",
    },
    {
      icon: <ScanLine className="h-5 w-5" />,
      title: "Emergency View",
      desc: "Anyone scanning your QR sees only what you've authorized — nothing more.",
      to: "/scan" as const,
      cta: "Try the scanner",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Three simple sections
        </p>
        <h2 className="mt-2 text-4xl text-foreground sm:text-5xl">
          A hub, a key, an <span className="italic text-gradient">emergency door</span>.
        </h2>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group rounded-3xl border border-border bg-gradient-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {it.icon}
            </div>
            <h3 className="mt-5 font-serif text-3xl text-foreground">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            <Link
              to={it.to}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5"
            >
              {it.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-hero p-12 text-center shadow-elegant sm:p-16">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative">
          <h2 className="font-serif text-4xl leading-tight text-primary-foreground sm:text-5xl">
            Take your records back.<br />
            <span className="italic opacity-90">Carry them. Control them.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-primary-foreground/85">
            Free to start. Your data stays in your browser — backend swap is one
            line of code away when you're ready.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">Create my health hub</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/about">How it works</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
