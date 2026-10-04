import { Order, User } from '../types';

export const INITIAL_USER: User = {
  id: 'usr-101',
  name: 'Muzammil Shaik',
  email: 'muzammil@example.com',
  mobile: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  joinedDate: 'January 2025'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'OTS-2026-00001',
    date: '02 Oct 2026',
    customerName: 'Muzammil Shaik',
    customerEmail: 'muzammil@example.com',
    customerMobile: '+91 98765 43210',
    customerWhatsApp: '+91 98765 43210',
    subtotal: 1049,
    discount: 50,
    total: 999,
    paymentMethod: 'UPI (Google Pay / PhonePe)',
    paymentStatus: 'Success',
    orderStatus: 'Delivered',
    items: [
      {
        productId: 'prod-netflix-premium',
        name: 'Netflix Premium (3 Months)',
        planDuration: '3 Months',
        price: 999,
        quantity: 1,
        credentials: {
          email: 'user.ots.net49@ottsellers.vip',
          profilePin: '7821 (Profile Slot 3: "Alex")',
          instruction: 'Login using the provided email & password on your TV/Phone and select Profile Slot 3.'
        }
      }
    ],
    notes: 'Delivered instantly to WhatsApp and verified active.'
  },
  {
    id: 'OTS-2026-00002',
    date: '28 Sep 2026',
    customerName: 'Muzammil Shaik',
    customerEmail: 'muzammil@example.com',
    customerMobile: '+91 98765 43210',
    customerWhatsApp: '+91 98765 43210',
    subtotal: 899,
    discount: 0,
    total: 899,
    paymentMethod: 'UPI (Paytm)',
    paymentStatus: 'Success',
    orderStatus: 'Completed',
    items: [
      {
        productId: 'prod-youtube-premium',
        name: 'YouTube Premium (3 Months)',
        planDuration: '3 Months',
        price: 899,
        quantity: 1,
        credentials: {
          email: 'muzammil@example.com',
          instruction: 'Google Family invite sent to your Gmail. Click Accept to enjoy ad-free YouTube.'
        }
      }
    ]
  },
  {
    id: 'OTS-2026-00003',
    date: '15 Sep 2026',
    customerName: 'Muzammil Shaik',
    customerEmail: 'muzammil@example.com',
    customerMobile: '+91 98765 43210',
    customerWhatsApp: '+91 98765 43210',
    subtotal: 249,
    discount: 0,
    total: 249,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Success',
    orderStatus: 'Processing',
    items: [
      {
        productId: 'prod-disney-hotstar',
        name: 'Disney+ Hotstar (1 Month)',
        planDuration: '1 Month',
        price: 249,
        quantity: 1,
        credentials: {
          instruction: 'OTP login verification in progress. Our team will contact you on WhatsApp.'
        }
      }
    ]
  }
];
