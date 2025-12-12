import { useLocation, useNavigate } from "react-router-dom";
import { NinjaLogo } from "@/components/ui/ninja-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckIcon, ZapIcon, FlameIcon, CrownIcon, SparklesIcon, MessageSquareIcon, StarIcon, BrainIcon, ShieldCheckIcon, ClockIcon, TrendingUpIcon, GiftIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createStickyOrder, type StickyOrderData } from "@/lib/sticky";
import { toast } from "@/hooks/use-toast";

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
}

// Full package values (annual)
const FULL_PACKAGE = {
  plan: {
    name: "Professional Plan",
    monthlyPrice: 99,
    annualValue: 1188
  },
  setup: {
    name: "Elite White-Glove Setup",
    price: 299
  },
  addOns: [{
    id: "advanced-presence",
    name: "Advanced Presence",
    monthlyPrice: 39,
    annualValue: 468,
    icon: SparklesIcon
  }, {
    id: "google-posting",
    name: "Google AI-Posting Pro",
    monthlyPrice: 79,
    annualValue: 948,
    icon: MessageSquareIcon
  }, {
    id: "power-reviews",
    name: "Power Reviews",
    monthlyPrice: 29,
    annualValue: 348,
    icon: StarIcon
  }, {
    id: "ai-presence",
    name: "ChatGPT AI Booster",
    monthlyPrice: 49,
    annualValue: 588,
    icon: BrainIcon
  }]
};
const SUPER_BOOST_PRICE = 999;
const SUPER_BOOST_PRODUCT_ID = "18"; // Product ID for AI Super Boost - Annual

const SuperBoost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState || {};
  const [timeLeft, setTimeLeft] = useState({
    minutes: 14,
    seconds: 59
  });

  const [showJackpot, setShowJackpot] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{
    customerId?: string;
    orderId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  // Load customer info from session storage
  useEffect(() => {
    const customerId = sessionStorage.getItem('ninja_customer_id');
    const orderId = sessionStorage.getItem('ninja_order_id');
    const email = sessionStorage.getItem('ninja_customer_email');
    const firstName = sessionStorage.getItem('ninja_customer_firstName');
    const lastName = sessionStorage.getItem('ninja_customer_lastName');

    if (customerId && orderId) {
      setCustomerInfo({
        customerId,
        orderId,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || ''
      });
    }
  }, []);

  // Jackpot celebration on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowJackpot(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1
          };
        } else if (prev.minutes > 0) {
          return {
            minutes: prev.minutes - 1,
            seconds: 59
          };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate total package value
  const totalValue = FULL_PACKAGE.plan.annualValue + FULL_PACKAGE.setup.price + FULL_PACKAGE.addOns.reduce((sum, a) => sum + a.annualValue, 0);
  const savings = totalValue - SUPER_BOOST_PRICE;
  const discountPercent = Math.round(savings / totalValue * 100);
  
  const handleUpgrade = async () => {
    setIsProcessing(true);

    try {
      // Validate customer info
      if (!customerInfo.customerId || !customerInfo.orderId) {
        toast({
          title: "Error",
          description: "Customer information not found. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Create order for Super Boost product
      const orderData: StickyOrderData = {
        products: [{
          id: SUPER_BOOST_PRODUCT_ID,
          price: SUPER_BOOST_PRICE,
          name: "AI Super Boost - Annual"
        }],
        email: customerInfo.email || '',
        firstName: customerInfo.firstName || '',
        lastName: customerInfo.lastName || '',
        phone: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: 'US',
        cardNumber: '',
        cardExpMonth: '',
        cardExpYear: '',
        cardCvv: '',
        totalAmount: SUPER_BOOST_PRICE,
        customerId: customerInfo.customerId,
        parentOrderId: customerInfo.orderId,
        stepNumber: 3 // Super Boost is step 3
      };

      const result = await createStickyOrder(orderData);

      if (result.success) {
        toast({
          title: "🎉 Super Boost Activated!",
          description: `Your AI Super Boost Bundle is now active. You saved $${savings}!`
        });

        // Navigate to thank you page with upgrade flag
        setTimeout(() => {
          navigate("/thank-you?upgraded=true", {
            state: {
              ...state,
              superBoostUpgraded: true
            }
          });
          setIsProcessing(false);
        }, 1500);
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "There was an error processing your upgrade.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Super Boost upgrade error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  const handleSkip = () => {
    navigate("/thank-you", { state });
  };
  return <div className="min-h-screen bg-background font-poppins">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-center gap-2">
            <NinjaLogo size="sm" />
            <span className="text-lg sm:text-xl font-bold">Ninja</span>
          </div>
        </div>
      </header>

      {/* Epic Celebration Overlay */}
      {showJackpot && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Dark overlay for drama */}
          <div className="absolute inset-0 bg-black/60 animate-[fadeIn_0.3s_ease-out]" />
          
          {/* Rotating light beams from center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[200vmax] h-[200vmax] animate-[spin_8s_linear_infinite]">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-8 h-[100vmax] origin-bottom"
                  style={{
                    transform: `rotate(${i * 30}deg) translateX(-50%)`,
                    background: `linear-gradient(to top, transparent, ${i % 2 === 0 ? 'rgba(250, 204, 21, 0.3)' : 'rgba(77, 127, 250, 0.3)'}, transparent)`,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Falling golden coins */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`coin-${i}`}
              className="absolute text-2xl sm:text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                animation: `fall ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
              }}
            >
              💰
            </div>
          ))}
          
          {/* Sparkle explosions */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `sparkle ${0.5 + Math.random() * 0.5}s ease-out ${Math.random() * 2}s infinite`,
              }}
            >
              <SparklesIcon 
                className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" 
                style={{ filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 1))' }}
              />
            </div>
          ))}
          
          {/* Center celebration content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-[scaleIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
              {/* Trophy icon */}
              <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🏆</div>
              
              {/* Main text with glow */}
              <div className="relative">
                <div className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 animate-pulse">
                  YOU UNLOCKED A
                </div>
                <div className="text-4xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 mt-2 animate-[pulse_0.5s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.8))' }}>
                  SPECIAL DEAL! 💎
                </div>
              </div>
              
              {/* Subtext */}
              <div className="mt-4 text-lg sm:text-xl text-white/90 animate-[fadeIn_0.5s_ease-out_0.5s_forwards] opacity-0">
                Limited time offer just for you!
              </div>
            </div>
          </div>
          
          {/* Side fireworks */}
          <div className="absolute top-1/4 left-10 text-4xl animate-[firework_1s_ease-out_infinite]">🎆</div>
          <div className="absolute top-1/3 right-10 text-4xl animate-[firework_1s_ease-out_0.3s_infinite]">🎇</div>
          <div className="absolute bottom-1/4 left-20 text-4xl animate-[firework_1s_ease-out_0.6s_infinite]">✨</div>
          <div className="absolute bottom-1/3 right-20 text-4xl animate-[firework_1s_ease-out_0.9s_infinite]">🎆</div>
        </div>
      )}
      
      {/* Custom keyframes */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0.7; }
        }
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes firework {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
      `}</style>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-ninja-blue to-ninja-blue-light text-white py-2 sm:py-3">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <div className="flex items-center gap-2">
              <FlameIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="font-bold text-sm sm:text-base">ONE-TIME OFFER</span>
              <FlameIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-mono font-bold text-sm sm:text-base">
                {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-ninja-yellow/20 border px-4 py-2 rounded-full mb-4 border-[#3bdb38]/30">
            <CrownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ninja-blue" />
            <span className="font-bold text-xs sm:text-sm text-foreground">EXCLUSIVE UPGRADE</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">
            You Unlocked
          </h1>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-ninja-blue via-ninja-blue-light to-ninja-blue px-6 py-3 rounded-full shadow-lg mb-4 animate-pulse">
            <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide">AI Super Boost</span>
            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-yellow" />
          </div>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get <span className="font-bold text-foreground">ALL</span> our <span className="font-bold text-foreground">UPGRADES</span> for <span className="font-bold text-foreground">FREE</span>
          </p>
          
          <Button variant="outline" size="sm" className="mt-4 text-xs sm:text-sm text-ninja-blue border-ninja-blue/30 hover:bg-ninja-blue/10 hover:border-ninja-blue/50" onClick={handleSkip}>
            No thanks, continue with monthly plan
          </Button>
        </div>

        {/* Value Stack Card */}
        <Card className="shadow-elegant border-0 mb-6 p-5 sm:p-8 animate-fade-in" style={{
        animationDelay: '0.1s'
      }}>

          <div className="space-y-3 sm:space-y-4">
            {/* Plan */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-ninja-blue/5 rounded-xl border border-ninja-blue/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ninja-blue/10 flex items-center justify-center">
                  <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-blue" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base">{FULL_PACKAGE.plan.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">12 months included</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm sm:text-base text-muted-foreground line-through">${FULL_PACKAGE.plan.annualValue}</div>
                <div className="font-bold text-ninja-blue text-sm sm:text-base">INCLUDED</div>
              </div>
            </div>

            {/* Elite Setup */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-ninja-yellow/5 rounded-xl border border-ninja-yellow/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ninja-yellow/10 flex items-center justify-center">
                  <CrownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-blue" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base">{FULL_PACKAGE.setup.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Priority 12-24h setup</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm sm:text-base text-muted-foreground line-through">${FULL_PACKAGE.setup.price}</div>
                <div className="font-bold text-ninja-blue text-sm sm:text-base">INCLUDED</div>
              </div>
            </div>

            {/* All Add-Ons */}
            {FULL_PACKAGE.addOns.map(addOn => <div key={addOn.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ninja-blue/10 flex items-center justify-center">
                    <addOn.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-blue" />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base">{addOn.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">12 months included</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm sm:text-base text-muted-foreground line-through">${addOn.annualValue}</div>
                  <div className="font-bold text-ninja-blue text-sm sm:text-base">INCLUDED</div>
                </div>
              </div>)}
            
            
          </div>

          {/* Total Value */}
          <div className="mt-6 pt-6 border-t-2 border-dashed">
            <div className="flex items-center justify-between text-lg sm:text-xl">
              <span className="font-bold">Total Value:</span>
              <span className="font-extrabold text-muted-foreground line-through">${totalValue.toLocaleString()}/year</span>
            </div>
          </div>
        </Card>

        {/* Pricing Breakdown Card */}
        <Card className="shadow-elegant border-0 mb-6 p-5 sm:p-8 bg-gradient-to-br from-ninja-blue/5 to-ninja-yellow/5 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Super Boost Price */}
            <div>
              
              <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-ninja-blue">
                ${SUPER_BOOST_PRICE}
              </div>
              <div className="text-base sm:text-lg text-muted-foreground">One-Time Annual Payment</div>
            </div>

            {/* Savings Callout */}
            <div className="inline-flex items-center gap-2 bg-ninja-green px-5 py-3 rounded-full">
              <TrendingUpIcon className="w-5 h-5 text-foreground" />
              <div className="font-bold text-foreground flex flex-col items-center">
                <span>You're saving ${savings.toLocaleString()}+!</span>
                <span>({discountPercent}% OFF)</span>
              </div>
            </div>

            {/* Urgency Banner */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-2">
                <FlameIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-ninja-blue" />
                <span className="font-bold text-sm sm:text-base text-foreground">ONE-TIME OFFER</span>
                <FlameIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-ninja-blue" />
              </div>
              <div className="flex items-center gap-2 bg-ninja-blue/20 px-3 py-1 rounded-full">
                <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ninja-blue" />
                <span className="font-mono font-bold text-sm sm:text-base text-ninja-blue">
                  {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Social Proof */}
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3 max-w-2xl mx-auto animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <Button 
            variant="ninja" 
            size="xl" 
            className="w-full font-bold text-base sm:text-xl animate-pulse" 
            onClick={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `🚀 YES! Upgrade to Super Boost - $${SUPER_BOOST_PRICE}`
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm text-ninja-blue border-ninja-blue/30 hover:bg-ninja-blue/10 hover:border-ninja-blue/50" 
            onClick={handleSkip}
            disabled={isProcessing}
          >
            No thanks, continue with monthly plan
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground animate-fade-in" style={{
        animationDelay: '0.4s'
      }}>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ninja-blue" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ninja-blue" />
            <span>Full support included</span>
          </div>
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ninja-yellow fill-current" />
            <span>Results guaranteed</span>
          </div>
        </div>

        {/* Urgency Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{
        animationDelay: '0.5s'
      }}>
          
        </div>
      </div>
    </div>;
};
export default SuperBoost;