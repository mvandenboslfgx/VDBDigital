import { redirect } from "next/navigation";

export const metadata = {
  title: "AI Copy | VDB Digital",
  description: "Start een gratis account voor de website scan.",
};

export default function AiCopyPage() {
  redirect("/#scan");
}
