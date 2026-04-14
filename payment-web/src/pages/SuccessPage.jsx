import { useLocation } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import './SuccessPage.css';

export default function SuccessPage() {
  const { state } = useLocation();
  const amount = state?.amount;
  const billTitle = state?.billTitle;

  return (
    <div className="success-page">
      <div className="success-container">
        <header className="brand-header"><span className="brand">SPLTR</span></header>

        <div className="centered-state">
          <div className="state-icon success-bg">
            <span className="state-emoji">✓</span>
          </div>
          <h1 className="state-title success-color">Payment Complete</h1>
          <p className="state-desc">
            {amount ? `${formatCurrency(amount)} for ` : ''}
            {billTitle || 'your bill'} has been processed. You can close this page.
          </p>
        </div>
      </div>
    </div>
  );
}
