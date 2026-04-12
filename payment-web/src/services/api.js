const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getPaymentDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/pay/${token}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch payment details' }));
    throw new Error(error.message || 'Failed to fetch payment details');
  }
  
  return response.json();
};

export const confirmPayment = async (token, paymentIntentId) => {
  const response = await fetch(`${API_BASE_URL}/api/pay/${token}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to confirm payment' }));
    throw new Error(error.message || 'Failed to confirm payment');
  }
  
  return response.json();
};
