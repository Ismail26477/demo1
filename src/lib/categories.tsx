import { FileImage, FileText, Pill, File as FileIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { MedicalFile } from "./store";

export const CATEGORY_META: Record<
  MedicalFile["category"],
  { label: string; short: string; icon: ReactNode; tone: string; chip: string }
> = {
  xray: {
    label: "Scans",
    short: "Scan",
    icon: <FileImage className="h-4 w-4" />,
    tone: "bg-primary/10 text-primary",
    chip: "bg-primary/10 text-primary border-primary/20",
  },
  report: {
    label: "Lab Reports",
    short: "Report",
    icon: <FileText className="h-4 w-4" />,
    tone: "bg-teal/15 text-teal",
    chip: "bg-teal/15 text-teal border-teal/30",
  },
  prescription: {
    label: "Prescriptions",
    short: "Rx",
    icon: <Pill className="h-4 w-4" />,
    tone: "bg-success/15 text-success",
    chip: "bg-success/15 text-success border-success/30",
  },
  other: {
    label: "Other Documents",
    short: "Other",
    icon: <FileIcon className="h-4 w-4" />,
    tone: "bg-muted text-muted-foreground",
    chip: "bg-muted text-muted-foreground border-border",
  },
};

export const CATEGORY_ORDER: MedicalFile["category"][] = [
  "xray",
  "report",
  "prescription",
  "other",
];
