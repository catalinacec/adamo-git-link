"use client";

import { sidebarItems } from "@/const/sidebarItems";

import { useState } from "react";

import { useNotifications } from "@/context/NotificationsContext";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFile } from "@/context/FileContext";
import { useProfile } from "@/context/ProfileContext";

import { cn } from "@/lib/utils";

import { AdamoLogo } from "@/components/ui/AdamoLogo";

import { LogoutModal } from "../Modals/LogoutModal";
import { LogoutIcon } from "../icon";


import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./Sidebar";

export const AppSidebar = () => {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { resetFile } = useFile();

  const { unreadCount } = useNotifications();

  const { profileImage } = useProfile();

  return (
    <>
      <Sidebar>
        {/* Header */}
        <SidebarHeader>
          <div className="flex w-full justify-end p-6 lg:hidden">
            <SidebarClose />
          </div>
          <Link href="/">
            <AdamoLogo width={140} height={80} />
          </Link>
        </SidebarHeader>

        {/* Sidebar Menu */}
        <SidebarContent>
          <SidebarMenu>
            {sidebarItems.map((item) => {
              const showBadge = item.titleId === "notifications" && unreadCount > 0;
              return (
                <SidebarMenuItem key={item.titleId}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={() => {
                      setTimeout(() => resetFile(), 100);
                    }}
                  >
                    <Link href={item.href}>
                      {item.icon} {t(item.titleId)}
                    </Link>
                  </SidebarMenuButton>
                  {showBadge && <SidebarMenuBadge />}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter>
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-6 py-3 text-white",
              pathname === "/profile" && "bg-white/10",
            )}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image
                fill
                unoptimized
                alt="User profile"
                src={profileImage || "/default-user.png"}
                className="object-cover"
              />
            </div>
            <span>{t("profile")}</span>
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 p-6 text-white"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogoutIcon /> {t("logout")}
          </button>
        </SidebarFooter>
      </Sidebar>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
