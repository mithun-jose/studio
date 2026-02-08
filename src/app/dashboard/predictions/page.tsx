
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, XCircle, Clock, ArrowRight, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";

export default function MyPredictions() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const predictionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "predictions"),
      orderBy("predictionTime", "desc")
    );
  }, [db, user]);

  const { data: predictions, isLoading: isPredictionsLoading } = useCollection(predictionsQuery);

  const stats = useMemo(() => {
    if (!predictions) return { totalPoints: 0, winRate: 0 };
    const completed = predictions.filter(p => p.isCorrect !== null);
    const won = completed.filter(p => p.isCorrect === true);
    const totalPoints = predictions.reduce((acc, p) => acc + (p.isCorrect === true ? (p.points || 100) * (p.aiBonus ? 2 : 1) : 0), 0);
    const winRate = completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0;
    return { totalPoints, winRate };
  }, [predictions]);

  if (isUserLoading || isPredictionsLoading) {
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
        <Card className="bg-primary text-white border-none shadow-lg px-6 py-4 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/50 uppercase">Total Points</span>
            <span className="text-2xl font-black">{stats.totalPoints.toLocaleString()}</span>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/50 uppercase">Win Rate</span>
            <span className="text-2xl font-black">{stats.winRate}%</span>
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
  const isPending = pred.isCorrect === null;

  return (
    <Card className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md bg-white overflow-hidden">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isWon ? 'bg-green-100 text-green-600' : 
            isPending ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {isWon && <CheckCircle2 className="h-6 w-6" />}
            {isPending && <Clock className="h-6 w-6" />}
            {isLost && <XCircle className="h-6 w-6" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-lg truncate">{pred.matchName || "Cricket Match"}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="h-3 w-3" /> {format(new Date(pred.predictionTime), "MMM d, yyyy h:mm a")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Predicted</span>
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold">
              {pred.predictedWinner}
            </Badge>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</span>
            <span className={`text-sm font-black uppercase italic ${
              isWon ? 'text-green-600' : 
              isPending ? 'text-blue-600' : 'text-red-600'
            }`}>
              {isPending ? "Pending" : isWon ? "Won" : "Lost"}
            </span>
          </div>

          <div className="flex flex-col items-center min-w-[100px] bg-muted/50 p-2 rounded-xl relative">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Points</span>
            <span className="text-xl font-black text-primary">
              {isPending ? "---" : isWon ? `+${(pred.points || 100) * (pred.aiBonus ? 2 : 1)}` : "+0"}
            </span>
            {pred.aiBonus && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-primary text-[8px] font-black h-4 px-1">
                AI BONUS x2
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
