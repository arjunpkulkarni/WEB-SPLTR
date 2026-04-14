const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export { API_BASE_URL };

export const getPaymentDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/pay/${token}`);

  if (response.status === 410) {
    return { token_expired: true };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const code = body?.error?.code;
    if (code === 'TOKEN_EXPIRED') {
      return { token_expired: true };
    }
    throw new Error(body?.error?.message || body?.message || 'Failed to fetch payment details');
  }

  const body = await response.json();
  return body.data ?? body;
};

export const confirmPayment = async (token, paymentIntentId) => {
  const response = await fetch(`${API_BASE_URL}/pay/${token}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || body?.message || 'Failed to confirm payment');
  }

  const body = await response.json();
  return body.data ?? body;
};
