
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Target, ShieldCheck, Zap, ArrowRight, Mail, Loader2, CheckCircle2, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signInAnonymously
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [finishingSignIn, setFinishingSignIn] = useState(false);

  // Handle email link redirect
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }

      if (emailForSignIn) {
        setFinishingSignIn(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);
            
            // Always ensure the profile has the required leaderboard fields
            if (!userSnap.exists()) {
              setDocumentNonBlocking(userRef, {
                id: result.user.uid,
                email: emailForSignIn,
                username: emailForSignIn!.split("@")[0],
                totalPoints: 0,
                accuracy: 0,
              }, { merge: true });
            }
            
            router.push("/dashboard");
          })
          .catch((error) => {
            console.error("Link Sign-In Error:", error);
            toast({
              title: "Sign-in Failed",
              description: "The link may be expired or invalid. Please request a new one.",
              variant: "destructive",
            });
            setFinishingSignIn(false);
          });
      }
    }
  }, [auth, db, router, toast]);

  // Redirect if already logged in and NOT finishing a link sign-in
  useEffect(() => {
    if (user && !isUserLoading && !finishingSignIn) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router, finishingSignIn]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setLinkSent(true);
      toast({
        title: "Link Sent!",
        description: "Check your inbox for your secure login link.",
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Could not send login link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    try {
      // Still sign in anonymously to satisfy Firebase rules for a valid UID session
      await signInAnonymously(auth);
      
      // Initialize the shared 'universal-guest' profile if it doesn't exist
      const universalGuestRef = doc(db, "users", "universal-guest");
      const guestSnap = await getDoc(universalGuestRef);
      if (!guestSnap.exists()) {
        setDocumentNonBlocking(universalGuestRef, {
          id: "universal-guest",
          username: "The Universal Guest",
          totalPoints: 0,
          accuracy: 0,
          isSharedGuest: true,
        }, { merge: true });
      }

      toast({
        title: "Welcome to the Oracle!",
        description: "You're now predicting as part of the Universal Guest community.",
      });
    } catch (error: any) {
      toast({
        title: "Guest Entry Failed",
        description: error.message || "Could not sign in anonymously.",
        variant: "destructive",
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  if (isUserLoading || finishingSignIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Zap className="h-12 w-12 text-primary animate-pulse" />
        {finishingSignIn && <p className="text-sm font-medium text-muted-foreground">Verifying your secure link...</p>}
      </div>
    );
  }

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
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/features">
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
              src="https://images.unsplash.com/photo-1730739463889-34c7279277a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
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
                    Elevate your cricket experience. Use passwordless, secure email login or join the shared guest community to climb the leaderboard.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#auth">
                    <Button size="lg" className="px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      Start Predicting Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Auth Card */}
              <div id="auth" className="mx-auto w-full max-w-sm lg:max-w-none">
                <Card className="shadow-2xl border-primary/10 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl font-headline font-bold">
                      {linkSent ? "Check Your Inbox" : "Join the Oracle"}
                    </CardTitle>
                    <CardDescription>
                      {linkSent 
                        ? "We've sent a magic login link to your email." 
                        : "Sign in with a secure link or explore as a guest."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-8">
                    {!linkSent ? (
                      <div className="space-y-4">
                        <form onSubmit={handleSendLink} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="your@email.com" 
                              required 
                              className="h-12 border-primary/20"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading || isGuestLoading}
                            />
                          </div>
                          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading || isGuestLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" /> Get Login Link
                              </>
                            )}
                          </Button>
                        </form>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-semibold">Or</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full h-12 border-primary/20 hover:bg-primary/5 font-bold" 
                          onClick={handleGuestSignIn}
                          disabled={isLoading || isGuestLoading}
                        >
                          {isGuestLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <UserCircle className="mr-2 h-5 w-5" />
                          )}
                          Continue as Universal Guest
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center py-6 space-y-4">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-lg">Verification Link Sent</p>
                          <p className="text-sm text-muted-foreground">
                            Click the link in the email we just sent to <span className="font-medium text-primary">{email}</span> to finish signing in.
                          </p>
                        </div>
                        <Button variant="ghost" className="text-xs text-muted-foreground underline" onClick={() => setLinkSent(false)}>
                          Entered the wrong email?
                        </Button>
                      </div>
                    )}
                    <div className="relative mt-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Secure Auth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
