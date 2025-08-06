import React, { ReactNode } from "react";
import { Star } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ProfileMenu from "@/components/profile/ProfileMenu";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <div className="text-lg font-semibold text-gray-800">AdamoSign</div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileMenu />
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}