import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "@/app/register/RegisterForm";

export const metadata = {
  title: "Account aanmaken | VDB Digital",
  description: "Maak een gratis account voor website-scans, AI-tools en rapporten.",
};

export default async function CreateAccountPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <RegisterForm />;
}

