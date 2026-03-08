import { redirect } from "next/navigation";

export const metadata = {
  title: "Gratis AI website audit | VDB Digital",
  description: "Start een gratis website scan. SEO, performance, UX en conversie in één overzicht.",
};

export default function AIWebsiteAuditPage() {
  redirect("/#scan");
}
