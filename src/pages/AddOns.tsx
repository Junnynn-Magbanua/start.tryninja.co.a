import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NinjaLogo } from "@/components/ui/ninja-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, ZapIcon, TrendingUpIcon, StarIcon, MessageSquareIcon, BrainIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  price: number;
  isMonthly: boolean;
  category: string;
  icon: any;
  title: string;
  subtitle?: string;
  description: string;
  features: string[];
  roi: string;
  recommended?: boolean;
  badge?: string;
}

interface SetupTier {
  name: string;
  price: number;
  recommended?: boolean;
  features: string[];
}

const SETUP_TIERS: SetupTier[] = [
  {
    name: "Essential Setup",
    price: 99,
    features: [
      "Basic Profile Optimization",
      "5 Extra Categories & 50 Keywords",
      "Standard AI Content",
      "Basic Photo Optimization",
      "Standard Configuration"
    ]
  },
  {
    name: "Pro Setup",
    price: 149,
    recommended: true,
    features: [
      "Advanced Profile Optimization",
      "10 Extra Categories & 100 Keywords",
      "Premium AI-Powered Content",
      "Auto Geo-Tags & AI Photo Labeling",
      "Advanced Configuration & Settings",
      "Priority Setup (24-48h)"
    ]
  },
  {
    name: "Elite Setup",
    price: 299,
    features: [
      "White-Glove Concierge Setup",
      "15 Extra Categories & 150 Keywords",
      "Elite AI Content & Copywriting",
      "Full Media Optimization Suite",
      "Custom Profile Strategy Session",
      "Express Setup (12-24h)",
      "Dedicated Setup Specialist"
    ]
  }
];

const ADD_ONS: AddOn[] = [
  {
    id: "advanced-presence",
    name: "Advanced Presence",
    price: 39,
    isMonthly: true,
    category: "AI-PRESENCE",
    icon: SparklesIcon,
    title: "Show Up Everywhere Instantly",
    subtitle: "across 125+ popular digital networks",
    description: "Dominate every platform where customers search for businesses like yours",
    features: [
      "🗺️ Apple Maps, Google Maps, Waze",
      "🤖 ChatGPT, Siri, Alexa, Google Assistant",
      "🔍 Yelp, Yahoo, Bing, Facebook",
      "📱 GPS apps and AI voice search",
      "🎯 Emerging AI agents and business finders"
    ],
    roi: "+89% visibility across all platforms"
  },
  {
    id: "google-posting",
    name: "Google AI-Posting Pro",
    price: 79,
    isMonthly: true,
    category: "AI GOOGLE POSTING",
    icon: MessageSquareIcon,
    title: "Never Miss a Google Post Again",
    description: "Get weekly published, high-performing posts that help you show up more often and drive more clicks, calls, and bookings.",
    features: [
      "Weekly AI-generated posts",
      "Optimized for maximum engagement",
      "Industry-specific content",
      "Auto-scheduled publishing",
      "Performance tracking"
    ],
    roi: "+156% more profile engagement",
    recommended: true,
    badge: "HIGHLY RECOMMENDED"
  },
  {
    id: "power-reviews",
    name: "Power Reviews",
    price: 29,
    isMonthly: true,
    category: "REVIEW BOOST",
    icon: StarIcon,
    title: "Automate Your 5-Star Reviews",
    description: "Reviews are powerful engagement signals to Google. Get more reviews automatically.",
    features: [
      "AI automated review booster",
      "Automatically generate 5-star reviews",
      "AI Review Responder",
      "Negative Review Defender",
      "SMS Review Promotional Links"
    ],
    roi: "+234% more customer reviews"
  },
  {
    id: "ai-presence",
    name: "ChatGPT AI Booster",
    price: 49,
    isMonthly: true,
    category: "ChatGPT AI",
    icon: BrainIcon,
    title: "Dominate AI Search Results",
    subtitle: "Brand New!",
    description: "It's a race to own your category in AI search - get ahead now before your competitors do!",
    features: [
      "Get 7.5x more traffic from AI searches",
      "Rank faster in all major AI platforms",
      "ChatGPT, Google Gemini, Perplexity, Siri, Alexa",
      "Get recommended by AI's answer engines",
      "#1 way to get ahead of your competition"
    ],
    roi: "+673% more AI-driven traffic",
    recommended: true,
    badge: "BRAND NEW"
  }
];

const AddOns = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedSetupTier, setSelectedSetupTier] = useState<number | null>(null);
  const totalSteps = 5;

  const handleSetupSelect = (tierIndex: number) => {
    setSelectedSetupTier(tierIndex);
    setCurrentStep(1);
  };

  const handleAddOnSelect = (addOnId: string) => {
    setSelectedAddOns(prev => [...prev, addOnId]);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const setupTier = selectedSetupTier !== null ? SETUP_TIERS[selectedSetupTier] : null;
    
    // Navigate to Super Boost page with user selections
    navigate("/super-boost", {
      state: {
        selectedPlan: { name: "Professional Plan", price: 99 },
        selectedSetupTier: setupTier ? { name: setupTier.name, price: setupTier.price } : null,
        selectedAddOns: selectedAddOns
      }
    });
  };

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const currentAddOn = currentStep > 0 ? ADD_ONS[currentStep - 1] : null;

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-center gap-2">
            <NinjaLogo size="sm" />
            <span className="text-lg sm:text-xl font-bold">Ninja</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card/50 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 max-w-4xl">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-ninja-blue">
                Step {currentStep + 1}/{totalSteps}
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                Your growth engine is being built 🚀
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5 sm:h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Step 0: Advanced Pro Setup */}
        {currentStep === 0 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-3 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 bg-ninja-blue/10 border border-ninja-blue/20 px-2.5 py-1 rounded-full mb-2">
                <ZapIcon className="w-3 h-3 text-ninja-blue" />
                <span className="font-bold text-[10px] text-ninja-blue uppercase tracking-wide">SETUP BOOST</span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1.5 px-2 leading-tight">
                Want to supercharge your boost today?
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                AI-pro team will optimize your Google Business Profile with expedited, advanced setup.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-2.5 sm:gap-4">
              {SETUP_TIERS.map((tier, index) => (
                <Card
                  key={tier.name}
                  className={`relative p-3 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                    tier.recommended 
                      ? 'ring-2 sm:ring-4 ring-ninja-blue bg-white shadow-elegant md:scale-[1.05]' 
                      : 'border-2 hover:border-ninja-blue/50'
                  }`}
                  onClick={() => handleSetupSelect(index)}
                >
                  {tier.recommended && (
                    <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-ninja-blue text-white px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-bold">
                        RECOMMENDED
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-2 sm:space-y-4">
                    <h3 className="font-bold text-xs sm:text-base leading-tight">{tier.name}</h3>
                    <div>
                      <span className="text-xl sm:text-3xl font-extrabold text-ninja-blue">${tier.price}</span>
                      <span className="text-[10px] sm:text-sm text-muted-foreground"> one time</span>
                    </div>

                    <div className="space-y-1 sm:space-y-2 text-left">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-[11px] sm:text-sm">
                          <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-ninja-blue flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant={tier.recommended ? "ninja" : "outline"}
                      className="w-full text-[11px] sm:text-sm py-1.5 sm:py-2.5"
                      onClick={() => handleSetupSelect(index)}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* ROI Badge */}
            <div className="text-center py-2 sm:py-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-ninja-yellow/20 border border-ninja-yellow/30 px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl">
                <TrendingUpIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-ninja-blue" />
                <span className="font-bold text-[11px] sm:text-sm text-foreground">
                  See results 3-5x faster
                </span>
              </div>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs sm:text-sm">
                No Thanks, Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Steps 1-4: Add-Ons */}
        {currentStep > 0 && currentAddOn && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 bg-ninja-blue/10 border border-ninja-blue/20 px-3 py-1.5 rounded-full mb-3">
                <currentAddOn.icon className="w-3.5 h-3.5 text-ninja-blue" />
                <span className="font-bold text-xs text-ninja-blue uppercase tracking-wide">{currentAddOn.category}</span>
              </div>

              {currentAddOn.badge && (
                <div className="mb-2">
                  <span className="bg-ninja-yellow text-foreground px-2.5 py-1 rounded-full text-xs font-bold">
                    {currentAddOn.badge}
                  </span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 px-2 leading-tight">
                {currentAddOn.title}
              </h1>
              {currentAddOn.subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground mb-2 px-2">{currentAddOn.subtitle}</p>
              )}
            </div>

            <Card className="p-5 sm:p-8 shadow-elegant border-0 max-w-2xl mx-auto">
              <div className="text-center space-y-4 sm:space-y-6">
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-ninja-blue mb-1">
                    ${currentAddOn.price}
                    <span className="text-xl sm:text-2xl text-muted-foreground">/mo</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground leading-snug">
                  {currentAddOn.description}
                </p>

                <div className="space-y-2 sm:space-y-2.5 text-left py-3 sm:py-4">
                  {currentAddOn.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ninja-blue flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* ROI Highlight */}
                <div className="bg-ninja-blue/10 border-2 border-ninja-blue/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-ninja-blue" />
                    <span className="font-bold text-base sm:text-lg">
                      ROI: {currentAddOn.roi}
                    </span>
                  </div>
                </div>

                {currentAddOn.recommended && (
                  <div className="text-xs sm:text-sm font-semibold text-ninja-blue leading-snug">
                    Google heavily rewards this activity - Highly Recommended!
                  </div>
                )}
              </div>
            </Card>

            {/* CTAs */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <Button
                variant="ninja"
                size="lg"
                className="w-full font-bold text-sm sm:text-lg"
                onClick={() => handleAddOnSelect(currentAddOn.id)}
              >
                YES - Add {currentAddOn.name}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs sm:text-base"
                onClick={handleSkip}
              >
                No Thanks
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ninja-blue" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ninja-yellow fill-current" />
                <span>15,000+ businesses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ZapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ninja-blue" />
                <span>Results in 24-48h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOns;
