import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | VDB Digital",
  description: "Sign in to your VDB Digital account.",
  openGraph: {
    title: "Login | VDB Digital",
    description: "Sign in to your VDB Digital account.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
