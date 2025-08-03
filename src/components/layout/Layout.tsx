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
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-600 lg:hidden" />
              <h1 className="text-xl font-semibold text-gray-900">Inicio</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Plan Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <Star className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">Starter Plan</span>
              </div>
              
              {/* Upgrade Button */}
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                ¡Mejora tu plan ahora!
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}