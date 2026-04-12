import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import './ItemsList.css';

const ItemsList = ({ items, subtotal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="items-list">
      <button
        className="items-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="items-content"
      >
        <span>Your Items ({items.length})</span>
        <svg
          className={`chevron ${isExpanded ? 'expanded' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div id="items-content" className="items-content">
          <ul className="items-list-items">
            {items.map((item, index) => (
              <li key={index} className="item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="item-quantity">×{item.quantity}</span>
                  )}
                </div>
                <span className="item-price">{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="items-subtotal">
            <span>Subtotal</span>
            <span className="subtotal-amount">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
