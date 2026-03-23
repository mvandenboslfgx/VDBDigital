import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import ControlCenterLive from "@/components/admin/ControlCenterLive";
import { getControlCenterLiveData } from "@/lib/admin/control-center-live";

export default async function OwnerControlCenterPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const initialData = await getControlCenterLiveData();

  return (
    <div className="min-h-[70vh]">
      <ControlCenterLive initialData={initialData} />
    </div>
  );
}
