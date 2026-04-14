import { useLocation, useNavigate } from 'react-router-dom';
import './ErrorPage.css';

export default function ErrorPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const type = state?.type;
  const message = state?.message;

  const isExpired = type === 'expired' || (message && message.toLowerCase().includes('expired'));
  const isPaid = type === 'paid' || (message && message.toLowerCase().includes('paid'));

  let icon = '!';
  let title = 'Payment Failed';
  let desc = message || 'An unexpected error occurred.';

  if (isExpired) {
    icon = '⏰';
    title = 'Link Expired';
    desc = 'This payment link has expired. Ask the bill owner to resend your invite to get a new link.';
  } else if (isPaid) {
    icon = '✓';
    title = 'Already Paid';
    desc = 'This bill has already been paid. No further action is needed.';
  }

  return (
    <div className="error-page">
      <div className="error-container">
        <header className="brand-header"><span className="brand">settld</span></header>

        <div className="centered-state">
          <div className={`state-icon ${isExpired ? 'expired-bg' : isPaid ? 'success-bg' : 'error-bg'}`}>
            <span className="state-emoji">{icon}</span>
          </div>
          <h1 className={`state-title ${isPaid ? 'success-color' : ''}`}>{title}</h1>
          <p className="state-desc">{desc}</p>
          {!isPaid && (
            <button className="action-btn" onClick={() => navigate(-1)}>Go Back</button>
          )}
        </div>
      </div>
    </div>
  );
}
