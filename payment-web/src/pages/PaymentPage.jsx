import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getPaymentDetails, confirmPayment } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemsList from '../components/ItemsList';
import PaymentSummary from '../components/PaymentSummary';
import PaymentForm from '../components/PaymentForm';
import './PaymentPage.css';

const PaymentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const data = await getPaymentDetails(token);

        if (data.token_expired) {
          navigate('/error', { state: { message: 'This payment link has expired.' } });
          return;
        }

        if (data.already_paid) {
          navigate('/error', { state: { message: 'This bill has already been paid.' } });
          return;
        }

        setPaymentData(data);
        
        const publishableKey = data.stripe_publishable_key || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        setStripePromise(loadStripe(publishableKey));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError(err.message || 'Failed to load payment details. Please try again.');
        setLoading(false);
      }
    };

    if (token) {
      fetchPaymentDetails();
    }
  }, [token, navigate]);

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const result = await confirmPayment(token, paymentIntent.id);
      navigate('/success', { 
        state: { 
          receiptUrl: result.receipt_url,
          amount: paymentData.total,
          billTitle: paymentData.bill_title,
        } 
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Payment succeeded but confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (error) {
    return (
      <div className="payment-page error-state">
        <div className="error-container">
          <svg
            className="error-icon"
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="30" stroke="#ef4444" strokeWidth="4" />
            <path
              d="M32 20V36M32 44V44.01"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <h1>Unable to Load Payment</h1>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData || !stripePromise) {
    return <LoadingSpinner message="Initializing payment..." />;
  }

  const options = {
    clientSecret: paymentData.payment_intent_client_secret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <header className="payment-header">
          <h1 className="bill-title">{paymentData.bill_title}</h1>
          {paymentData.merchant_name && (
            <p className="merchant-name">{paymentData.merchant_name}</p>
          )}
          {paymentData.member_name && (
            <p className="member-name">Payment for {paymentData.member_name}</p>
          )}
        </header>

        <ItemsList
          items={paymentData.items}
          subtotal={paymentData.subtotal}
        />

        <PaymentSummary
          subtotal={paymentData.subtotal}
          taxShare={paymentData.tax_share}
          tipShare={paymentData.tip_share}
          total={paymentData.total}
        />

        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            amount={paymentData.total}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
