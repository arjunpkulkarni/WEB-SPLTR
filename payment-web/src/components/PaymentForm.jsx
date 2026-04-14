import { useState, useEffect } from 'react';
import {
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatCurrency } from '../utils/formatters';
import './PaymentForm.css';

export default function PaymentForm({ amount, billTitle, clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents <= 0) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: billTitle || 'SPLTR Payment', amount: amountCents },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });

    pr.on('paymentmethod', async (ev) => {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );

      if (confirmError) {
        ev.complete('fail');
        onError?.(confirmError.message);
      } else if (paymentIntent.status === 'requires_action') {
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) {
          ev.complete('fail');
          onError?.(actionError.message);
        } else {
          ev.complete('success');
          onSuccess?.();
        }
      } else {
        ev.complete('success');
        onSuccess?.();
      }
    });
  }, [stripe, amount, billTitle, clientSecret, onSuccess, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/success' },
      redirect: 'if_required',
    });

    if (error) {
      onError?.(error.message);
      setProcessing(false);
    } else {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {paymentRequest && (
        <div className="wallet-section">
          <PaymentRequestButtonElement options={{ paymentRequest }} />
          <div className="or-divider">
            <span className="or-line" />
            <span className="or-text">or pay with card</span>
            <span className="or-line" />
          </div>
        </div>
      )}

      <PaymentElement />

      <button
        type="submit"
        disabled={processing || !stripe}
        className="pay-btn"
      >
        {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
      </button>

      <p className="secured-text">Payments processed securely via Stripe</p>
    </form>
  );
}
