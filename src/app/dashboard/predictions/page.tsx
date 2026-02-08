
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, XCircle, Clock, ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PREDICTIONS = [
  { id: 1, match: "IND vs AUS - 1st T20", predicted: "India", outcome: "won", points: 100, date: "Nov 22, 2024" },
  { id: 2, match: "ENG vs PAK - Final", predicted: "England", outcome: "won", points: 200, date: "Nov 15, 2024", aiBonus: true },
  { id: 3, match: "RSA vs IND - 4th ODI", predicted: "India", outcome: "lost", points: 0, date: "Nov 10, 2024" },
  { id: 4, match: "NZ vs SL - 2nd Test", predicted: "New Zealand", outcome: "pending", points: null, date: "Coming Soon" },
];

export default function MyPredictions() {
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
            <span className="text-2xl font-black">1,340</span>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/50 uppercase">Win Rate</span>
            <span className="text-2xl font-black">74%</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {PREDICTIONS.map((pred) => (
          <PredictionRow key={pred.id} pred={pred} />
        ))}
      </div>
    </div>
  );
}

function PredictionRow({ pred }: { pred: any }) {
  const isWon = pred.outcome === "won";
  const isPending = pred.outcome === "pending";

  return (
    <Card className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md bg-white">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isWon ? 'bg-green-100 text-green-600' : 
            isPending ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {isWon && <CheckCircle2 className="h-6 w-6" />}
            {isPending && <Clock className="h-6 w-6" />}
            {!isWon && !isPending && <XCircle className="h-6 w-6" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{pred.match}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="h-3 w-3" /> {pred.date}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Predicted</span>
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold">
              {pred.predicted}
            </Badge>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</span>
            <span className={`text-sm font-black uppercase italic ${
              isWon ? 'text-green-600' : 
              isPending ? 'text-blue-600' : 'text-red-600'
            }`}>
              {pred.outcome}
            </span>
          </div>

          <div className="flex flex-col items-center min-w-[100px] bg-muted/50 p-2 rounded-xl relative">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Points</span>
            <span className="text-xl font-black text-primary">
              {isPending ? "---" : `+${pred.points}`}
            </span>
            {pred.aiBonus && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-primary text-[8px] font-black h-4 px-1">
                AI BONUS x2
              </Badge>
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 hidden md:flex">
             <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
