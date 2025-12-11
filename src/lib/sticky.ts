declare global {
  interface Window {
    rudderanalytics?: any;
  }
}

export interface StickyOrderData {
  products: Array<{
    id: string;
    price: number;
    name?: string;
  }>;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry?: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvv: string;
  totalAmount: number;
  customerId?: string;
  parentOrderId?: string;
  stepNumber?: number;
  // UTM and tracking data
  utmData?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    ad_id?: string;
    ad_set_id?: string;
    campaign_tracking_group_id?: string;
  };
}

export interface StickyOrderResponse {
  success: boolean;
  orderId?: string;
  customerId?: string;
  message?: string;
  orders?: Array<{
    productId: string;
    orderId?: string;
    price: number;
    success: boolean;
    error?: string;
    response?: any;
  }>;
  totalAmount?: number;
  error?: string;
  isSimulated?: boolean;
}

const STICKY_API_URL = import.meta.env.VITE_STICKY_API_URL || 'https://boostninja.sticky.io/api/v1';
const API_USERNAME = import.meta.env.VITE_STICKY_API_USERNAME;
const API_PASSWORD = import.meta.env.VITE_STICKY_API_PASSWORD;

// Track in-progress requests to prevent double submission
const processingRequests = new Set<string>();

export async function createStickyOrder(orderData: StickyOrderData): Promise<StickyOrderResponse> {
  // Create request key at function scope for error handling
  let requestKey = '';

  try {

    // Basic validation
    if (!orderData || !Array.isArray(orderData.products) || orderData.products.length === 0) {
      return {
        success: false,
        error: 'Invalid request: products array is required'
      };
    }

    // Create a unique key for this request to prevent double submission
    requestKey = JSON.stringify({
      products: orderData.products.map(p => p.id),
      email: orderData.email,
      parentOrderId: orderData.parentOrderId,
      customerId: orderData.customerId
    });

    if (processingRequests.has(requestKey)) {
      console.warn('Duplicate request detected, skipping...');
      return {
        success: false,
        error: 'Request already in progress'
      };
    }

    processingRequests.add(requestKey);

    // If credentials are missing, simulate success in dev mode
    if (!API_USERNAME || !API_PASSWORD) {
      console.warn('Sticky.io API credentials not configured. Returning simulated success response.');
      const mockOrderId = `TEST-${Date.now()}`;

      // Track purchase on RudderStack
      if (typeof window !== 'undefined' && window.rudderanalytics) {
        const productContents = orderData.products.map(p => ({
          product_id: p.id,
          name: p.name,
          price: p.price,
          quantity: 1
        }));

        window.rudderanalytics.track('Order Completed', {
          order_id: mockOrderId,
          total: orderData.totalAmount,
          revenue: orderData.totalAmount,
          value: orderData.totalAmount, // TikTok requirement
          currency: 'USD',
          email: orderData.email,
          customer_name: `${orderData.firstName} ${orderData.lastName}`,
          products: productContents,
          // TikTok-specific fields
          contents: productContents,
          content_type: 'product',
          // UTM and tracking data
          ...(orderData.utmData || {})
        });
      }

      processingRequests.delete(requestKey);
      return {
        success: true,
        orderId: mockOrderId,
        customerId: `TEST-CUST-${Date.now()}`,
        message: `Simulated order for ${orderData.products.length} product(s)`,
        orders: orderData.products.map(p => ({
          productId: p.id,
          orderId: mockOrderId,
          price: p.price,
          success: true
        })),
        totalAmount: orderData.totalAmount,
        isSimulated: true
      };
    }

    const auth = btoa(`${API_USERNAME}:${API_PASSWORD}`);
    const orders: Array<{
      productId: string;
      orderId?: string;
      price: number;
      success: boolean;
      error?: string;
      response?: any;
    }> = [];
    let mainOrderId: string | null = null;
    let customerId: string | null = null;

    // Helper function to get billing info
    const getProductBillingInfo = (productId: string) => {
      let offerId = '1';
      let billingModelId: string;

      if (productId === '4' || productId === '14' || productId === '15' || productId === '16') {
        // Setup fees - One time
        billingModelId = '2';
      } else if (productId === '9' || productId === '6') {
        // Main subscriptions - Recurring
        billingModelId = '3';
      } else {
        // Add-ons - Default recurring
        billingModelId = '3';
      }

      return { offerId, billingModelId };
    };

    // Check if this is an upsell (has parent order ID)
    const isUpsell = !!orderData.parentOrderId;

    if (isUpsell && orderData.products.length > 0) {
      // UPSELL: Send all products in ONE request with different step_num values
      const apiEndpoint = `${STICKY_API_URL}/new_order_card_on_file`;
      const baseStepNum = orderData.stepNumber || 2;

      // Build offers array with all products, each with incrementing step_num
      const offers = orderData.products.map((product, index) => {
        const { offerId, billingModelId } = getProductBillingInfo(product.id);
        return {
          offer_id: parseInt(offerId),
          product_id: parseInt(product.id),
          billing_model_id: parseInt(billingModelId),
          quantity: 1,
          step_num: baseStepNum + index
        };
      });

      const requestData = {
        previousOrderId: orderData.parentOrderId,
        shippingId: '2',
        ipAddress: '127.0.0.1',
        campaignId: '2',
        offers: offers
      };

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        const responseText = await response.text();

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          result = { raw_response: responseText };
        }

        if ((result.order_id || result.orderId) &&
            (result.error_found !== '1' && result.error_found !== 1) &&
            !result.error_message &&
            result.response_code !== 'D') {

          const orderId = result.order_id || result.orderId;
          mainOrderId = orderId;
          customerId = result.customer_id || result.customerId;

          // All products succeeded
          orderData.products.forEach(product => {
            orders.push({
              productId: product.id,
              orderId: orderId,
              price: product.price,
              success: true,
              response: result
            });
          });
        } else {
          const errorMessage = result.error_message ||
                              result.decline_reason ||
                              result.gateway_response ||
                              (result.response_code === 'D' ? 'Transaction declined' : 'Transaction failed');

          // All products failed
          orderData.products.forEach(product => {
            orders.push({
              productId: product.id,
              price: product.price,
              success: false,
              error: errorMessage
            });
          });
        }

      } catch (error) {
        console.error(`Failed to create bundled upsell:`, error);
        orderData.products.forEach(product => {
          orders.push({
            productId: product.id,
            price: product.price,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        });
      }
    } else {
      // INITIAL ORDER: Process single main product with card details
      const product = orderData.products[0];
      const { offerId, billingModelId } = getProductBillingInfo(product.id);

      const apiEndpoint = `${STICKY_API_URL}/new_order`;
      const expYear = orderData.cardExpYear.length === 4 ? orderData.cardExpYear.slice(-2) : orderData.cardExpYear;
      const expirationDate = orderData.cardExpMonth.padStart(2, '0') + expYear.padStart(2, '0');

      const requestData = {
        method: 'NewOrder',
        campaignId: '2',
        shippingId: '2',
        offers: [
          {
            offer_id: parseInt(offerId),
            product_id: parseInt(product.id),
            billing_model_id: parseInt(billingModelId),
            quantity: 1,
            step_num: 1
          }
        ],
        email: orderData.email,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        phone: '',
        billingFirstName: orderData.firstName,
        billingLastName: orderData.lastName,
        billingAddress1: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billing_country: orderData.billingCountry || 'US',
        shippingFirstName: orderData.firstName,
        shippingLastName: orderData.lastName,
        shippingAddress1: '',
        shippingCity: '',
        shippingState: '',
        shippingZip: '',
        shippingCountry: orderData.billingCountry || 'US',
        creditCardNumber: orderData.cardNumber,
        expirationDate: expirationDate,
        CVV: orderData.cardCvv,
        creditCardType: detectCardType(orderData.cardNumber),
        ipAddress: '127.0.0.1',
        paymentType: 'CREDITCARD',
        tranType: 'Sale',
        testMode: '1'
      };

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        const responseText = await response.text();

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          result = { raw_response: responseText };
        }

        if ((result.order_id || result.orderId) &&
            (result.error_found !== '1' && result.error_found !== 1) &&
            !result.error_message &&
            result.response_code !== 'D') {

          const orderId = result.order_id || result.orderId;
          mainOrderId = orderId;
          customerId = result.customer_id || result.customerId;

          orders.push({
            productId: product.id,
            orderId: orderId,
            price: product.price,
            success: true,
            response: result
          });
        } else {
          const errorMessage = result.error_message ||
                              result.decline_reason ||
                              result.gateway_response ||
                              (result.response_code === 'D' ? 'Transaction declined' : 'Transaction failed');

          orders.push({
            productId: product.id,
            price: product.price,
            success: false,
            error: errorMessage
          });
        }

      } catch (error) {
        console.error(`Failed to create order for product ${product.id}:`, error);
        orders.push({
          productId: product.id,
          price: product.price,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Check if any orders were successful
    const successfulOrders = orders.filter(o => o.success);

    if (successfulOrders.length > 0) {
      // Track purchase on RudderStack
      if (typeof window !== 'undefined' && window.rudderanalytics) {
        const productContents = orderData.products.map(p => ({
          product_id: p.id,
          name: p.name,
          price: p.price,
          quantity: 1
        }));

        window.rudderanalytics.track('Order Completed', {
          order_id: mainOrderId,
          total: orderData.totalAmount,
          revenue: orderData.totalAmount,
          value: orderData.totalAmount, // TikTok requirement
          currency: 'USD',
          email: orderData.email,
          customer_name: `${orderData.firstName} ${orderData.lastName}`,
          products: productContents,
          // TikTok-specific fields
          contents: productContents,
          content_type: 'product',
          // UTM and tracking data
          ...(orderData.utmData || {})
        });
      }

      processingRequests.delete(requestKey);
      return {
        success: true,
        orderId: mainOrderId!,
        customerId: customerId!,
        message: `Created ${successfulOrders.length} orders successfully`,
        orders: orders,
        totalAmount: orderData.totalAmount
      };
    } else {
      // If all orders failed, return error
      processingRequests.delete(requestKey);
      return {
        success: false,
        message: 'Failed to create orders',
        orders: orders,
        error: orders.length > 0 ? orders[0].error : 'Unknown error'
      };
    }

  } catch (error) {
    console.error('Sticky.io checkout error:', error);
    processingRequests.delete(requestKey);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order processing failed'
    };
  }
}

// US State abbreviations mapping
const US_STATES: { [key: string]: string } = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC'
};

export function normalizeState(state: string): string {
  if (!state) return '';

  const cleanState = state.trim();

  // If already 2 characters and uppercase, return as is
  if (cleanState.length === 2 && cleanState === cleanState.toUpperCase()) {
    return cleanState;
  }

  // Try to find abbreviation for full state name
  const stateAbbr = US_STATES[cleanState.toLowerCase()];
  if (stateAbbr) {
    return stateAbbr;
  }

  // If 2 characters but lowercase, convert to uppercase
  if (cleanState.length === 2) {
    return cleanState.toUpperCase();
  }

  // Default fallback - return first 2 characters uppercase
  return cleanState.substring(0, 2).toUpperCase();
}

export function detectCardType(cardNumber: string): string {
  if (!cardNumber) return 'visa';
  const firstDigit = cardNumber.charAt(0);
  switch(firstDigit) {
    case '3': return 'amex';
    case '4': return 'visa';
    case '5': return 'master';
    case '6': return 'discover';
    default: return 'visa';
  }
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
}

export function validateCardDetails(cardNumber: string, expMonth: string, expYear: string, cvv: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate card number (basic length check)
  const cleanCardNumber = formatCardNumber(cardNumber);
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    errors.push('Invalid card number length');
  }

  // Validate expiration month
  const month = parseInt(expMonth);
  if (isNaN(month) || month < 1 || month > 12) {
    errors.push('Invalid expiration month');
  }

  // Validate expiration year (accept both YY and YYYY formats)
  let year = parseInt(expYear);
  if (expYear.length === 2) {
    // Convert YY to YYYY (assume 20XX for years 00-99)
    year = 2000 + year;
  }
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < currentYear || year > currentYear + 20) {
    errors.push('Invalid expiration year');
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('Invalid CVV');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

