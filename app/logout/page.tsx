"use client";

import { useEffect, useRef } from "react";

export default function LogoutPage() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-24">
      <p className="text-gray-400">Signing out…</p>
      <form
        ref={formRef}
        action="/api/auth/logout"
        method="POST"
        className="hidden"
      />
    </div>
  );
}
