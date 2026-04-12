import { formatCurrency } from '../utils/formatters';
import './PaymentSummary.css';

const PaymentSummary = ({ subtotal, taxShare, tipShare, total }) => {
  return (
    <div className="payment-summary">
      <h3 className="summary-title">Payment Summary</h3>
      
      <div className="summary-row">
        <span className="summary-label">Subtotal</span>
        <span className="summary-value">{formatCurrency(subtotal)}</span>
      </div>
      
      {taxShare > 0 && (
        <div className="summary-row">
          <span className="summary-label">Tax Share</span>
          <span className="summary-value">{formatCurrency(taxShare)}</span>
        </div>
      )}
      
      {tipShare > 0 && (
        <div className="summary-row">
          <span className="summary-label">Tip Share</span>
          <span className="summary-value">{formatCurrency(tipShare)}</span>
        </div>
      )}
      
      <div className="summary-total">
        <span className="total-label">Total Amount</span>
        <span className="total-value">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
