import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NinjaLogo } from "@/components/ui/ninja-logo";
import { PricingCard } from "@/components/checkout/pricing-card";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { TrustIndicators } from "@/components/checkout/trust-indicators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, StarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const PRICING_PLANS = [{
  name: "Starter",
  price: 69,
  description: "Perfect for small businesses getting started",
  features: ["AI-Powered Google Optimization", "Voice Search Optimization", "Basic AI Search Coverage", "Monthly Performance Reports", "Email Support", "5 Keywords Tracked"]
}, {
  name: "Professional",
  price: 99,
  popular: true,
  badge: "BEST VALUE",
  description: "Ideal for growing businesses seeking maximum visibility",
  features: ["Everything in Starter", "Advanced AI Search Optimization", "Mobile Search Priority", "Instant Traffic Boost", "Weekly Performance Reports", "Priority Support", "15 Keywords Tracked", "Custom Business Optimization"]
}];
const Index = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(PRICING_PLANS[1]); // Default to Professional
  const [currentStep, setCurrentStep] = useState(1); // 1 = package selection, 2 = checkout

  const handlePlanSelect = (planIndex: number) => {
    setSelectedPlan(PRICING_PLANS[planIndex]);
  };
  const handleContinueToCheckout = () => {
    setCurrentStep(2);
  };
  const handleBackToPlans = () => {
    setCurrentStep(1);
  };
  const handleCheckout = (result: { success: boolean; orderId?: string; customerId?: string; error?: string; isSimulated?: boolean }) => {
    console.log('Checkout result:', result);
    
    if (result.success) {
      // Show success message
      toast({
        title: "Payment Successful!",
        description: result.isSimulated ? "Test mode: Order created successfully" : "Your subscription is now active",
      });
      
      // Redirect to add-ons after a short delay
      setTimeout(() => {
        navigate("/add-ons");
      }, 1500);
    } else {
      // Error is already shown by checkout form
      console.error('Checkout failed:', result.error);
    }
  };

  // Step 2: Checkout Form
  if (currentStep === 2) {
    return <div className="min-h-screen bg-background font-poppins">
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              <button onClick={handleBackToPlans} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                ← Back to Plans
              </button>
              <div className="flex items-center gap-3">
                <NinjaLogo size="md" />
                <span className="text-xl font-bold">Ninja</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheckIcon className="w-4 h-4 text-ninja-blue" />
                <span className="hidden sm:inline">Secure</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="p-6 shadow-elegant border-0">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">{selectedPlan.name} Plan</div>
                      <div className="text-sm text-muted-foreground">Monthly subscription</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-3xl text-ninja-blue">${selectedPlan.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-ninja-blue" />
                      <span>Instant setup included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-ninja-blue" />
                      <span>Results in 24-48 hours</span>
                    </div>
                  </div>
                </div>
              </Card>

              <TrustIndicators />
            </div>

            {/* Checkout Form */}
            <div>
              <Card className="p-6 shadow-elegant border-0">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheckIcon className="w-5 h-5 text-ninja-blue" />
                  <h3 className="text-xl font-bold">Secure Checkout</h3>
                </div>
                <CheckoutForm selectedPlan={selectedPlan} onSubmit={handleCheckout} />
              </Card>
            </div>
          </div>
        </div>
      </div>;
  }

  // Step 1: Package Selection

  return <div className="min-h-screen bg-background font-poppins">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NinjaLogo size="md" />
              <span className="text-xl font-bold">Ninja</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheckIcon className="w-4 h-4 text-ninja-blue" />
              <span className="hidden sm:inline">Secure checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-ninja-blue/10 border border-ninja-blue/20 px-4 py-2 rounded-full mb-6">
            <StarIcon className="w-4 h-4 text-ninja-blue" />
            <span className="font-semibold text-sm text-ninja-blue">15,247 businesses boosted this month</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Dominate Google &<br />
            <span className="text-ninja-blue">AI Search Results</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Get found by your customers. See results in 24-48 hours.
          </p>

          {/* Enhanced Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-ninja-blue/20 border-2 border-white flex items-center justify-center text-xs font-bold">A</div>
                <div className="w-8 h-8 rounded-full bg-ninja-yellow/20 border-2 border-white flex items-center justify-center text-xs font-bold">B</div>
                <div className="w-8 h-8 rounded-full bg-ninja-blue/30 border-2 border-white flex items-center justify-center text-xs font-bold">C</div>
              </div>
              <span className="font-medium">15,000+ businesses</span>
            </div>
            <div className="flex items-center gap-1 text-ninja-yellow">
              {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4 fill-current" />)}
              <span className="font-bold text-foreground ml-1">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-ninja-blue" />
              <span className="font-medium">Fully Secure & AI Friendly</span>
            </div>
          </div>
        </div>

        {/* Simplified Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {PRICING_PLANS.map((plan, index) => <PricingCard key={plan.name} plan={plan} selected={selectedPlan.name === plan.name} onSelect={() => handlePlanSelect(index)} />)}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button onClick={handleContinueToCheckout} variant="ninja" size="xl" className="font-bold text-lg px-12 py-6 mb-4 hover:scale-105 transition-all">
            Continue with {selectedPlan.name} →
          </Button>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
            <span>✓ Cancel anytime</span>
            <span>✓ Instant Setup</span>
            <span>✓ Results in 24-48h</span>
          </div>

          {/* Bottom Social Proof */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">Trusted by over 15,000 businesses</p>
            
          </div>
        </div>
      </div>
    </div>;
};
export default Index;