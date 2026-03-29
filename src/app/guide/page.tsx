
"use client";

import { Trophy, Target, ShieldCheck, Zap, ArrowLeft, Mail, UserCircle, BrainCircuit, Clock, Info, CheckCircle2, User, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function UserGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="relative h-8 w-12 overflow-hidden rounded-md bg-accent">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/4/46/Blockbuster_logo.svg" 
              alt="Blockbuster Logo" 
              fill 
              className="object-contain p-1"
            />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight text-primary">Cricket Blockbuster</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/guide">
            User Guide
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/features">
            Features
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 bg-muted/30 min-h-[calc(100vh-64px)]">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" asChild className="rounded-full hover:bg-primary/5">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>
              </Button>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Version 1.5</Badge>
            </div>

            <div className="space-y-4 mb-12 text-center md:text-left">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl text-primary">App User Guide</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Learn how to register, predict matches, and contribute to the community score using AI insights.
              </p>
            </div>

            <div className="grid gap-8">
              {/* Profile Types */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <UserCircle className="h-6 w-6 text-accent" />
                    1. Account Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-muted/50 rounded-2xl border border-primary/5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          Pro Profile
                        </h3>
                        <Badge className="bg-primary text-white text-[9px]">RECOMMENDED</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sign in via Email to secure your individual rank permanently. You can customize your avatar and display name in settings.
                      </p>
                    </div>
                    <div className="space-y-3 p-4 bg-accent/5 rounded-2xl border border-accent/20">
                      <h3 className="font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Universal Guest
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        One-click access. All guest users contribute to a single <strong>shared identity</strong> on the leaderboard. Your own picks remain private to your session.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predicting */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-accent" />
                    2. Making Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Navigate to <strong>Matches</strong> to see all live and upcoming games. Tap a team on any match card to lock your prediction.
                    </p>
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium text-primary shadow-sm">
                      <Clock className="h-5 w-5 text-accent shrink-0" />
                      <p><strong>Lock Rule:</strong> Predictions lock exactly <strong>60 minutes</strong> before the scheduled match start time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Forecasting */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <BrainCircuit className="h-6 w-6 text-accent" />
                    3. AI Analyst
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <p className="text-muted-foreground">
                    Stuck? Use the <strong>"Run AI Forecast"</strong> tool on any match details page. Powered by Google Gemini, it analyzes conditions and rosters to provide winning probabilities and expert rationale.
                  </p>
                </CardContent>
              </Card>

              {/* Scoring */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-accent" />
                    4. Scoring Logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="font-bold">Standard Match</span>
                      <span className="font-black text-primary">2 PTS</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border border-accent/20">
                      <div className="flex flex-col">
                        <span className="font-bold">High Value Matches</span>
                        <span className="text-[10px] text-muted-foreground">Eliminators, Qualifiers & Final</span>
                      </div>
                      <span className="font-black text-primary">3 PTS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center pt-8">
                <Button size="lg" asChild className="rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20">
                  <Link href="/#auth">Start Predicting Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-12">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-10 overflow-hidden rounded-md bg-accent">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/4/46/Blockbuster_logo.svg" 
                alt="Blockbuster Logo" 
                fill 
                className="object-contain p-0.5"
              />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-primary">Cricket Blockbuster</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Cricket Blockbuster Inc. Data powered by CricAPI.
          </p>
        </div>
      </footer>
    </div>
  );
}
