
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from "lucide-react";

const LEADERBOARD_DATA = [
  { id: 1, name: "Arjun Singh", points: 2450, accuracy: "88%", trend: "up", rank: 1, avatar: "https://picsum.photos/seed/user1/64/64" },
  { id: 2, name: "Sarah Khan", points: 2310, accuracy: "84%", trend: "up", rank: 2, avatar: "https://picsum.photos/seed/user2/64/64" },
  { id: 3, name: "David Warner", points: 2100, accuracy: "79%", trend: "down", rank: 3, avatar: "https://picsum.photos/seed/user3/64/64" },
  { id: 4, name: "Priya Patel", points: 1980, accuracy: "76%", trend: "minus", rank: 4, avatar: "https://picsum.photos/seed/user4/64/64" },
  { id: 5, name: "Chris Gayle", points: 1850, accuracy: "72%", trend: "up", rank: 5, avatar: "https://picsum.photos/seed/user5/64/64" },
  { id: 6, name: "Steve Smith", points: 1720, accuracy: "70%", trend: "down", rank: 6, avatar: "https://picsum.photos/seed/user6/64/64" },
  { id: 7, name: "Kane Williams", points: 1650, accuracy: "68%", trend: "up", rank: 7, avatar: "https://picsum.photos/seed/user7/64/64" },
];

export default function Leaderboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline font-bold text-primary">Hall of Fame</h1>
        <p className="text-muted-foreground">Top 10 predictors for the 2024 Cricket Season</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LEADERBOARD_DATA.slice(0, 3).map((user) => (
          <TopPerformerCard key={user.id} user={user} />
        ))}
      </div>

      <Card className="border-primary/5 shadow-xl">
        <CardHeader className="bg-primary/5 border-b border-primary/5">
          <CardTitle className="text-xl font-bold text-primary">Season Rankings</CardTitle>
          <CardDescription>Full leaderboard updated every 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary/5">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Predictor</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD_DATA.map((user) => (
                  <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-headline font-black text-lg text-muted-foreground/30 group-hover:text-primary transition-colors">#{user.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-primary/10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {user.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {user.trend === "minus" && <Minus className="h-4 w-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-primary/20 text-[10px] font-bold">
                        {user.accuracy} Acc
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">{user.points.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TopPerformerCard({ user }: { user: any }) {
  const isWinner = user.rank === 1;
  return (
    <Card className={`relative overflow-hidden border-2 transition-all hover:-translate-y-2 hover:shadow-2xl ${isWinner ? 'border-accent bg-accent/5' : 'border-primary/5'}`}>
      <div className={`absolute top-0 right-0 p-4 ${isWinner ? 'text-accent' : 'text-primary/10'}`}>
        <Medal className="h-12 w-12" />
      </div>
      <CardContent className="pt-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className={`h-20 w-20 border-4 ${isWinner ? 'border-accent shadow-lg shadow-accent/20' : 'border-primary/10'}`}>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${isWinner ? 'bg-accent text-primary' : 'bg-primary text-white'}`}>
            {user.rank}
          </div>
        </div>
        <h3 className="text-xl font-headline font-bold text-primary mb-1">{user.name}</h3>
        <p className="text-xs font-medium text-muted-foreground mb-4">MASTER ORACLE</p>
        <div className="grid grid-cols-2 gap-4 w-full bg-white/50 backdrop-blur-md p-3 rounded-2xl border border-primary/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Points</span>
            <span className="text-lg font-black text-primary">{user.points.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Accuracy</span>
            <span className="text-lg font-black text-accent-foreground">{user.accuracy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
