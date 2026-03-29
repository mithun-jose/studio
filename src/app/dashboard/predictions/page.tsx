"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, XCircle, Clock, Loader2, Trophy } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { fetchSeriesInfo, Match, getWinnerFromStatus } from "@/lib/api";

export default function PredictionsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState(true);

  const effectiveUserId = user?.uid;

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
    if (!db || !effectiveUserId) return null;
    return query(
      collection(db, "users", effectiveUserId, "predictions"),
      orderBy("predictionTime", "desc")
    );
  }, [db, effectiveUserId]);

  const { data: predictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  if (isUserLoading || isSeriesLoading || isPredictionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Your Predictions</h1>
      <div className="grid gap-4">
        {predictions?.map((pred) => {
          const match = matches.find(m => m.id === pred.matchId);
          if (!match) return null;
          
          const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
          const actualWinner = match.matchEnded ? getWinnerFromStatus(match.status, teamNames) : null;
          const isCorrect = match.matchEnded ? pred.predictedWinner === actualWinner : null;

          return (
            <Card key={pred.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{pred.matchName}</h3>
                  <p className="text-sm text-muted-foreground">Picked: {pred.predictedWinner}</p>
                </div>
                <div className="flex items-center gap-2">
                  {match.matchEnded ? (
                    isCorrect ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />
                  ) : (
                    <Clock className="text-blue-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
