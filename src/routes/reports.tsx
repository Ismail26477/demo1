import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { RecordsPage } from "@/components/RecordsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Lab Reports — MediSync" },
      { name: "description", content: "Lab reports and pathology results." },
    ],
  }),
  component: () => (
    <RecordsPage
      title="Lab Reports"
      subtitle="Bloodwork, pathology and diagnostics"
      category="report"
      HeroIcon={FileText}
      emptyHeading="No reports yet"
      emptyDescription="Add lab results and diagnostic reports to track them over time."
    />
  ),
});
