
"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, XCircle, Clock, ArrowRight, Trophy, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { fetchSeriesInfo, Match, getWinnerFromStatus } from "@/lib/api";

export default function MyPredictions() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState(true);

  // Load latest series info to check results
  useEffect(() => {
    async function loadSeries() {
      const data = await fetchSeriesInfo(db);
      if (data) {
        setMatches(data.data.matchList);
      }
      setIsSeriesLoading(false);
    }
    loadSeries();
  }, [db]);

  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "predictions"),
      orderBy("predictionTime", "desc")
    );
  }, [db, user]);

  const { data: rawPredictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  // Dynamically evaluate predictions based on latest match status
  const predictions = useMemo(() => {
    if (!rawPredictions || matches.length === 0) return rawPredictions;

    return rawPredictions.map(pred => {
      const match = matches.find(m => m.id === pred.matchId);
      if (!match) return pred;

      // Parse winner from status if match ended
      const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
      const actualWinner = match.matchEnded ? getWinnerFromStatus(match.status, teamNames) : null;

      return {
        ...pred,
        isCorrect: match.matchEnded ? pred.predictedWinner === actualWinner : null,
        matchStatus: match.status,
        matchStarted: match.matchStarted,
        matchEnded: match.matchEnded,
        isLive: match.matchStarted && !match.matchEnded
      };
    });
  }, [rawPredictions, matches]);

  const stats = useMemo(() => {
    if (!predictions) return { totalPoints: 0, winRate: 0 };
    const completed = predictions.filter(p => p.matchEnded);
    const won = completed.filter(p => p.isCorrect === true);
    const totalPoints = predictions.reduce((acc, p) => acc + (p.isCorrect === true ? (p.points || 100) * (p.aiBonus ? 2 : 1) : 0), 0);
    const winRate = completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0;
    return { totalPoints, winRate };
  }, [predictions]);

  if (isUserLoading || isPredictionsLoading || isSeriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Prediction History</h1>
          <p className="text-muted-foreground">Track your progress and accuracy across the season</p>
        </div>
        <Card className="bg-primary text-white border-none shadow-lg px-6 py-4 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/50 uppercase">Total Points</span>
            <span className="text-xl sm:text-2xl font-black">{stats.totalPoints.toLocaleString()}</span>
          </div>
          <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/50 uppercase">Win Rate</span>
            <span className="text-xl sm:text-2xl font-black">{stats.winRate}%</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {!predictions || predictions.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
            <Trophy className="h-12 w-12 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No predictions found. Start by picking a match!</p>
          </div>
        ) : (
          predictions.map((pred) => (
            <PredictionRow key={pred.id} pred={pred} />
          ))
        )}
      </div>
    </div>
  );
}

function PredictionRow({ pred }: { pred: any }) {
  const isWon = pred.isCorrect === true;
  const isLost = pred.isCorrect === false;
  const isPending = !pred.matchEnded;
  const isLive = pred.isLive;

  return (
    <Card className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md bg-white overflow-hidden">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Match Info Section */}
        <div className="flex items-center gap-4 w-full md:w-auto min-w-0">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isWon ? 'bg-green-100 text-green-600' : 
            isLive ? 'bg-red-100 text-red-600' :
            isPending ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {isWon && <CheckCircle2 className="h-6 w-6" />}
            {isLive && <PlayCircle className="h-6 w-6 animate-pulse" />}
            {isPending && !isLive && <Clock className="h-6 w-6" />}
            {isLost && <XCircle className="h-6 w-6" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate md:whitespace-normal leading-tight">
              {pred.matchName || "Cricket Match"}
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-1">
              <History className="h-3 w-3 shrink-0" /> 
              <span className="truncate">
                {format(new Date(pred.predictionTime), "MMM d, h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:flex md:items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Predicted</span>
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold whitespace-nowrap px-2 py-0.5 text-[10px] sm:text-xs">
              {pred.predictedWinner}
            </Badge>
          </div>

          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</span>
            <span className={`text-[11px] sm:text-sm font-black uppercase italic ${
              isWon ? 'text-green-600' : 
              isLive ? 'text-red-500' :
              isPending ? 'text-blue-600' : 'text-red-600'
            }`}>
              {isLive ? "Live" : isPending ? "Locked" : isWon ? "Won" : "Lost"}
            </span>
          </div>

          <div className="flex flex-col items-center bg-muted/50 p-2 rounded-xl relative col-span-2 md:col-span-1 min-w-[90px] sm:min-w-[110px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Points</span>
            <span className="text-lg sm:text-xl font-black text-primary">
              {isPending ? "---" : isWon ? `+${(pred.points || 100) * (pred.aiBonus ? 2 : 1)}` : "+0"}
            </span>
            {pred.aiBonus && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-primary text-[8px] font-black h-4 px-1 shadow-sm border-none">
                AI BONUS x2
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
