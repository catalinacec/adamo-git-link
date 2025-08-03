import { Home, FileText, Users, Shield, Bell, User, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-white/10 text-white font-medium" : "text-white/80 hover:bg-white/5 hover:text-white";

  return (
    <Sidebar className="bg-[#4B5BA6] border-none w-64">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#4B5BA6] font-bold text-sm">AS</span>
          </div>
          <span className="text-white font-semibold text-lg">adamosign</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <div className="flex items-center gap-3 py-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
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

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-white text-sm">Mi perfil</span>
          </div>

          {/* Logout */}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer text-white/80">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Cerrar sesión</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}