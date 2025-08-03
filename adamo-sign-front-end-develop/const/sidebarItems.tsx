import { SidebarItem } from "@/types";

import {
  HomeIcon,
  DocumentIcon,
  AccountCircleIcon,
  SignatureIcon,
  NotificationIcon,
} from "@/components/icon";

export const sidebarItems: SidebarItem[] = [
  {
    titleId: "home",
    href: "/",
    icon: <HomeIcon />,
    hasBadge: false,
  },
  {
    titleId: "documents",
    href: "/documents",
    icon: <DocumentIcon />,
    hasBadge: false,
  },
  {
    titleId: "contacts",
    href: "/contacts",
    icon: <AccountCircleIcon />,
    hasBadge: false,
  },
  {
    titleId: "verifications",
    href: "/verifications",
    icon: <SignatureIcon />,
    hasBadge: false,
  },
  {
    titleId: "notifications",
    href: "/notifications",
    icon: <NotificationIcon />,
    hasBadge: true,
  },
];
