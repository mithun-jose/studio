
"use client";

import { useEffect, useState, use } from "react";
import { fetchMatchDetails, Match, getWinnerFromStatus } from "@/lib/api";
import { generateWinningPercentage, GenerateWinningPercentageOutput } from "@/ai/flows/generate-winning-percentage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BrainCircuit, Trophy, Target, ShieldCheck, Zap, Info, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiForecast, setAiForecast] = useState<GenerateWinningPercentageOutput | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const { toast } = useToast();

  // Fetch existing prediction if it exists
  const predictionRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, "users", user.uid, "predictions", `${user.uid}_${id}`);
  }, [db, user, id]);

  const { data: existingPrediction, isLoading: isPredictionLoading } = useDoc(predictionRef);

  useEffect(() => {
    if (existingPrediction) {
      setPrediction(existingPrediction.predictedWinner);
    }
  }, [existingPrediction]);

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
        matchConditions: `Playing at ${match.venue}. Match Type: ${match.matchType}.`,
        playerStatistics: "Team 1 and Team 2 are evenly matched in recent head-to-head records.",
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

    if (!user) {
      toast({ title: "Login required", description: "You must be signed in or a guest to make predictions.", variant: "destructive" });
      return;
    }

    if (match?.matchStarted) {
      toast({ title: "Prediction Closed", description: "This match has already started.", variant: "destructive" });
      return;
    }

    const predictionId = `${user.uid}_${match?.id}`;
    const predictionRef = doc(db, "users", user.uid, "predictions", predictionId);

    setDocumentNonBlocking(predictionRef, {
      id: predictionId,
      userId: user.uid,
      matchId: match?.id,
      matchName: match?.name,
      predictedWinner: prediction,
      predictionTime: new Date().toISOString(),
      isCorrect: null, // Pending evaluation
      points: 100,
      aiBonus: !!aiForecast,
    }, { merge: true });

    toast({
      title: existingPrediction ? "Prediction Updated!" : "Prediction Submitted!",
      description: `You've locked in ${prediction} as the winner. Good luck!`,
    });
  };

  if (loading || isPredictionLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );

  if (!match) return <div className="text-center py-20 font-bold">Match not found</div>;

  const isEnded = match.matchEnded;
  const isStarted = match.matchStarted;
  const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
  const winner = isEnded ? getWinnerFromStatus(match.status, teamNames) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="rounded-full hover:bg-primary/5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Matches
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {existingPrediction && (
            <Badge className="bg-green-500/10 text-green-600 border-green-200 gap-1 px-3 py-1 font-bold">
              <CheckCircle2 className="h-3 w-3" /> Predicted
            </Badge>
          )}
          <Badge variant="outline" className={`font-bold px-3 py-1 ${isEnded ? 'border-primary bg-primary/5 text-primary' : 'border-accent bg-accent/5 text-primary'}`}>
            {isEnded ? 'Match Concluded' : isStarted ? 'Predictions Closed' : 'Predictions Open'}
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <Card className={`border-none shadow-xl text-white overflow-hidden relative ${isEnded ? 'bg-primary' : 'bg-gradient-to-br from-primary to-primary/90'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="h-32 w-32" />
        </div>
        <CardContent className="pt-8 pb-10 flex flex-col items-center text-center relative z-10">
          <Badge variant="secondary" className="mb-4 bg-accent text-primary font-bold">
            {match.matchType.toUpperCase()} SERIES
          </Badge>
          <div className="flex items-center justify-center gap-4 sm:gap-12 w-full mb-6">
            <TeamHeader team={match.teamInfo?.[0]} isWinner={winner === match.teamInfo?.[0]?.name} />
            <div className="text-4xl font-black italic text-accent/40">VS</div>
            <TeamHeader team={match.teamInfo?.[1]} isWinner={winner === match.teamInfo?.[1]?.name} />
          </div>
          <h1 className="text-2xl font-headline font-bold mb-2">{match.name}</h1>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Target className="h-4 w-4" />
              {match.venue}
            </div>
            {isEnded && (
              <div className="bg-accent/20 border border-accent/30 p-4 rounded-2xl max-w-md">
                 <p className="text-accent font-black italic text-lg leading-tight uppercase">
                    Result: {match.status}
                 </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Prediction Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className={`shadow-lg border-primary/5 ${isStarted ? 'opacity-75' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5 text-accent" />
                {isEnded ? 'Match Result' : isStarted ? 'Prediction Status' : 'Make Your Prediction'}
              </CardTitle>
              <CardDescription>
                {isEnded ? 'Final winner has been determined' : isStarted ? 'Predictions are no longer accepted for this match' : 'Select the team you believe will emerge victorious'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <RadioGroup value={prediction} onValueChange={setPrediction} disabled={isStarted} className="space-y-4">
                {match.teamInfo?.map((team, idx) => {
                  const isWinningTeam = winner === team.name;
                  const isUserPick = existingPrediction?.predictedWinner === team.name;
                  return (
                    <div key={team.id || team.name || idx} className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all ${
                      prediction === team.name ? 'border-primary bg-primary/5' : 
                      isWinningTeam ? 'border-accent bg-accent/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    }`}>
                      <RadioGroupItem value={team.name} id={team.id || team.name} className="h-5 w-5 border-primary text-primary" />
                      <Label htmlFor={team.id || team.name} className="flex-1 font-bold text-lg cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {team.name}
                          {isWinningTeam && <Trophy className="h-4 w-4 text-accent" />}
                          {isUserPick && !isStarted && <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">Your Pick</Badge>}
                        </div>
                        <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded-md">{team.shortname}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
            {!isStarted && (
              <CardFooter className="pt-2">
                <Button onClick={handlePredict} className="w-full h-12 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                  {existingPrediction ? "Update Prediction" : "Lock Prediction"}
                </Button>
              </CardFooter>
            )}
            {isStarted && (
               <CardFooter className="pt-2 flex flex-col gap-3">
                 {existingPrediction ? (
                   <div className="w-full p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-bold uppercase">You Predicted</span>
                        <span className="text-lg font-black text-primary">{existingPrediction.predictedWinner}</span>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-primary/20" />
                   </div>
                 ) : (
                    <div className="w-full flex items-center justify-center gap-2 text-muted-foreground font-medium p-3 bg-muted/20 rounded-xl">
                      <AlertCircle className="h-5 w-5" />
                      Predictions locked - no prediction made
                    </div>
                 )}
               </CardFooter>
            )}
          </Card>

          <Card className="shadow-lg border-primary/5 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4" /> Match Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                <li>Predictions must be submitted before the match starts.</li>
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
                    disabled={isAiLoading || isEnded}
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
                  <div className="h-px w-full bg-primary/10"></div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary uppercase">Analyst Rationale</p>
                    <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-xl italic">
                      "{aiForecast.rationale}"
                    </p>
                  </div>
                  {!isStarted && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setAiForecast(null)} 
                      className="w-full text-[10px] text-muted-foreground hover:bg-transparent hover:text-primary"
                    >
                      Reset Analysis
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TeamHeader({ team, isWinner }: { team: any, isWinner?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-20 h-20 bg-white p-3 rounded-3xl shadow-lg border-2 flex items-center justify-center relative transition-all ${
        isWinner ? 'border-accent scale-110 shadow-accent/20' : 'border-primary/20'
      }`}>
        {team?.img ? (
           <Image src={team.img} alt={team.name} width={56} height={56} className="object-contain" />
        ) : (
          <Target className="h-10 w-10 text-primary/20" />
        )}
        {isWinner && (
          <div className="absolute -top-3 -right-3 bg-accent p-1.5 rounded-full shadow-lg">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <div className={`text-xl font-black ${isWinner ? 'text-accent' : ''}`}>
          {team?.shortname || "T1"}
        </div>
        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{team?.name || "Team 1"}</div>
      </div>
    </div>
  );
}
