import React from "react";
import { Home, FileText, Users, Shield, Bell, User, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdamoLogo } from "@/components/ui/AdamoLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Documentos", url: "/documents", icon: FileText },
  { title: "Contactos", url: "/contacts", icon: Users },
  { title: "Verificaciones", url: "/verify", icon: Shield },
  { title: "Notificaciones", url: "/notifications", icon: Bell, badge: true },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-white/15 text-white" 
      : "text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <Sidebar className="bg-gradient-to-b from-adamo-sign-600 to-adamo-sign-800 border-none w-64">
      <SidebarHeader className="p-6">
        <div className="flex justify-center">
          <AdamoLogo width={140} height={80} className="brightness-0 invert" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <div className="flex items-center gap-3 py-3 px-3 rounded-lg w-full">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{item.title}</span>
                          {item.badge && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <div className="space-y-2">
          {/* User Profile */}
          <NavLink to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Mi perfil</span>
          </NavLink>

          {/* Logout */}
          <button 
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-white/70 w-full text-left"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}