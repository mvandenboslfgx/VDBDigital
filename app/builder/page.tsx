import { redirect } from "next/navigation";

export const metadata = {
  title: "AI Website Builder | VDB Digital",
  description: "Start een gratis account om de website scan te gebruiken.",
};

export default function BuilderPage() {
  redirect("/#scan");
}
