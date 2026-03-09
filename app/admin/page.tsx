import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isOwner } from "@/lib/permissions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user && isOwner(user)) {
    redirect("/admin/site");
  }
  redirect("/admin/dashboard");
}
