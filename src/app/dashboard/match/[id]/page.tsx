
"use client";

import { useEffect, useState, use } from "react";
import { fetchMatchDetails, Match } from "@/lib/api";
import { generateWinningPercentage, GenerateWinningPercentageOutput } from "@/ai/flows/generate-winning-percentage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BrainCircuit, Trophy, Target, ShieldCheck, Zap, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useFirestore } from "@/firebase";

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiForecast, setAiForecast] = useState<GenerateWinningPercentageOutput | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const data = await fetchMatchDetails(db, id);
      setMatch(data);
      setLoading(false);
    }
    load();
  }, [db, id]);

  const handleAiForecast = async () => {
    if (!match) return;
    setIsAiLoading(true);
    try {
      const result = await generateWinningPercentage({
        team1Name: match.teamInfo?.[0]?.name || "Team 1",
        team2Name: match.teamInfo?.[1]?.name || "Team 2",
        matchConditions: `Playing at ${match.venue}. Weather is clear. Match Type: ${match.matchType}.`,
        playerStatistics: "Team 1 has higher batting average (28.4), Team 2 has better bowling strike rate (18.2). Recent head-to-head favors Team 1 (3-2).",
      });
      setAiForecast(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not generate forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePredict = () => {
    if (!prediction) {
      toast({ title: "Please select a team", variant: "destructive" });
      return;
    }
    toast({
      title: "Prediction Submitted!",
      description: `You've locked in ${prediction} as the winner. Good luck!`,
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );

  if (!match) return <div className="text-center py-20 font-bold">Match not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="rounded-full hover:bg-primary/5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Matches
          </Link>
        </Button>
        <Badge variant="outline" className="border-accent text-primary font-bold px-3 py-1 bg-accent/5">
          Match Odds Available
        </Badge>
      </div>

      {/* Hero Header */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/90 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="h-32 w-32" />
        </div>
        <CardContent className="pt-8 pb-10 flex flex-col items-center text-center relative z-10">
          <Badge variant="secondary" className="mb-4 bg-accent text-primary font-bold">
            {match.matchType.toUpperCase()} SERIES
          </Badge>
          <div className="flex items-center justify-center gap-4 sm:gap-12 w-full mb-6">
            <TeamHeader team={match.teamInfo?.[0]} />
            <div className="text-4xl font-black italic text-accent/40">VS</div>
            <TeamHeader team={match.teamInfo?.[1]} />
          </div>
          <h1 className="text-2xl font-headline font-bold mb-2">{match.name}</h1>
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <Target className="h-4 w-4" />
            {match.venue}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Prediction Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg border-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Make Your Prediction
              </CardTitle>
              <CardDescription>Select the team you believe will emerge victorious</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <RadioGroup value={prediction} onValueChange={setPrediction} className="space-y-4">
                {match.teamInfo?.map((team) => (
                  <div key={team.id} className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all ${prediction === team.name ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}>
                    <RadioGroupItem value={team.name} id={team.id} className="h-5 w-5 border-primary text-primary" />
                    <Label htmlFor={team.id} className="flex-1 font-bold text-lg cursor-pointer flex items-center justify-between">
                      {team.name}
                      <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded-md">{team.shortname}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handlePredict} className="w-full h-12 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                Lock Prediction
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border-primary/5 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4" /> Match Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                <li>Predictions must be submitted before the match toss.</li>
                <li>Correct winner prediction earns 100 Oracle Points.</li>
                <li>Points are doubled if your prediction matches the AI Forecast!</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* AI Forecast Tool */}
        <div className="space-y-6">
          <Card className="shadow-xl border-primary/10 bg-white overflow-hidden sticky top-24">
            <div className="bg-primary/5 p-4 border-b border-primary/5">
              <h3 className="font-bold flex items-center gap-2 text-primary">
                <BrainCircuit className="h-5 w-5 text-accent" />
                Gemini AI Analyst
              </h3>
            </div>
            <CardContent className="pt-6 space-y-6">
              {!aiForecast ? (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Deep Data Analysis</p>
                    <p className="text-xs text-muted-foreground">Get probabilistic insights based on player stats & historical trends.</p>
                  </div>
                  <Button 
                    onClick={handleAiForecast} 
                    disabled={isAiLoading}
                    className="w-full h-10 rounded-full bg-white text-primary border-primary border hover:bg-primary hover:text-white transition-all font-bold"
                  >
                    {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Run AI Forecast"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{match.teamInfo?.[0]?.shortname}</span>
                      <span>{match.teamInfo?.[1]?.shortname}</span>
                    </div>
                    <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                        style={{ width: `${aiForecast.team1WinPercentage}%` }}
                      />
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out" 
                        style={{ width: `${aiForecast.team2WinPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-black text-2xl">
                      <span className="text-primary">{aiForecast.team1WinPercentage}%</span>
                      <span className="text-accent">{aiForecast.team2WinPercentage}%</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary uppercase">Analyst Rationale</p>
                    <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-xl italic">
                      "{aiForecast.rationale}"
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAiForecast(null)} 
                    className="w-full text-[10px] text-muted-foreground hover:bg-transparent hover:text-primary"
                  >
                    Reset Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TeamHeader({ team }: { team: any }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-20 h-20 bg-white p-3 rounded-3xl shadow-lg border-2 border-primary/20 flex items-center justify-center">
        {team?.img ? (
           <Image src={team.img} alt={team.name} width={56} height={56} className="object-contain" />
        ) : (
          <Target className="h-10 w-10 text-primary/20" />
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-xl font-black">{team?.shortname || "T1"}</div>
        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{team?.name || "Team 1"}</div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px w-full bg-primary/10"></div>;
}
