
"use client";

import { Trophy, Target, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <Trophy className="h-6 w-6 text-accent" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight text-primary">Cricket Oracle</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-primary transition-colors" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#about">
            About
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 bg-muted/30 min-h-[calc(100vh-64px)]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mb-8">
              <Button variant="ghost" asChild className="rounded-full hover:bg-primary/5">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-6xl text-primary">Master the Prediction Game</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl lg:text-lg leading-relaxed">
                Cricket Oracle provides you with professional tools to dominate your friend groups and leagues.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-3xl shadow-sm border border-primary/5 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-center">Precise Odds</h3>
                <p className="text-center text-muted-foreground text-sm">Real-time match data fetched from official cricket feeds for the most accurate schedules.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-3xl shadow-sm border border-primary/5 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="p-4 bg-accent/20 rounded-2xl">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-center">AI Forecasting</h3>
                <p className="text-center text-muted-foreground text-sm">Leverage Gemini-powered AI to analyze player stats and match conditions for winning insights.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-3xl shadow-sm border border-primary/5 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-center">Trusted Rankings</h3>
                <p className="text-center text-muted-foreground text-sm">Transparent scoring system that ranks players based on prediction accuracy and consistency.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-3xl shadow-sm border border-primary/5 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="p-4 bg-accent/20 rounded-2xl">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-center">Seasonal Prizes</h3>
                <p className="text-center text-muted-foreground text-sm">Win exclusive badges and top the annual leaderboard to be crowned the ultimate Cricket Oracle.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-12">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold text-xl tracking-tight text-primary">Cricket Oracle</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Cricket Oracle Inc. All rights reserved. Data powered by CricAPI.
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
