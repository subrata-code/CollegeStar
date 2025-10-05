import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BadgeCheck, Coffee, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type DonateDialogProps = {
  user: User | null;
  defaultOpen?: boolean;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost" | "accent" | "hero";
};

export function DonateDialog({ user, defaultOpen = false, triggerVariant = "secondary" }: DonateDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(defaultOpen);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const amounts = useMemo(() => [20, 50, 70, 100, 200, 500], []);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const isDonor = Boolean(
    (user as any)?.user_metadata?.donorVerified || localStorage.getItem("donorVerified") === "true"
  );

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: "namitabag@naviaxis", // payee VPA
      pn: "CollegeStar", // payee name
      am: String(selectedAmount), // amount
      cu: "INR", // currency
      tn: "Support CollegeStar – Buy us a coffee",
    });
    return `upi://pay?${params.toString()}`;
  }, [selectedAmount]);

  const proceedToPay = () => {
    try {
      // Best effort: open UPI app via intent URL; fallback opens in same tab
      window.location.href = upiUrl;
    } catch (e) {
      window.open(upiUrl, "_blank");
    }
  };

  const markAsPaid = async () => {
    try {
      if (user) {
        await supabase.auth.updateUser({
          data: {
            donorVerified: true,
            donorAmount: selectedAmount,
            donorAt: new Date().toISOString(),
          },
        });
      }
      localStorage.setItem("donorVerified", "true");
      toast({ title: "Thank you!", description: "Your support means a lot. Perks unlocked." });
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Could not update status", description: error?.message || "Please try again." });
    }
  };

  const dismissForNow = () => {
    localStorage.setItem("donatePromptDismissed", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2">
          <Coffee className="w-4 h-4" />
          Buy Us Coffee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDonor ? <BadgeCheck className="w-5 h-5 text-primary" /> : <Coffee className="w-5 h-5 text-primary" />}
            {isDonor ? "You're a Star Supporter" : "Support CollegeStar"}
          </DialogTitle>
          <DialogDescription>
            {isDonor
              ? "Thanks for your support! You’ve unlocked perks like a blue tick and boosted visibility."
              : "Choose an amount and proceed to pay via your UPI app. Your support helps us grow."}
          </DialogDescription>
        </DialogHeader>

        {!isDonor && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((amt) => (
                <Button
                  key={amt}
                  variant={selectedAmount === amt ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setSelectedAmount(amt)}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={proceedToPay} className="w-full gap-2">
                Proceed to Pay
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="secondary" onClick={markAsPaid} className="w-full">
                I've completed payment
              </Button>
            </div>
            <Button variant="ghost" onClick={dismissForNow} className="w-full">
              Maybe later
            </Button>
          </div>
        )}

        {isDonor && (
          <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
            Your profile will show a blue tick, and your notes will get prioritized placement.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


