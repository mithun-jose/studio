
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, ShieldAlert, CheckCircle2, Loader2, Camera, Mail, User, Trash2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const effectiveUserId = user?.isAnonymous ? "universal-guest" : user?.uid;
  const isAnonymous = user?.isAnonymous;

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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (isAnonymous) {
      toast({
        title: "Action Restricted",
        description: "Anonymous users cannot modify the Universal Guest profile settings.",
        variant: "destructive",
      });
      return;
    }

    if (!userDocRef) return;

    setIsSaving(true);
    updateDocumentNonBlocking(userDocRef, {
      username: formData.username,
      email: formData.email,
      avatarUrl: formData.avatarUrl,
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved to the Blockbuster.",
      });
    }, 500);
  };

  const handleDeleteAccount = async () => {
    if (isAnonymous || !userDocRef) return;

    setIsDeleting(true);
    try {
      // 1. Delete the Firestore document
      deleteDocumentNonBlocking(userDocRef);
      
      // 2. Sign out the user
      await signOut(auth);
      
      toast({
        title: "Account Deleted",
        description: "Your profile has been removed from Cricket Blockbuster.",
      });
      
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete account.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
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

      {isAnonymous && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium text-destructive shadow-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p>You are using the <span className="font-bold">Universal Guest</span> account. Some settings are restricted for non-registered users.</p>
        </div>
      )}

      <div className="grid gap-8">
        <Card className="border-primary/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-accent" />
              Public Profile
            </CardTitle>
            <CardDescription>This information will be visible to other predictors on the leaderboard.</CardDescription>
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
                  disabled={isAnonymous || isSaving}
                  className="bg-muted/30 border-none h-11"
                />
                <p className="text-[10px] text-muted-foreground">Recommended: Square image URL (Unsplash, Picsum, etc.)</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Display Name
                </Label>
                <Input
                  id="username"
                  placeholder="Predictor123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isAnonymous || isSaving}
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
                  placeholder="fan@cricket.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isAnonymous || isSaving}
                  className="bg-muted/30 border-none h-11 font-medium"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/5 py-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground italic">
              {isAnonymous ? "Limited customization for guests" : "Changes are reflected instantly across the platform"}
            </p>
            <Button 
              onClick={handleSave} 
              disabled={isAnonymous || isSaving}
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

        {!isAnonymous && (
          <Card className="border-destructive/10 shadow-lg bg-destructive/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/70">
                Permanently remove your data from the blockbuster leaderboard and history.
              </CardDescription>
            </CardHeader>
            <CardFooter className="bg-destructive/10 py-4 flex justify-between items-center border-t border-destructive/10">
              <div className="flex items-center gap-2 text-xs text-destructive font-medium">
                <AlertTriangle className="h-4 w-4" />
                This action is irreversible.
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-xl font-bold">
                    Delete My Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-destructive">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      This will permanently delete your predictor profile, your points history, and all your recorded match predictions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 gap-3">
                    <AlertDialogCancel className="rounded-xl border-muted-foreground/20">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Yes, Delete Everything"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
