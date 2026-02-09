
"use client";

import { useEffect, useMemo, useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Trophy, Home, List, Award, Settings, LogOut, Search, Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { fetchSeriesInfo, getWinnerFromStatus, Match } from "@/lib/api";

/**
 * A sub-component to handle the Sidebar content so it can access the useSidebar hook
 * provided by the SidebarProvider.
 */
function DashboardSidebar({ profile, effectiveUserId, user, handleLogout }: any) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const menuItems = [
    { icon: Home, label: "Matches", href: "/dashboard" },
    { icon: List, label: "My Predictions", href: "/dashboard/predictions" },
    { icon: Award, label: "Leaderboard", href: "/dashboard/leaderboard" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const displayName = profile?.username || user?.email?.split("@")[0] || (user?.isAnonymous ? "The Universal Guest" : "User");
  const displayBadge = user?.isAnonymous ? "Shared Guest Mode" : "Pro Predictor";
  const avatarUrl = profile?.avatarUrl || `https://picsum.photos/seed/${effectiveUserId}/100/100`;

  return (
    <Sidebar className="border-r border-primary/5">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="bg-primary p-1.5 rounded-lg">
            <Trophy className="h-6 w-6 text-accent" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">Cricket Oracle</span>
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
                  onClick={closeMobile}
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
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.isAnonymous ? <UserCircle className="h-6 w-6" /> : (displayName?.[0] || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-primary truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{displayBadge}</span>
            </div>
          </div>
          <Separator className="bg-primary/10" />
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                closeMobile();
                handleLogout();
              }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState(true);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const effectiveUserId = user?.isAnonymous ? "universal-guest" : user?.uid;

  const userDocRef = useMemoFirebase(() => {
    if (!effectiveUserId) return null;
    return doc(db, "users", effectiveUserId);
  }, [db, effectiveUserId]);

  const { data: profile, isLoading: isLoadingProfile } = useDoc(userDocRef);

  // Fetch matches for point calculation
  useEffect(() => {
    async function loadData() {
      const data = await fetchSeriesInfo(db);
      if (data) {
        setMatches(data.data.matchList);
      }
      setIsSeriesLoading(false);
    }
    loadData();
  }, [db]);

  // Fetch user predictions
  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !effectiveUserId) return null;
    return query(collection(db, "users", effectiveUserId, "predictions"));
  }, [db, effectiveUserId]);

  const { data: predictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  // Lazy Point Sync Logic
  useEffect(() => {
    if (profile && userDocRef && predictions && matches.length > 0 && !isPredictionsLoading && !isSeriesLoading) {
      const completed = predictions.filter(pred => {
        const match = matches.find(m => m.id === pred.matchId);
        return match?.matchEnded;
      });

      const wins = completed.filter(pred => {
        const match = matches.find(m => m.id === pred.matchId);
        if (!match) return false;
        const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
        const actualWinner = getWinnerFromStatus(match.status, teamNames);
        return pred.predictedWinner === actualWinner;
      });

      const calculatedPoints = wins.length * 2;
      const calculatedAccuracy = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 0;

      const needsUpdate = (profile.totalPoints ?? -1) !== calculatedPoints || 
                          (profile.accuracy ?? -1) !== calculatedAccuracy;

      if (needsUpdate) {
        updateDocumentNonBlocking(userDocRef, {
          totalPoints: calculatedPoints,
          accuracy: calculatedAccuracy,
        });
      }
    }
  }, [profile, userDocRef, predictions, matches, isPredictionsLoading, isSeriesLoading]);

  // Initialization: Ensure every logged-in user or the shared guest has a profile
  useEffect(() => {
    if (user && !isUserLoading && profile === null && !isLoadingProfile && effectiveUserId) {
      const userRef = doc(db, "users", effectiveUserId);
      setDocumentNonBlocking(userRef, {
        id: effectiveUserId,
        username: user.isAnonymous 
          ? `The Universal Guest` 
          : (user.email?.split("@")[0] || "User"),
        email: user.email || null,
        totalPoints: 0,
        accuracy: 0,
        isSharedGuest: user.isAnonymous,
      }, { merge: true });
    }
  }, [user, isUserLoading, profile, isLoadingProfile, db, effectiveUserId]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="h-12 w-12 text-primary animate-bounce" />
          <p className="text-sm font-medium text-muted-foreground">Entering the Oracle...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <DashboardSidebar 
          profile={profile} 
          effectiveUserId={effectiveUserId} 
          user={user} 
          handleLogout={handleLogout} 
        />

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
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-white"></span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
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
