
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, ShieldCheck, Zap, ArrowRight, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

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
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#about">
            About
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/cricket-oracle/1920/1080"
              alt="Cricket Stadium"
              fill
              className="object-cover opacity-10"
              priority
              data-ai-hint="cricket stadium"
            />
          </div>
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-accent/20 px-3 py-1 text-sm font-semibold text-primary border border-accent/30 animate-pulse">
                    Join 10,000+ Fans Predicting Daily
                  </div>
                  <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Predict the Game. <br />
                    <span className="text-primary">Conquer the League.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed">
                    Elevate your cricket experience. Use AI-driven insights to predict match outcomes, climb the leaderboard, and prove your sporting wisdom.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#auth">
                    <Button size="lg" className="px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      Start Predicting Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-muted">
                        <Image src={`https://picsum.photos/seed/user${i}/32/32`} width={32} height={32} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span>Trusted by fans from around the world</span>
                </div>
              </div>

              {/* Auth Card */}
              <div id="auth" className="mx-auto w-full max-w-sm lg:max-w-none">
                <Card className="shadow-2xl border-primary/10 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none h-14">
                      <TabsTrigger value="login" className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">Log In</TabsTrigger>
                      <TabsTrigger value="signup" className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">Sign Up</TabsTrigger>
                    </TabsList>
                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-2xl font-headline font-bold">Welcome Back</CardTitle>
                      <CardDescription>Enter your credentials to access the Oracle</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-8">
                      <TabsContent value="login">
                        <form onSubmit={handleAuth} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required className="h-12 border-primary/20" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required className="h-12 border-primary/20" />
                          </div>
                          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Login"}
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="signup">
                        <form onSubmit={handleAuth} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Display Name</Label>
                            <Input id="signup-name" placeholder="CricketMaster" required className="h-12 border-primary/20" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input id="signup-email" type="email" placeholder="m@example.com" required className="h-12 border-primary/20" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <Input id="signup-password" type="password" required className="h-12 border-primary/20" />
                          </div>
                          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                          </Button>
                        </form>
                      </TabsContent>
                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button variant="outline" className="h-12 border-primary/20 font-semibold" type="button">
                          Google
                        </Button>
                        <Button variant="outline" className="h-12 border-primary/20 font-semibold" type="button">
                          Apple
                        </Button>
                      </div>
                    </CardContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl text-primary">Master the Prediction Game</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl lg:text-lg leading-relaxed">
                Cricket Oracle provides you with professional tools to dominate your friend groups and leagues.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-primary/5 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold text-center">Precise Odds</h3>
                <p className="text-center text-muted-foreground text-sm">Real-time match data fetched from official cricket feeds for the most accurate schedules.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-primary/5 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="p-3 bg-accent/20 rounded-xl">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold text-center">AI Forecasting</h3>
                <p className="text-center text-muted-foreground text-sm">Leverage Gemini-powered AI to analyze player stats and match conditions for winning insights.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-primary/5 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold text-center">Trusted Rankings</h3>
                <p className="text-center text-muted-foreground text-sm">Transparent scoring system that ranks players based on prediction accuracy and consistency.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-primary/5 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="p-3 bg-accent/20 rounded-xl">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold text-center">Seasonal Prizes</h3>
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
