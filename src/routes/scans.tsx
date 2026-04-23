import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { RecordsPage } from "@/components/RecordsPage";

export const Route = createFileRoute("/scans")({
  head: () => ({
    meta: [
      { title: "My Scans — MediSync" },
      { name: "description", content: "Your medical scans, X-rays and imaging." },
    ],
  }),
  component: ScansPage,
});

function ScansPage() {
  return (
    <RecordsPage
      title="My Scans"
      subtitle="X-rays, MRIs and imaging studies"
      category="xray"
      HeroIcon={ScanLine}
      emptyHeading="No scans yet"
      emptyDescription="Upload an X-ray, MRI, CT or ultrasound to keep a copy with you."
    />
  );
}
