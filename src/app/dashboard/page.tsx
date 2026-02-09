"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchSeriesInfo, Match, getWinnerFromStatus } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, ChevronRight, History, Trophy, CheckCircle2, ListFilter, PlayCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'live' | 'upcoming' | 'finished';

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesInfo, setSeriesInfo] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const db = useFirestore();
  const { user } = useUser();

  const effectiveUserId = user?.isAnonymous ? "universal-guest" : user?.uid;

  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !effectiveUserId) return null;
    return query(collection(db, "users", effectiveUserId, "predictions"));
  }, [db, effectiveUserId]);

  const { data: predictions } = useCollection(predictionsQuery);

  useEffect(() => {
    async function loadData() {
      const data = await fetchSeriesInfo(db);
      if (data) {
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

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const isLive = match.status.toLowerCase().includes("live") || (match.matchStarted && !match.matchEnded);
      const isEnded = match.matchEnded;
      const isUpcoming = !match.matchStarted;

      if (filter === 'live') return isLive;
      if (filter === 'upcoming') return isUpcoming && !isEnded;
      if (filter === 'finished') return isEnded;
      return true;
    });
  }, [matches, filter]);

  const stats = useMemo(() => {
    const liveCount = matches.filter(m => m.status.toLowerCase().includes("live") || (m.matchStarted && !m.matchEnded)).length;
    return { liveCount };
  }, [matches]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Live & Upcoming Matches</h1>
          <p className="text-muted-foreground">Predict results for {seriesInfo?.name || "Cricket Series"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All
          </Button>
          <Button 
            variant={filter === 'live' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('live')}
            className={cn("rounded-full", filter === 'live' ? "bg-red-500 hover:bg-red-600" : "")}
          >
            <PlayCircle className="h-4 w-4 mr-2" /> Live {stats.liveCount > 0 && <Badge variant="secondary" className="ml-1 h-4 p-0 px-1 bg-white text-red-500">{stats.liveCount}</Badge>}
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('upcoming')}
            className="rounded-full"
          >
            <Clock className="h-4 w-4 mr-2" /> Upcoming
          </Button>
          <Button 
            variant={filter === 'finished' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('finished')}
            className="rounded-full"
          >
            <History className="h-4 w-4 mr-2" /> Finished
          </Button>
        </div>
      </div>

      {filteredMatches.length === 0 && !loading ? (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
          <ListFilter className="h-12 w-12 text-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No matches found matching your current filter.</p>
          <Button variant="link" onClick={() => setFilter('all')}>View All Matches</Button>
        </div>
      ) : (
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
            filteredMatches.map((match) => {
              const userPrediction = predictions?.find(p => p.matchId === match.id);
              return (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  predictedTeam={userPrediction?.predictedWinner} 
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, predictedTeam }: { match: Match, predictedTeam?: string }) {
  const isLive = match.status.toLowerCase().includes("live") || (match.matchStarted && !match.matchEnded);
  const isEnded = match.matchEnded;
  const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
  const winner = isEnded ? getWinnerFromStatus(match.status, teamNames) : null;
  
  const [localDate, setLocalDate] = useState<string>("Loading time...");

  const matchStartTime = new Date(match.dateTimeGMT.endsWith('Z') ? match.dateTimeGMT : `${match.dateTimeGMT.replace(' ', 'T')}Z`).getTime();
  const now = new Date().getTime();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isPredictionsClosed = now > (matchStartTime - ONE_HOUR_MS) || match.matchStarted;

  useEffect(() => {
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
      <div className={`absolute top-0 left-0 w-1 h-full transition-all ${isLive ? 'bg-red-500' : isEnded ? 'bg-primary' : 'bg-primary/20'}`}></div>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Badge 
              variant={isLive ? "default" : "secondary"} 
              className={isLive ? "bg-red-500 animate-pulse" : isEnded ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
            >
              {isLive ? "LIVE NOW" : isEnded ? "MATCH ENDED" : "UPCOMING"}
            </Badge>
            {predictedTeam && (
              <Badge className="bg-green-500/10 text-green-600 border-green-200 gap-1 px-2">
                <CheckCircle2 className="h-3 w-3" /> {predictedTeam}
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{match.matchType}</span>
        </div>
        <CardTitle className="text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{match.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3 w-3" /> {localDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          {match.teamInfo?.map((team, idx) => {
            const isWinner = winner === team.name;
            const isPredicted = predictedTeam === team.name;
            return (
              <div key={team.id || idx} className="flex flex-col items-center flex-1 text-center relative">
                <div className={`w-16 h-16 rounded-2xl p-2 flex items-center justify-center mb-2 border transition-all overflow-hidden relative ${
                  isWinner ? 'bg-accent/10 border-accent shadow-md' : 
                  isPredicted ? 'bg-primary/5 border-primary/30 shadow-sm' :
                  'bg-muted/30 border-primary/5 group-hover:border-primary/20'
                }`}>
                  {team.img ? (
                     <Image src={team.img} alt={team.name} width={48} height={48} className="object-contain" />
                  ) : (
                    <Target className="h-8 w-8 text-primary/30" />
                  )}
                  {isWinner && (
                    <div className="absolute top-0 right-0 p-0.5 bg-accent rounded-bl-lg">
                      <Trophy className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
                <span className={`text-sm font-bold truncate w-full ${isWinner ? 'text-primary' : isPredicted ? 'text-primary/70' : ''}`}>
                  {team.shortname || team.name}
                </span>
              </div>
            );
          })}
          <div className="flex flex-col items-center">
            <span className="text-xs font-headline font-black text-muted-foreground/30 italic">VS</span>
          </div>
        </div>
        
        {isEnded && (
          <div className="text-center bg-primary/5 p-2 rounded-lg border border-primary/10">
            <p className="text-[10px] font-black uppercase text-primary italic leading-tight">
              {match.status}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg font-medium">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full rounded-xl h-11 shadow-sm font-bold group-hover:shadow-primary/20 transition-all">
          <Link href={`/dashboard/match/${match.id}`}>
            {isEnded ? "View Result" : isPredictionsClosed ? "View Progress" : predictedTeam ? "Update Prediction" : "Predict Outcome"} 
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}