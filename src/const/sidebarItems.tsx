import { FileText, Users, Bell, Home } from "lucide-react";

export const sidebarItems = [
  {
    titleId: "home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    titleId: "documents", 
    href: "/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    titleId: "contacts",
    href: "/contacts", 
    icon: <Users className="h-5 w-5" />,
  },
  {
    titleId: "notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
];