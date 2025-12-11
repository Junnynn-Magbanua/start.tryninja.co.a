import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NinjaLogo } from "@/components/ui/ninja-logo";
import { CheckCircle2, Clock, Brain, Map, Rocket, ZapIcon, CrownIcon, SparklesIcon, MessageSquareIcon, StarIcon, BrainIcon, GiftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface LocationState {
  selectedPlan?: {
    name: string;
    price: number;
  };
  selectedSetupTier?: {
    name: string;
    price: number;
  } | null;
  selectedAddOns?: string[];
  superBoostUpgraded?: boolean;
}

// Add-on details for display
const ADD_ON_DETAILS: Record<string, { name: string; price: number; icon: any }> = {
  "advanced-presence": { name: "Advanced Presence", price: 39, icon: SparklesIcon },
  "google-posting": { name: "Google AI-Posting Pro", price: 79, icon: MessageSquareIcon },
  "power-reviews": { name: "Power Reviews", price: 29, icon: StarIcon },
  "ai-presence": { name: "ChatGPT AI Booster", price: 49, icon: BrainIcon },
};

const ThankYou = () => {
  const location = useLocation();
  const state = location.state as LocationState || {};
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if upgraded via URL param
  const urlParams = new URLSearchParams(window.location.search);
  const upgraded = urlParams.get('upgraded') === 'true';
  const userName = urlParams.get('name') || 'there';

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Build order summary
  const orderItems: { name: string; price: number; isMonthly: boolean; icon: any }[] = [];
  
  // Base plan (always included)
  orderItems.push({
    name: "Professional Plan",
    price: 99,
    isMonthly: true,
    icon: ZapIcon
  });

  // Setup tier if selected
  if (state.selectedSetupTier) {
    orderItems.push({
      name: state.selectedSetupTier.name,
      price: state.selectedSetupTier.price,
      isMonthly: false,
      icon: CrownIcon
    });
  }

  // Add-ons if selected
  if (state.selectedAddOns) {
    state.selectedAddOns.forEach(addOnId => {
      const addOn = ADD_ON_DETAILS[addOnId];
      if (addOn) {
        orderItems.push({
          name: addOn.name,
          price: addOn.price,
          isMonthly: true,
          icon: addOn.icon
        });
      }
    });
  }

  // Super Boost if upgraded
  if (upgraded) {
    // Clear individual items and show Super Boost bundle
    orderItems.length = 0;
    orderItems.push({
      name: "AI Super Boost Bundle",
      price: 999,
      isMonthly: false,
      icon: GiftIcon
    });
  }

  // Calculate totals
  const monthlyTotal = orderItems.filter(i => i.isMonthly).reduce((sum, i) => sum + i.price, 0);
  const oneTimeTotal = orderItems.filter(i => !i.isMonthly).reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: Math.random() > 0.5 ? 'hsl(45 100% 50%)' : 'hsl(240 100% 50%)',
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-center gap-3">
            <NinjaLogo size="md" />
            <span className="text-xl font-bold">Ninja</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <NinjaLogo size="lg" className="animate-scale-in" />
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🎉</div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            You're all set! 🎉
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            We're excited to get your business AI optimized.
          </p>
        </div>

        {/* Onboarding CTA - Hero Position */}
        <Card className="shadow-elegant border-0 mb-6 p-6 sm:p-8 text-center animate-fade-in bg-ninja-blue/5" style={{ animationDelay: '0.05s' }}>
          <div className="inline-flex items-center gap-2 bg-ninja-blue/10 border border-ninja-blue/20 px-4 py-2 rounded-full mb-4">
            <Rocket className="w-4 h-4 text-ninja-blue" />
            <span className="font-bold text-xs text-ninja-blue uppercase tracking-wide">Next Step</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Let's Verify Your Google Profile
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Fast-track your boost with our online account activation form.
          </p>
          <Button size="lg" variant="ninja" className="w-full sm:w-auto text-base sm:text-lg font-bold px-8" asChild>
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer">
              🚀 Start Onboarding Now
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">Takes less than 3 minutes</p>
        </Card>

        {/* Order Summary Card */}
        <Card className="shadow-elegant border-0 mb-6 p-6 sm:p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-ninja-blue" />
            <h2 className="text-xl sm:text-2xl font-bold">Order Summary</h2>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ninja-blue/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-blue" />
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base">{item.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {item.isMonthly ? "Monthly subscription" : "One-time payment"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-ninja-blue text-sm sm:text-base">
                      ${item.price}{item.isMonthly ? "/mo" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t-2 border-dashed space-y-2">
            {monthlyTotal > 0 && (
              <div className="flex items-center justify-between text-base sm:text-lg">
                <span className="font-medium text-muted-foreground">Monthly Total:</span>
                <span className="font-bold text-ninja-blue">${monthlyTotal}/mo</span>
              </div>
            )}
            {oneTimeTotal > 0 && (
              <div className="flex items-center justify-between text-base sm:text-lg">
                <span className="font-medium text-muted-foreground">One-Time Total:</span>
                <span className="font-bold text-ninja-blue">${oneTimeTotal}</span>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-ninja-green flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Payment confirmed</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-ninja-green flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Ninja team notified</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-ninja-yellow flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Business details pending (complete below)</span>
            </div>
          </div>
        </Card>

        {/* Onboarding CTA Card */}
        <Card className="shadow-elegant border-0 mb-6 p-6 sm:p-8 text-center animate-fade-in bg-ninja-blue/5" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 bg-ninja-blue/10 border border-ninja-blue/20 px-4 py-2 rounded-full mb-4">
            <Rocket className="w-4 h-4 text-ninja-blue" />
            <span className="font-bold text-xs text-ninja-blue uppercase tracking-wide">Next Step</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Let's Verify Your Google Profile
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Fast-track your boost with our online account activation form.
          </p>
          <Button size="lg" variant="ninja" className="w-full sm:w-auto text-base sm:text-lg font-bold px-8" asChild>
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer">
              🚀 Start Onboarding Now
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">Takes less than 3 minutes</p>
        </Card>

        {/* What Happens Next */}
        <Card className="shadow-elegant border-0 mb-6 p-8 sm:p-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">What Happens Next</h3>
            <p className="text-muted-foreground">Your journey to digital domination starts now</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-ninja-blue/5 border border-ninja-blue/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ninja-blue/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-ninja-blue" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Keyword Research</h4>
                <p className="text-muted-foreground">We'll research your best local keywords to maximize your visibility in search results.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-ninja-blue/5 border border-ninja-blue/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ninja-blue/10 flex items-center justify-center">
                <Map className="w-6 h-6 text-ninja-blue" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Profile Optimization</h4>
                <p className="text-muted-foreground">We'll optimize your Google Business Profile for search & maps to drive more customers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-ninja-yellow/5 border border-ninja-yellow/20">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ninja-yellow/10 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-ninja-blue" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">See Results</h4>
                <p className="text-muted-foreground">You'll start seeing results within days as your visibility improves across Google & AI Search.</p>
              </div>
            </div>
          </div>

          {/* Results Timeline */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ninja-blue" />
                <span className="font-medium">#1 Rated Boost Service</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ninja-blue" />
                <span className="font-medium">Full Google Optimization</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Brand Footer */}
        <footer className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-base sm:text-lg text-muted-foreground mb-4">
            Welcome to Ninja — where your digital presence runs on autopilot.
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-3">
            <NinjaLogo size="sm" />
            <span>Done-for-you growth by AI</span>
          </div>
          <p className="text-sm text-muted-foreground">Trusted by 1,000+ local businesses</p>
        </footer>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYou;
