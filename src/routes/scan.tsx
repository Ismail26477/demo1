import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, CameraOff, Search, AlertCircle, Lock } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Emergency view — MediSync" },
      { name: "description", content: "Scan a MediSync QR to view critical health info shared by its owner." },
    ],
  }),
  component: ScanPage,
});

const READER_ID = "phv-scanner";

function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [lookupError, setLookupError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      stopScan().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScan = async () => {
    setError("");
    try {
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleResult(decoded),
        () => {},
      );
      setScanning(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Camera access failed. Enter the token manually below.",
      );
    }
  };

  const stopScan = async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      if (s.isScanning) await s.stop();
      await s.clear();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const tokenFromInput = (raw: string): string | null => {
    const v = raw.trim();
    if (!v) return null;
    // Accept either a token or a full /emergency/<token> URL
    const m = v.match(/emergency\/([A-Za-z0-9]+)/);
    return (m ? m[1] : v).toUpperCase();
  };

  const handleResult = async (raw: string) => {
    await stopScan();
    const token = tokenFromInput(raw);
    if (!token) {
      setLookupError("Couldn't read a token from that QR.");
      return;
    }
    navigate({ to: "/emergency/$token", params: { token } });
  };

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    const token = tokenFromInput(manualToken);
    if (!token) return;
    navigate({ to: "/emergency/$token", params: { token } });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Emergency View</p>
        <h1 className="mt-1 font-serif text-4xl text-foreground">Scan a MediSync QR</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point your camera at a MediSync code. You'll only see what its owner has chosen to share.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-soft">
          <div className="relative aspect-square w-full bg-foreground/95 sm:aspect-video">
            <div id={READER_ID} className="h-full w-full" />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-primary-foreground">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <ScanLine className="h-10 w-10" />
                  <span className="absolute inset-x-3 top-1/2 h-px animate-pulse bg-teal" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-2xl">Camera off</p>
                  <p className="mt-1 text-sm opacity-70">Tap start to enable scanning</p>
                </div>
              </div>
            )}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-60 w-60 rounded-2xl border-2 border-teal/70">
                  <div className="absolute -left-px -top-px h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-teal" />
                  <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-teal" />
                  <div className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-teal" />
                  <div className="absolute -bottom-px -right-px h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-teal" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border p-4">
            <p className="text-xs text-muted-foreground">{scanning ? "Scanning…" : "Camera idle"}</p>
            {!scanning ? (
              <Button onClick={startScan} className="bg-gradient-hero shadow-soft">
                <Camera className="mr-1.5 h-4 w-4" />
                Start scanner
              </Button>
            ) : (
              <Button onClick={stopScan} variant="outline">
                <CameraOff className="mr-1.5 h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-serif text-xl text-foreground">Manual lookup</h2>
          <p className="text-xs text-muted-foreground">
            Paste a MediSync token or emergency link.
          </p>
          <form onSubmit={lookup} className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Token or /emergency/… link"
                className="pl-9 font-mono"
                maxLength={120}
              />
            </div>
            <Button type="submit">Open</Button>
          </form>
          {lookupError && <p className="mt-2 text-sm text-destructive">{lookupError}</p>}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-border bg-gradient-soft p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            If a QR has been revoked or never enabled, it won't show anything —
            even with a valid-looking token.{" "}
            <Link to="/qr" className="font-semibold text-primary hover:underline">
              Manage your own QR
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
