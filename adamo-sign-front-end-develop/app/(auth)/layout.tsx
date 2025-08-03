"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DocMenuProvider } from "@/context/DocMenuContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Ensure we only render after the authentication check is complete
    if (isAuthenticated) {
      router.push("/");
    } else {
      setIsAuthChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!isAuthChecked) {
    return null;
  }

  return (
    <DocMenuProvider>
      <main className="flex min-h-dvh flex-col bg-adamo-sign-500 text-white">
        {children}
      </main>
    </DocMenuProvider>
  );
}
