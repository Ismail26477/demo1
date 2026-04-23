import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface QRDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRDisplay({ value, size = 240, className }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0c2340", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#0c2340", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(setDataUrl);
  }, [value, size]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `medisync-${value}.png`;
    a.click();
  };

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR ${value}</title>
      <style>body{font-family:system-ui;text-align:center;padding:40px;}img{width:280px;height:280px;}h2{margin-bottom:4px;}</style>
      </head><body>
      <h2>MediSync · Personal Health Hub</h2>
      <p style="color:#555;margin-top:0">Token: <strong>${value}</strong></p>
      <img src="${dataUrl}" />
      <p style="font-size:12px;color:#888;margin-top:24px">Scan with a phone camera to access shared medical records.</p>
      <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <div className="rounded-2xl border border-border bg-white p-3 shadow-soft sm:p-4">
        <canvas
          ref={canvasRef}
          className="block h-auto w-full max-w-[240px]"
          style={{ aspectRatio: "1 / 1" }}
        />
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={download} variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="mr-1.5 h-4 w-4" />
          Download PNG
        </Button>
        <Button onClick={print} size="sm" className="w-full sm:w-auto">
          <Printer className="mr-1.5 h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
