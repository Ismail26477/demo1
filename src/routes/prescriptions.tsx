import { createFileRoute } from "@tanstack/react-router";
import { Pill } from "lucide-react";
import { RecordsPage } from "@/components/RecordsPage";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({
    meta: [
      { title: "Prescriptions — MediSync" },
      { name: "description", content: "All your prescriptions in one place." },
    ],
  }),
  component: () => (
    <RecordsPage
      title="Prescriptions"
      subtitle="Scripts and Rx documents"
      category="prescription"
      HeroIcon={Pill}
      emptyHeading="No prescriptions yet"
      emptyDescription="Upload a prescription so you always have it with you at the pharmacy."
    />
  ),
});
