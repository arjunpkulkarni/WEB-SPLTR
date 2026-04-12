import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import './SuccessPage.css';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiptUrl, amount, billTitle } = location.state || {};

  useEffect(() => {
    if (!amount) {
      navigate('/error', { state: { message: 'Invalid payment confirmation.' } });
    }
  }, [amount, navigate]);

  const handleDownloadReceipt = () => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  if (!amount) {
    return null;
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon-wrapper">
          <svg
            className="success-icon"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="38" fill="#10b981" fillOpacity="0.1" />
            <circle cx="40" cy="40" r="32" fill="#10b981" />
            <path
              d="M28 40L36 48L52 32"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully.
        </p>

        <div className="payment-details">
          {billTitle && (
            <div className="detail-row">
              <span className="detail-label">Bill</span>
              <span className="detail-value">{billTitle}</span>
            </div>
          )}
          <div className="detail-row amount-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value amount-value">{formatCurrency(amount)}</span>
          </div>
        </div>

        {receiptUrl && (
          <button onClick={handleDownloadReceipt} className="receipt-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 13V3M10 13L7 10M10 13L13 10M3 17H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View Receipt
          </button>
        )}

        <div className="success-footer">
          <p>A confirmation email has been sent to you.</p>
          <p className="thank-you">Thank you for your payment!</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
