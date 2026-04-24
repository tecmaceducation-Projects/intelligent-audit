import { BarChart3, FileText, LayoutDashboard, Settings, Sparkles, Upload } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Upload Claim", url: "/upload", icon: Upload },
  { title: "Claims History", url: "/claims", icon: FileText },
  { title: "Insights", url: "/insights", icon: BarChart3 },
];

const secondaryItems = [{ title: "Settings", url: "/settings", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItem = (item: (typeof mainItems)[number]) => {
    const isActive =
      item.end ? location.pathname === item.url : location.pathname.startsWith(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
          <NavLink
            to={item.url}
            end={item.end}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex h-14 items-center px-2">
          <Logo showText={!collapsed} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{mainItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{secondaryItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="m-2 rounded-xl border bg-gradient-brand p-3 text-primary-foreground shadow-soft">
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">AI Mode</span>
            </div>
            <p className="text-[11px] leading-snug opacity-90">
              Live fraud signals are being scored across your last 60 days of claims.
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
