import { redirect } from "next/navigation";

export const metadata = {
  title: "Funnel Builder | VDB Digital",
  description: "Start een gratis account voor de website scan.",
};

export default function FunnelBuilderPage() {
  redirect("/#scan");
}
