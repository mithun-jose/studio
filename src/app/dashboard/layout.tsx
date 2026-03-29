
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Trophy, Home, List, Award, Settings, LogOut, Search, Bell, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { fetchSeriesInfo, getWinnerFromStatus, getMatchPointValue, Match } from "@/lib/api";
import Image from "next/image";

function DashboardSidebar({ profile, effectiveUserId, user, handleLogout }: any) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const menuItems = [
    { icon: Home, label: "Matches", href: "/dashboard" },
    { icon: List, label: "Predictions", href: "/dashboard/predictions" },
    { icon: Award, label: "Leaderboard", href: "/dashboard/leaderboard" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isGuest = user?.isAnonymous;
  const displayName = isGuest ? "Universal Guest" : (profile?.username || user?.email?.split("@")[0] || "User");
  const avatarUrl = isGuest 
    ? "https://upload.wikimedia.org/wikipedia/commons/4/46/Blockbuster_logo.svg"
    : (profile?.avatarUrl || `https://picsum.photos/seed/${effectiveUserId}/100/100`);

  return (
    <Sidebar className="border-r border-primary/5">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="relative h-8 w-12 overflow-hidden rounded-md bg-accent">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/4/46/Blockbuster_logo.svg" 
              alt="Blockbuster Logo" 
              fill 
              className="object-contain p-1"
            />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">Cricket Blockbuster</span>
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
              <AvatarImage src={avatarUrl} className={isGuest ? "object-contain p-1" : ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {isGuest ? <Users className="h-5 w-5" /> : (displayName?.[0] || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-primary truncate">
                {displayName}
              </span>
              {isGuest && <span className="text-[10px] text-muted-foreground font-medium">Community Account</span>}
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
  const initializedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const effectiveUserId = user?.uid;
  const effectiveProfileId = user?.isAnonymous ? "universal_guest" : effectiveUserId;

  const userDocRef = useMemoFirebase(() => {
    if (!db || !effectiveProfileId) return null;
    return doc(db, "users", effectiveProfileId);
  }, [db, effectiveProfileId]);

  const { data: profile, isLoading: isLoadingProfile } = useDoc(userDocRef);

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

  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !effectiveUserId) return null;
    return query(collection(db, "users", effectiveUserId, "predictions"));
  }, [db, effectiveUserId]);

  const { data: predictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  useEffect(() => {
    if (profile && userDocRef && predictions && matches.length > 0 && !isPredictionsLoading && !isSeriesLoading) {
      let calculatedPoints = 0;
      let correctWinsCount = 0;
      let completedCount = 0;
      
      predictions.forEach(pred => {
        const match = matches.find(m => m.id === pred.matchId);
        if (!match || !match.matchEnded) return;

        completedCount++;
        const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
        const actualWinner = getWinnerFromStatus(match.status, teamNames);
        
        if (pred.predictedWinner === actualWinner) {
          correctWinsCount++;
          calculatedPoints += getMatchPointValue(match.name);
        }
      });

      const calculatedAccuracy = completedCount > 0 
        ? Math.round((correctWinsCount / completedCount) * 100) 
        : 0;

      // For universal_guest, we only update if our local calculation is higher or different
      // This is a simplified "Community Sync"
      const needsUpdate = (profile.totalPoints ?? -1) !== calculatedPoints || 
                          (profile.accuracy ?? -1) !== calculatedAccuracy;

      if (needsUpdate && userDocRef) {
        updateDocumentNonBlocking(userDocRef, {
          totalPoints: calculatedPoints,
          accuracy: calculatedAccuracy,
        });
      }
    }
  }, [profile, userDocRef, predictions, matches, isPredictionsLoading, isSeriesLoading]);

  useEffect(() => {
    if (user && !isUserLoading && !isLoadingProfile && initializedUserId.current !== effectiveProfileId && userDocRef) {
      async function ensureProfile() {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const isGuest = user.isAnonymous;
          setDocumentNonBlocking(userDocRef, {
            id: effectiveProfileId,
            username: isGuest ? "Universal Guest" : (user.email?.split("@")[0] || "User"),
            email: user.email || null,
            totalPoints: 0,
            accuracy: 0,
            avatarUrl: isGuest ? "https://upload.wikimedia.org/wikipedia/commons/4/46/Blockbuster_logo.svg" : null
          }, { merge: true });
        }
        initializedUserId.current = effectiveProfileId;
      }
      ensureProfile();
    }
  }, [user, isUserLoading, isLoadingProfile, userDocRef, effectiveProfileId]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Trophy className="h-12 w-12 text-primary animate-bounce" />
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
                  placeholder="Search..." 
                  className="bg-muted/50 border-none rounded-full pl-10 pr-4 h-9 text-sm w-64 outline-none"
                />
              </div>
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
