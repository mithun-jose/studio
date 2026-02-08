
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Trophy, Home, List, Award, Settings, LogOut, Search, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Matches", href: "/dashboard" },
    { icon: List, label: "My Predictions", href: "/dashboard/predictions" },
    { icon: Award, label: "Leaderboard", href: "/dashboard/leaderboard" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-primary/5">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <span className="font-headline font-bold text-xl tracking-tight text-primary">Oracle</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Navigation</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-11 px-4 rounded-xl transition-all ${
                        pathname === item.href 
                          ? "bg-primary text-white font-semibold shadow-md shadow-primary/20" 
                          : "hover:bg-primary/5"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <div className="bg-primary/5 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src="https://picsum.photos/seed/currentuser/100/100" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary">John Doe</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Pro Predictor</span>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex flex-col gap-1">
                <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 border-b bg-white/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search series or teams..." 
                  className="bg-muted/50 border-none rounded-full pl-10 pr-4 h-9 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white"></span>
              </button>
              <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
