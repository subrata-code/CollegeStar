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
import { BadgeCheck, Coffee, ExternalLink, Smartphone, Monitor, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useAuth } from "@/contexts/AuthContext";

type DonateDialogProps = {
  defaultOpen?: boolean;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost" | "accent" | "hero";
};

export function DonateDialog({ defaultOpen = false, triggerVariant = "secondary" }: DonateDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(defaultOpen);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const amounts = useMemo(() => [20, 50, 70, 100, 200, 500], []);
  const { status, start, stop } = usePaymentVerification({ timeoutMs: 20000, intervalMs: 2000 });

  // Detect if user is on mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  }, []);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  // React to verification status changes
  useEffect(() => {
    if (status === "verified") {
      // Persist donor perks and close
      (async () => {
        try {
          if (user) {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/profiles/${user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                donorVerified: true,
                donorAmount: selectedAmount,
                donorAt: new Date().toISOString(),
              }),
            });
          }
          localStorage.setItem("donorVerified", "true");
          toast({ title: "Thank you!", description: "Payment verified. Perks unlocked." });
          setOpen(false);
        } catch (error: unknown) {
          toast({ title: "Could not update status", description: (error as Error)?.message || "Please try again." });
        }
      })();
    }

    if (status === "timeout") {
      // Professional notice then fallback in 5s
      toast({
        title: "Payment not verified yet",
        description: "We couldn't confirm your transaction. Please complete the payment using UPI app or QR code.",
        variant: "destructive",
        duration: 5000,
      });
      window.setTimeout(() => {
        if (isMobile) {
          // Re-open UPI app
          try {
            window.location.href = upiUrl;
          } catch {
            window.open(upiUrl, "_blank");
          }
        } else {
          // Ensure QR code is shown
          if (!qrCodeDataUrl) {
            generateQRCode();
          }
        }
      }, 5000);
    }
  }, [status]);

  const isDonor = Boolean(localStorage.getItem("donorVerified") === "true");

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

  // Generate QR code for desktop users
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const proceedToPay = () => {
    if (isMobile) {
      try {
        // Best effort: open UPI app via intent URL; fallback opens in same tab
        window.location.href = upiUrl;
      } catch (e) {
        window.open(upiUrl, "_blank");
      }
    } else {
      // For desktop users, generate QR code
      generateQRCode();
    }
    // Start verification polling after initiating payment
    start();
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

            {/* Device-specific payment UI */}
            {isMobile ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={proceedToPay} className="w-full gap-2">
                  <Smartphone className="w-4 h-4" />
                  Open UPI App
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {status === "pending" && (
                  <div className="w-full text-center text-sm text-muted-foreground py-2 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Waiting for payment confirmation…
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {!qrCodeDataUrl ? (
                  <Button 
                    onClick={proceedToPay} 
                    className="w-full gap-2"
                    disabled={isGeneratingQR}
                  >
                    <Monitor className="w-4 h-4" />
                    {isGeneratingQR ? "Generating QR Code..." : "Generate QR Code"}
                  </Button>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Monitor className="w-4 h-4" />
                      Scan with your UPI app
                    </div>
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="UPI Payment QR Code" 
                        className="border rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Amount: ₹{selectedAmount} | UPI ID: namitabag@naviaxis
                    </div>
                  </div>
                )}
                {status === "pending" && (
                  <div className="w-full text-center text-sm text-muted-foreground py-2 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Waiting for payment confirmation…
                  </div>
                )}
              </div>
            )}

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



