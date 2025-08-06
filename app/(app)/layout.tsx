"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DocMenuProvider } from "@/context/DocMenuContext";
import { FileProvider } from "@/context/FileContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { SidebarProvider } from "@/components/Sidebar/Sidebar";
import { SignatureProvider } from "@/context/SignatureContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FileProvider>
      <SignatureProvider>
        <ProfileProvider>
          <NotificationsProvider>
            <SidebarProvider>
              <AppSidebar />
              <DocMenuProvider>
                <main className="flex min-h-dvh w-full flex-col bg-neutral-25 pb-6">
                  {children}
                </main>
              </DocMenuProvider>
            </SidebarProvider>
          </NotificationsProvider>
        </ProfileProvider>
      </SignatureProvider>
    </FileProvider>
  );
}