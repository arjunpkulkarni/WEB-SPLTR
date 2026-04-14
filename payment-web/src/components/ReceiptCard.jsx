import { formatCurrency } from '../utils/formatters';
import './ReceiptCard.css';

export default function ReceiptCard({ paymentInfo }) {
  const items = paymentInfo.items || [];
  const subtotal = parseFloat(paymentInfo.subtotal ?? paymentInfo.amount ?? 0);
  const tax = parseFloat(paymentInfo.tax ?? paymentInfo.tax_share ?? 0);
  const serviceFee = parseFloat(paymentInfo.service_fee ?? paymentInfo.tip_share ?? 0);
  const total = parseFloat(paymentInfo.total ?? subtotal);

  return (
    <div className="receipt-card">
      {items.length > 0 && items.map((item, i) => (
        <div key={`${item.name}-${i}`} className="line-item">
          <span className="line-item-name">{item.name || 'Item'}</span>
          <span className="line-item-price">{formatCurrency(item.amount ?? item.price ?? item.unit_price ?? item.total ?? 0)}</span>
        </div>
      ))}

      {items.length > 0 && <div className="receipt-divider" />}

      <div className="breakdown-row">
        <span className="breakdown-label">Subtotal</span>
        <span className="breakdown-value">{formatCurrency(subtotal)}</span>
      </div>
      {tax > 0 && (
        <div className="breakdown-row">
          <span className="breakdown-label">Tax</span>
          <span className="breakdown-value">{formatCurrency(tax)}</span>
        </div>
      )}
      {serviceFee > 0 && (
        <div className="breakdown-row">
          <span className="breakdown-label">Service Fee</span>
          <span className="breakdown-value">{formatCurrency(serviceFee)}</span>
        </div>
      )}

      <div className="receipt-dashed-divider" />

      <div className="receipt-total-row">
        <span className="receipt-total-label">Total</span>
        <span className="receipt-total-amount">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
