import { redirect } from "next/navigation";

export const metadata = {
  title: "Concurrentie-analyse | VDB Digital",
  description: "Start een gratis account voor de website scan.",
};

export default function CompetitorAnalyzerPage() {
  redirect("/#scan");
}
