
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Loader2, Users, Target } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function Leaderboard() {
  const db = useFirestore();

  // Query to show top performers, including those with 0 points
  const leaderboardQuery = useMemoFirebase(() => {
    return query(
      collection(db, "users"),
      orderBy("totalPoints", "desc"),
      limit(50)
    );
  }, [db]);

  const { data: users, isLoading } = useCollection(leaderboardQuery);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback to empty array if no users found yet
  const rankings = users || [];
  const totalPredictors = rankings.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Hall of Fame</h1>
          <p className="text-muted-foreground">Top predictors across the Cricket Oracle community</p>
        </div>
        
        <Card className="bg-white border-primary/10 shadow-sm px-4 py-2 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Predictors</span>
            <span className="text-lg font-black text-primary">
              {totalPredictors}{totalPredictors >= 50 ? '+' : ''}
            </span>
          </div>
        </Card>
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
          <Users className="h-12 w-12 text-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No predictors found. Sign in to be the first on the board!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankings.slice(0, 3).map((user, idx) => (
              <TopPerformerCard key={user.id} user={user} rank={idx + 1} />
            ))}
          </div>

          <Card className="border-primary/5 shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/5">
              <CardTitle className="text-xl font-bold text-primary">Season Rankings</CardTitle>
              <CardDescription>Global leaderboard updated in real-time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary/5">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Predictor</th>
                      <th className="px-6 py-4">Accuracy</th>
                      <th className="px-6 py-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((user, idx) => (
                      <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-headline font-black text-lg text-muted-foreground/30 group-hover:text-primary transition-colors">#{idx + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/10">
                              <AvatarImage src={`https://picsum.photos/seed/${user.id}/64/64`} />
                              <AvatarFallback>{user.username?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-sm">{user.username || 'Anonymous Fan'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-primary/20 text-[10px] font-bold">
                            {user.accuracy ?? 0}% Acc
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-primary">{(user.totalPoints ?? 0).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function TopPerformerCard({ user, rank }: { user: any, rank: number }) {
  const isWinner = rank === 1;
  return (
    <Card className={`relative overflow-hidden border-2 transition-all hover:-translate-y-2 hover:shadow-2xl ${isWinner ? 'border-accent bg-accent/5' : 'border-primary/5'}`}>
      <div className={`absolute top-0 right-0 p-4 ${isWinner ? 'text-accent' : 'text-primary/10'}`}>
        <Medal className="h-12 w-12" />
      </div>
      <CardContent className="pt-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className={`h-20 w-20 border-4 ${isWinner ? 'border-accent shadow-lg shadow-accent/20' : 'border-primary/10'}`}>
            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
            <AvatarFallback>{user.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${isWinner ? 'bg-accent text-primary' : 'bg-primary text-white'}`}>
            {rank}
          </div>
        </div>
        <h3 className="text-xl font-headline font-bold text-primary mb-1 truncate max-w-full px-2">{user.username || 'Anonymous Fan'}</h3>
        <p className="text-xs font-medium text-muted-foreground mb-4">ORACLE ELITE</p>
        <div className="grid grid-cols-2 gap-4 w-full bg-white/50 backdrop-blur-md p-3 rounded-2xl border border-primary/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Points</span>
            <span className="text-lg font-black text-primary">{(user.totalPoints ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Accuracy</span>
            <span className="text-lg font-black text-accent-foreground">{user.accuracy ?? 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
