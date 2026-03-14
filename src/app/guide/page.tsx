"use client";

import { Trophy, Target, ShieldCheck, Zap, ArrowLeft, Mail, UserCircle, BrainCircuit, Clock, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Version 1.0</Badge>
            </div>

            <div className="space-y-4 mb-12">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl text-primary">App User Guide</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Learn how to register, predict matches, and climb the global leaderboard using AI-powered insights.
              </p>
            </div>

            <div className="grid gap-8">
              {/* Registration */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-accent" />
                    1. Registration & Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Pro Predictor (Recommended)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email address on the landing page. We'll send you a <strong>Magic Link</strong>. Click the link in your inbox to be signed in instantly. No passwords required!
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        Universal Guest
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Want to try it out first? Click <strong>"Continue as Universal Guest"</strong> to join a shared community account. Note that your predictions will be shared with all other guest users.
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
                      Navigate to the <strong>Matches</strong> tab to see all live and upcoming games. You can pick a winner directly from the match card or click the match name for deep analysis.
                    </p>
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium text-primary shadow-sm">
                      <Clock className="h-5 w-5 text-accent shrink-0" />
                      <p><strong>Crucial Rule:</strong> All predictions lock exactly <strong>60 minutes before</strong> the scheduled match start time. Once locked, they cannot be changed.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Forecasting */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <BrainCircuit className="h-6 w-6 text-accent" />
                    3. Gemini AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                      <p className="text-muted-foreground">
                        Not sure who to pick? On any individual match page, use the <strong>"Run AI Forecast"</strong> tool. 
                      </p>
                      <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                        <li>Uses Google Gemini to analyze team rosters and conditions.</li>
                        <li>Provides probabilistic winning percentages for both teams.</li>
                        <li>Gives a detailed rationale based on historical data.</li>
                      </ul>
                    </div>
                    <div className="w-full md:w-64 bg-muted/50 p-4 rounded-2xl border border-primary/5 text-center">
                      <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-bold text-primary uppercase">Expert Tip</p>
                      <p className="text-[10px] text-muted-foreground mt-1">AI analysis is most effective once team line-ups are announced!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scoring */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary text-white p-6">
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-accent" />
                    4. Points & Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <span className="text-2xl font-black text-primary">2 PTS</span>
                      <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Group Stage Matches</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20">
                      <span className="text-2xl font-black text-primary">3 PTS</span>
                      <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Super 8, Semis & Finals</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    The Global Leaderboard ranks predictors by Total Points first, using Prediction Accuracy percentage as the primary tie-breaker.
                  </p>
                </CardContent>
              </Card>

              <div className="text-center pt-8">
                <Button size="lg" asChild className="rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20">
                  <Link href="/#auth">Ready? Join Now</Link>
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
            © 2024 Cricket Blockbuster Inc. All rights reserved. Data powered by CricAPI.
          </p>
          <div className="flex gap-4">
            <Link className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline" href="#">
              Terms
            </Link>
            <Link className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline" href="#">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {children}
    </div>
  );
}
