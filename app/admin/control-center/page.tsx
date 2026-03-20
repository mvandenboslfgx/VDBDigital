import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import ControlCenterLive from "@/components/admin/ControlCenterLive";

export default async function OwnerControlCenterPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="min-h-[70vh]">
      <ControlCenterLive />
    </div>
  );
}
