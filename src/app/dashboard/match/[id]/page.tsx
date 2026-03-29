"use client";

import { useEffect, useState, use } from "react";
import { fetchMatchDetails, Match, getWinnerFromStatus, getMatchPointValue } from "@/lib/api";
import { generateWinningPercentage, GenerateWinningPercentageOutput } from "@/ai/flows/generate-winning-percentage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BrainCircuit, Trophy, Target, ShieldCheck, Zap, Info, Loader2, CheckCircle2 } from "lucide-react";
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

  const effectiveUserId = user?.uid;

  const predictionRef = useMemoFirebase(() => {
    if (!db || !effectiveUserId || !id) return null;
    return doc(db, "users", effectiveUserId, "predictions", `${effectiveUserId}_${id}`);
  }, [db, effectiveUserId, id]);

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
        matchConditions: `Venue: ${match.venue}. Type: ${match.matchType}.`,
        playerStatistics: "Teams are competing in the tournament series.",
      });
      setAiForecast(result);
    } catch (error: any) {
      toast({
        title: "AI Analysis Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const isEnded = match?.matchEnded;
  const isStarted = match?.matchStarted;
  const matchStartTime = match ? new Date(match.dateTimeGMT.endsWith('Z') ? match.dateTimeGMT : `${match.dateTimeGMT.replace(' ', 'T')}Z`).getTime() : 0;
  const now = new Date().getTime();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isPredictionsClosed = now > (matchStartTime - ONE_HOUR_MS) || isStarted;
  const pointValue = 2; // Reverted back to constant 2

  const handlePredict = () => {
    if (!prediction) {
      toast({ title: "Please select a team", variant: "destructive" });
      return;
    }

    if (isPredictionsClosed) {
      toast({ title: "Prediction Closed", variant: "destructive" });
      return;
    }

    const predictionId = `${effectiveUserId}_${match?.id}`;
    const predictionRef = doc(db, "users", effectiveUserId, "predictions", predictionId);

    setDocumentNonBlocking(predictionRef, {
      id: predictionId,
      userId: effectiveUserId,
      matchId: match?.id,
      matchName: match?.name,
      predictedWinner: prediction,
      predictionTime: new Date().toISOString(),
      isCorrect: null,
      points: pointValue,
    }, { merge: true });

    toast({ title: "Prediction Submitted!" });
  };

  if (loading || isPredictionLoading) return <Skeleton className="h-64 w-full" />;
  if (!match) return <div className="text-center py-20">Match not found</div>;

  const teamNames = match.teamInfo?.map(t => t.name) || match.teams || [];
  const winner = isEnded ? getWinnerFromStatus(match.status, teamNames) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
        </Button>
      </div>

      <Card className="bg-primary text-white overflow-hidden">
        <CardContent className="pt-8 pb-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-12 w-full mb-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold">{match.teamInfo?.[0]?.shortname}</span>
            </div>
            <div className="text-4xl font-black italic opacity-30">VS</div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold">{match.teamInfo?.[1]?.shortname}</span>
            </div>
          </div>
          <h1 className="text-xl font-bold">{match.name}</h1>
          <p className="text-sm opacity-70">{match.venue}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={prediction} onValueChange={setPrediction} disabled={isPredictionsClosed}>
              {match.teamInfo?.map((team) => (
                <div key={team.name} className="flex items-center space-x-2 p-4 border rounded-xl mb-2">
                  <RadioGroupItem value={team.name} id={team.name} />
                  <Label htmlFor={team.name} className="flex-1 font-bold">{team.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          {!isPredictionsClosed && (
            <CardFooter>
              <Button onClick={handlePredict} className="w-full">Lock Prediction</Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> AI Analyst
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!aiForecast ? (
              <Button onClick={handleAiForecast} disabled={isAiLoading || isEnded} className="w-full">
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Forecast"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between font-black text-xl">
                  <span>{aiForecast.team1WinPercentage}%</span>
                  <span>{aiForecast.team2WinPercentage}%</span>
                </div>
                <p className="text-sm italic">"{aiForecast.rationale}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
