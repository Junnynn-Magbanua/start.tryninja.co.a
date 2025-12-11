import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LockIcon, CreditCardIcon, ShieldCheckIcon, Loader2 } from "lucide-react";
import { createStickyOrder, validateCardDetails, formatCardNumber as formatCardNum, type StickyOrderData } from "@/lib/sticky";
import { toast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  selectedPlan: {
    name: string;
    price: number;
  };
  onSubmit: (result: { success: boolean; orderId?: string; customerId?: string; error?: string; isSimulated?: boolean }) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ selectedPlan, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email ||
          !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Parse expiry date (MM/YY format)
      const [expMonth, expYear] = formData.expiryDate.split('/').map(s => s.trim());

      // Validate card details
      const validation = validateCardDetails(
        formData.cardNumber,
        expMonth,
        expYear,
        formData.cvv
      );

      if (!validation.isValid) {
        toast({
          title: "Invalid Card Details",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Map plan price to product ID
      let productId = '6'; // Default to product 6 (Professional)
      if (selectedPlan.price === 99) {
        productId = '6'; // Professional plan
      } else if (selectedPlan.price === 69) {
        productId = '9'; // Starter plan
      }

      // Prepare order data for Sticky.io
      const orderData: StickyOrderData = {
        products: [{
          id: productId,
          price: selectedPlan.price,
          name: `${selectedPlan.name} Plan - AI-Powered Google Optimization`
        }],
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || '',
        billingAddress: formData.billingAddress || '',
        billingCity: formData.city || '',
        billingState: formData.state || '',
        billingZip: formData.zipCode || '',
        billingCountry: 'US',
        cardNumber: formatCardNum(formData.cardNumber),
        cardExpMonth: expMonth,
        cardExpYear: expYear,
        cardCvv: formData.cvv,
        totalAmount: selectedPlan.price
      };

      // Process payment with Sticky.io
      const result = await createStickyOrder(orderData);

      if (result.success) {
        // Store customer info in sessionStorage for add-ons page
        sessionStorage.setItem('ninja_customer_id', result.customerId || '');
        sessionStorage.setItem('ninja_order_id', result.orderId || '');
        sessionStorage.setItem('ninja_customer_email', formData.email);
        sessionStorage.setItem('ninja_customer_firstName', formData.firstName);
        sessionStorage.setItem('ninja_customer_lastName', formData.lastName);
        sessionStorage.setItem('ninja_selected_plan', selectedPlan.name);
        sessionStorage.setItem('ninja_plan_price', selectedPlan.price.toString());

        onSubmit({
          success: true,
          orderId: result.orderId,
          customerId: result.customerId,
          isSimulated: result.isSimulated
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || 'Payment processing failed',
          variant: "destructive"
        });
        onSubmit({
          success: false,
          error: result.error || 'Payment failed'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      onSubmit({
        success: false,
        error: 'An unexpected error occurred'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);
    // Add space every 4 digits
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 4 digits
    const limited = cleaned.slice(0, 4);
    
    // Add slash after MM
    if (limited.length >= 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    return limited;
  };

  // Format CVV (only digits, max 4)
  const formatCVV = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 4);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Apply formatting based on field
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = formatCVV(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground">Contact Information</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="email" className="font-medium">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@business.com"
              required
              className="h-12 rounded-xl border-2 focus:border-ninja-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="font-medium">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
                className="h-12 rounded-xl border-2 focus:border-ninja-blue"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="font-medium">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
                className="h-12 rounded-xl border-2 focus:border-ninja-blue"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone" className="font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="h-12 rounded-xl border-2 focus:border-ninja-blue"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-ninja-blue" />
          <h4 className="font-bold text-foreground">Payment Details</h4>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="cardNumber" className="font-medium">Card Number *</Label>
            <Input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              className="h-12 rounded-xl border-2 focus:border-ninja-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expiryDate" className="font-medium">Expiry *</Label>
              <Input
                id="expiryDate"
                type="text"
                inputMode="numeric"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                required
                className="h-12 rounded-xl border-2 focus:border-ninja-blue"
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="font-medium">CVV *</Label>
              <Input
                id="cvv"
                type="text"
                inputMode="numeric"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                required
                className="h-12 rounded-xl border-2 focus:border-ninja-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-xl p-3">
        <ShieldCheckIcon className="w-4 h-4 text-ninja-blue" />
        <span>256-bit SSL encryption</span>
      </div>

      <Button 
        type="submit" 
        variant="ninja" 
        size="xl" 
        className="w-full font-bold text-lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Start $${selectedPlan.price}/month →`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        By continuing, you agree to our Terms & Privacy Policy. Cancel anytime.
      </p>
    </form>
  );
};