import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, MessageCircle, FileText, Clock, Zap } from 'lucide-react';
import { Order } from '../types';
import { paymentService } from '../services/paymentService';
import './CheckoutResult.css';

export const CheckoutSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order: Order | undefined = location.state?.order;

  const orderId = order?.id || 'OTS-2026-00004';
  const amountPaid = order?.total || 999;
  const whatsappNumber = order?.customerWhatsApp || '+91 9441323332';

  // Direct WhatsApp Sales & Activation redirect to 9441323332
  const whatsappUrl = order 
    ? paymentService.generateWhatsAppOrderUrl(order)
    : `https://wa.me/919441323332?text=${encodeURIComponent(`Hi OTT Sellers, I just completed order ${orderId} for ₹${amountPaid}. Please verify and dispatch my credentials.`)}`;

  React.useEffect(() => {
    // Automatically trigger WhatsApp redirect after 1.5 seconds if order is present
    if (order) {
      const timer = setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [order, whatsappUrl]);

  return (
    <div className="checkout-result-page success-theme">
      <div className="container">
        <div className="result-card">
          <div className="result-icon-circle success">
            <CheckCircle2 size={54} />
          </div>

          <span className="result-badge success">Payment Verified & Order Placed</span>
          <h1 className="result-title">Payment Successful!</h1>
          <p className="result-lead">
            Thank you for ordering with OTT Sellers. Your subscription has entered our priority dispatch queue.
          </p>

          <div className="order-receipt-summary-box">
            <div className="receipt-row">
              <span className="receipt-label">Order Reference ID:</span>
              <strong className="receipt-value order-id-highlight">{orderId}</strong>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Amount Paid:</span>
              <strong className="receipt-value price">₹ {amountPaid}</strong>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Delivery Channel:</span>
              <span className="receipt-value">WhatsApp ({whatsappNumber})</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Estimated Delivery Time:</span>
              <span className="receipt-value delivery-time">
                <Clock size={15} /> 5 – 15 Minutes
              </span>
            </div>
          </div>

          {/* Steps What Happens Next */}
          <div className="next-steps-container">
            <h3 className="next-steps-heading">What Happens Next?</h3>
            <div className="steps-list-cards">
              <div className="next-step-item">
                <span className="step-num">1</span>
                <div>
                  <strong>Automated Verification</strong>
                  <p>Our billing bot confirms payment screenshot and issues official token.</p>
                </div>
              </div>
              <div className="next-step-item">
                <span className="step-num">2</span>
                <div>
                  <strong>WhatsApp & Email Notification</strong>
                  <p>Your login email, password, and private profile PIN will be sent directly to you.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions-row">
            <Link to={`/account/orders/${orderId}`} className="btn-result-primary">
              <FileText size={18} />
              <span>View Order Details</span>
            </Link>

            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-result-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Open WhatsApp & Receive Credentials (9441323332)</span>
            </a>

            <Link to="/" className="btn-result-outline">
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
