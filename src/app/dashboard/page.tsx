
"use client";

import { useEffect, useState } from "react";
import { fetchSeriesInfo, Match } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, ChevronRight, Zap, Target, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useFirestore } from "@/firebase";

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesInfo, setSeriesInfo] = useState<any>(null);
  const db = useFirestore();

  useEffect(() => {
    async function loadData() {
      const data = await fetchSeriesInfo(db);
      if (data) {
        // Sort matches by date (earliest first)
        const sortedMatches = [...data.data.matchList].sort((a, b) => 
          new Date(a.dateTimeGMT).getTime() - new Date(b.dateTimeGMT).getTime()
        );
        setMatches(sortedMatches);
        setSeriesInfo(data.data.info);
      }
      setLoading(false);
    }
    loadData();
  }, [db]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Live & Upcoming Matches</h1>
          <p className="text-muted-foreground">Predict results for {seriesInfo?.name || "Cricket Series"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-white">
            <History className="h-4 w-4 mr-2" /> Results
          </Button>
          <Button size="sm" className="rounded-full shadow-lg shadow-primary/10">
             Live Matches <Badge variant="secondary" className="ml-2 bg-accent text-primary h-5 p-0 px-1">2</Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status.toLowerCase().includes("live") || (match.matchStarted && !match.matchEnded);
  const [localDate, setLocalDate] = useState<string>("Loading time...");

  useEffect(() => {
    // Ensure the date string is treated as UTC by appending Z if missing 
    // and replacing space with T for valid ISO parsing
    const dateStr = match.dateTimeGMT.endsWith('Z') 
      ? match.dateTimeGMT 
      : `${match.dateTimeGMT.replace(' ', 'T')}Z`;
    
    try {
      const date = new Date(dateStr);
      setLocalDate(format(date, "MMM d, h:mm a"));
    } catch (e) {
      setLocalDate("Date unavailable");
    }
  }, [match.dateTimeGMT]);
  
  return (
    <Card className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
      <div className={`absolute top-0 left-0 w-1 h-full transition-all ${isLive ? 'bg-accent' : 'bg-primary/20'}`}></div>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={isLive ? "default" : "secondary"} className={isLive ? "bg-red-500 animate-pulse" : "bg-muted text-muted-foreground"}>
            {isLive ? "LIVE NOW" : "UPCOMING"}
          </Badge>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{match.matchType}</span>
        </div>
        <CardTitle className="text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{match.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3 w-3" /> {localDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          {match.teamInfo?.map((team, idx) => (
            <div key={team.id || idx} className="flex flex-col items-center flex-1 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 p-2 flex items-center justify-center mb-2 border border-primary/5 group-hover:border-primary/20 transition-all overflow-hidden relative">
                {team.img ? (
                   <Image src={team.img} alt={team.name} width={48} height={48} className="object-contain" />
                ) : (
                  <Target className="h-8 w-8 text-primary/30" />
                )}
              </div>
              <span className="text-sm font-bold truncate w-full">{team.shortname || team.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            <span className="text-xs font-headline font-black text-muted-foreground/30 italic">VS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg font-medium">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full rounded-xl h-11 shadow-sm font-bold group-hover:shadow-primary/20 transition-all">
          <Link href={`/dashboard/match/${match.id}`}>
            {match.matchStarted ? "View Progress" : "Predict Outcome"} 
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
