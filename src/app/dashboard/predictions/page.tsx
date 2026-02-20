
"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, XCircle, Clock, ArrowRight, Trophy, Loader2, PlayCircle, Info, Users, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, limit } from "firebase/firestore";
import { format } from "date-fns";
import { fetchSeriesInfo, Match, getWinnerFromStatus, getMatchPointValue } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function PredictionsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const effectiveUserId = user?.isAnonymous ? "universal-guest" : user?.uid;

  // Default to the current user when loaded
  useEffect(() => {
    if (effectiveUserId && !selectedUserId) {
      setSelectedUserId(effectiveUserId);
    }
  }, [effectiveUserId, selectedUserId]);

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

  // Fetch available users for the selector
  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, "users"), orderBy("totalPoints", "desc"), limit(50));
  }, [db]);
  const { data: rawUserList, isLoading: isUsersLoading } = useCollection(usersQuery);

  // Filter out blocked users
  const userList = useMemo(() => {
    return (rawUserList || []).filter(u => u.id !== 'Guest_smu5Q' && u.username !== 'Guest_smu5Q');
  }, [rawUserList]);

  // Fetch predictions for the SELECTED user
  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !selectedUserId) return null;
    return query(
      collection(db, "users", selectedUserId, "predictions"),
      orderBy("predictionTime", "desc")
    );
  }, [db, selectedUserId]);

  const { data: rawPredictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  // Fetch profile for the SELECTED user
  const selectedUserRef = useMemoFirebase(() => {
    if (!db || !selectedUserId) return null;
    return doc(db, "users", selectedUserId);
  }, [db, selectedUserId]);
  const { data: selectedProfile } = useDoc(selectedUserRef);

  // Real-time calculation of points and accuracy
  const calculatedStats = useMemo(() => {
    if (!rawPredictions || matches.length === 0) return { totalPoints: 0, accuracy: 0 };
    
    let total = 0;
    let correct = 0;
    let completed = 0;

    rawPredictions.forEach(pred => {
      const match = matches.find(m => m.id === pred.matchId);
      if (!match || !match.matchEnded) return;

      completed++;
      const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
      const actualWinner = getWinnerFromStatus(match.status, teamNames);
      
      if (pred.predictedWinner === actualWinner) {
        correct++;
        total += getMatchPointValue(match.name);
      }
    });

    return {
      totalPoints: total,
      accuracy: completed > 0 ? Math.round((correct / completed) * 100) : 0
    };
  }, [rawPredictions, matches]);

  // Community Sync Logic: If we view a profile and notice their points are wrong, we update them!
  useEffect(() => {
    if (selectedProfile && selectedUserRef && !isSeriesLoading && !isPredictionsLoading && matches.length > 0) {
      const needsUpdate = (selectedProfile.totalPoints ?? -1) !== calculatedStats.totalPoints || 
                          (selectedProfile.accuracy ?? -1) !== calculatedStats.accuracy;

      if (needsUpdate) {
        updateDocumentNonBlocking(selectedUserRef, {
          totalPoints: calculatedStats.totalPoints,
          accuracy: calculatedStats.accuracy,
        });
      }
    }
  }, [selectedProfile, selectedUserRef, calculatedStats, isSeriesLoading, isPredictionsLoading, matches]);

  // Process predictions for display
  const predictions = useMemo(() => {
    if (!rawPredictions || matches.length === 0) return [];

    const isOwnProfile = selectedUserId === effectiveUserId;

    return rawPredictions
      .map(pred => {
        const match = matches.find(m => m.id === pred.matchId);
        if (!match) return null;

        const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
        const actualWinner = match.matchEnded ? getWinnerFromStatus(match.status, teamNames) : null;
        const correctPoints = getMatchPointValue(match.name);

        return {
          ...pred,
          isCorrect: match.matchEnded ? pred.predictedWinner === actualWinner : null,
          matchStatus: match.status,
          matchStarted: match.matchStarted,
          matchEnded: match.matchEnded,
          isLive: match.matchStarted && !match.matchEnded,
          currentPointValue: correctPoints
        };
      })
      .filter(pred => {
        if (!pred) return false;
        if (!isOwnProfile) return pred.matchEnded;
        return true;
      });
  }, [rawPredictions, matches, selectedUserId, effectiveUserId]);

  if (isUserLoading || isSeriesLoading || isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isViewingSelf = selectedUserId === effectiveUserId;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary">
              Predictions Explorer
            </h1>
            <p className="text-muted-foreground">
              {isViewingSelf 
                ? "Manage your active picks and track your performance history." 
                : `Viewing live recalculated history for ${selectedProfile?.username || "another predictor"}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4" /> Select Predictor:
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full sm:w-[280px] rounded-xl border-primary/20 bg-white font-medium shadow-sm">
                <SelectValue placeholder="Choose a predictor..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-primary/10 shadow-xl">
                {userList?.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={u.avatarUrl || `https://picsum.photos/seed/${u.id}/40/40`} />
                        <AvatarFallback className="text-[10px]">{u.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{u.username || "Anonymous"}</span>
                      {u.id === effectiveUserId && <Badge variant="outline" className="text-[9px] py-0 px-1 ml-1">YOU</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-primary text-white border-none shadow-lg px-6 py-4 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full md:w-auto overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-16 w-16" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-bold text-white/50 uppercase">Live Points</span>
            <span className="text-xl sm:text-2xl font-black">{calculatedStats.totalPoints.toLocaleString()}</span>
          </div>
          <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-bold text-white/50 uppercase">Live Accuracy</span>
            <span className="text-xl sm:text-2xl font-black">{calculatedStats.accuracy}%</span>
          </div>
        </Card>
      </div>

      {!isViewingSelf && (
        <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium text-primary shadow-sm animate-in zoom-in-95 duration-300">
          <Info className="h-5 w-5 text-accent shrink-0" />
          <p>This profile's points have been <strong>recalculated in real-time</strong>. Any discrepancies have been automatically corrected on the leaderboard.</p>
        </div>
      )}

      {isPredictionsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <div className="grid gap-4">
          {predictions.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
              <Trophy className="h-12 w-12 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No visible predictions found for this user.</p>
              {isViewingSelf && (
                <Button asChild variant="link" className="mt-2" >
                  <Link href="/dashboard">Make your first prediction</Link>
                </Button>
              )}
            </div>
          ) : (
            predictions.map((pred) => (
              <PredictionRow key={pred.id} pred={pred} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PredictionRow({ pred }: { pred: any }) {
  const isWon = pred.isCorrect === true;
  const isLost = pred.isCorrect === false;
  const isPending = !pred.matchEnded;
  const isLive = pred.isLive;

  return (
    <Card className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md bg-white overflow-hidden group">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto min-w-0">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
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
            <h3 className="font-bold text-base sm:text-lg truncate md:whitespace-normal leading-tight group-hover:text-primary transition-colors">
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

        <div className="grid grid-cols-2 md:flex md:items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Predicted</span>
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold whitespace-nowrap px-3 py-1 text-[10px] sm:text-xs rounded-lg">
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
              {isLive ? "Live" : isPending ? "Active" : isWon ? "Won" : "Lost"}
            </span>
          </div>

          <div className="flex flex-col items-center bg-muted/50 p-2 rounded-xl relative col-span-2 md:col-span-1 min-w-[90px] sm:min-w-[110px] border border-primary/5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Points</span>
            <span className="text-lg sm:text-xl font-black text-primary">
              {isPending ? `(${pred.currentPointValue})` : isWon ? `+${pred.currentPointValue}` : "+0"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
