import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { XCircle, RefreshCw, ShoppingCart, MessageCircle, AlertTriangle } from 'lucide-react';
import './CheckoutResult.css';

export const CheckoutFailedPage: React.FC = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || 'Transaction could not be completed by your banking gateway.';

  return (
    <div className="checkout-result-page failed-theme">
      <div className="container">
        <div className="result-card">
          <div className="result-icon-circle failed">
            <XCircle size={54} />
          </div>

          <span className="result-badge failed">Payment Incomplete</span>
          <h1 className="result-title">Payment Unsuccessful</h1>
          <p className="result-lead">
            We were unable to verify your payment. No charges were deducted from your account.
          </p>

          <div className="failed-error-alert-box">
            <AlertTriangle size={20} className="failed-alert-icon" />
            <div className="failed-alert-text">
              <strong>Error Details:</strong>
              <p>{errorMessage}</p>
            </div>
          </div>

          <div className="failure-tips-box">
            <h4>Common solutions:</h4>
            <ul>
              <li>Ensure your UPI app has completed biometric authentication</li>
              <li>Check your internet connection and bank server uptime</li>
              <li>Try switching payment method to direct UPI QR or Cards</li>
            </ul>
          </div>

          <div className="result-actions-row">
            <Link to="/checkout" className="btn-result-primary">
              <RefreshCw size={18} />
              <span>Retry Payment</span>
            </Link>

            <Link to="/cart" className="btn-result-outline">
              <ShoppingCart size={18} />
              <span>Return to Cart</span>
            </Link>

            <a 
              href="https://wa.me/919876543210?text=Hi%20OTT%20Sellers%2C%20my%20payment%20failed%20at%20checkout.%20Can%20you%20help%20me%20complete%20the%20order%3F" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-result-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Contact WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
