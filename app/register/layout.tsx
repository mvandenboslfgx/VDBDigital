import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | VDB Digital",
  description: "Create your VDB Digital account.",
  openGraph: {
    title: "Register | VDB Digital",
    description: "Create your VDB Digital account.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
