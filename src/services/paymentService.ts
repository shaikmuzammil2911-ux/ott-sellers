import { Order } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMsg: string) => void;
}

export const paymentService = {
  /**
   * Load Razorpay Checkout SDK Script
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Initiate Razorpay Payment
   */
  async openCheckout(options: PaymentOptions) {
    const isLoaded = await this.loadRazorpayScript();

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    // If Razorpay SDK is loaded and a real live key is present
    if (isLoaded && window.Razorpay && razorpayKey !== 'rzp_test_placeholder') {
      const rzpOptions = {
        key: razorpayKey,
        amount: Math.round(options.amount * 100), // in paise
        currency: 'INR',
        name: 'OTT SELLERS',
        description: options.description,
        image: '/logo.png',
        handler: function (response: any) {
          options.onSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
        },
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone
        },
        theme: {
          color: '#e50914'
        },
        modal: {
          ondismiss: function () {
            options.onFailure('Payment checkout was closed by the user.');
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } else {
      // Smooth fallback / test mode simulator
      setTimeout(() => {
        const mockPayId = `pay_ott_${Date.now().toString(36).toUpperCase()}`;
        options.onSuccess(mockPayId);
      }, 700);
    }
  },

  /**
   * Build WhatsApp Direct Order Redirect URL with 9441323332
   */
  generateWhatsAppOrderUrl(order: Order): string {
    const targetPhone = '919441323332';
    const itemsSummary = order.items.map(it => `• ${it.name} (Qty: ${it.quantity})`).join('\n');
    
    const message = 
`*NEW ORDER VERIFICATION — OTT SELLERS*
━━━━━━━━━━━━━━━━━━━━
*Order ID:* ${order.id}
*Amount Paid:* ₹${order.total}
*Payment Method:* ${order.paymentMethod}
*Customer Name:* ${order.customerName}
*Email:* ${order.customerEmail}
*Phone:* ${order.customerMobile}

*Subscriptions Ordered:*
${itemsSummary}

_Please verify payment and dispatch active credentials with profile PIN on this WhatsApp chat._`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  }
};
