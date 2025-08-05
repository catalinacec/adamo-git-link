import { ReactNode } from "react";
import { Star } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4 bg-white">
            <SidebarTrigger />
          </header>
          <div className="p-6 bg-neutral-25">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}