import { redirect } from "next/navigation";

export const metadata = {
  title: "Website audit | VDB Digital",
  description: "Start een gratis website scan. SEO, performance, UX en conversie in één overzicht.",
};

export default function AuditPage() {
  redirect("/#scan");
}
