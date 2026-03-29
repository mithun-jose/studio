
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, CheckCircle2, Loader2, Camera, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const effectiveUserId = user?.uid;

  const userDocRef = useMemoFirebase(() => {
    if (!db || !effectiveUserId) return null;
    return doc(db, "users", effectiveUserId);
  }, [db, effectiveUserId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatarUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize form data only when profile is definitively loaded and not currently saving
  useEffect(() => {
    if (profile && !isSaving) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile, isSaving]);

  const handleSave = () => {
    if (!userDocRef) return;

    setIsSaving(true);
    
    // Explicitly merge to ensure only edited fields are updated without clearing history
    setDocumentNonBlocking(userDocRef, {
      username: formData.username,
      email: formData.email,
      avatarUrl: formData.avatarUrl,
    }, { merge: true });

    // Provide feedback and reset state
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  if (isUserLoading || (isProfileLoading && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline font-bold text-primary">Account Settings</h1>
        <p className="text-muted-foreground">Manage your public presence and account information</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-primary/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-accent" />
              Public Profile
            </CardTitle>
            <CardDescription>This information is visible to other predictors on the leaderboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-primary/5">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                <AvatarImage src={formData.avatarUrl || `https://picsum.photos/seed/${effectiveUserId}/200/200`} />
                <AvatarFallback className="bg-primary/5 text-primary text-3xl">
                  {formData.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Profile Picture URL
                </Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  disabled={isSaving}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Display Name
                </Label>
                <Input
                  id="username"
                  placeholder="Predictor Name"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isSaving}
                  className="bg-muted/30 border-none h-11 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Contact Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSaving}
                  className="bg-muted/30 border-none h-11 font-medium"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/5 py-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground italic">
              Settings persist across all your sessions
            </p>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="rounded-xl px-8 font-bold shadow-lg shadow-primary/10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
