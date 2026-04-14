import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getReceipt, claimItems, buildPartyWsUrl } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import './PartyReceiptPage.css';

export default function PartyReceiptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const memberName = location.state?.memberName || 'You';
  const billTitle = location.state?.billTitle;
  const basePath = location.pathname.startsWith('/join') ? '/join' : '/party';

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const fetchReceipt = useCallback(async () => {
    try {
      const data = await getReceipt(token);
      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReceipt(); }, [fetchReceipt]);

  // WebSocket for real-time updates
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(buildPartyWsUrl(token));
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'assignment_update' || msg.type === 'member_joined') {
          fetchReceipt();
        }
      };
      wsRef.current = ws;
    } catch { /* WebSocket optional */ }
    return () => { ws?.close(); };
  }, [token, fetchReceipt]);

  const handleClaim = async (itemId, action) => {
    setClaiming(itemId);
    try {
      const data = await claimItems(token, [{ receipt_item_id: itemId, action }]);
      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming(null);
    }
  };

  const handleContinue = () => {
    navigate(`${basePath}/${token}/pay`, {
      state: { memberName, billTitle },
    });
  };

  if (loading) return <LoadingSpinner message="Loading receipt..." />;

  if (error && !receipt) {
    return (
      <div className="receipt-page">
        <div className="receipt-page-container">
          <header className="brand-header"><span className="brand">settld</span></header>
          <div className="centered-state">
            <div className="state-icon error-bg"><span className="state-emoji">!</span></div>
            <h1 className="state-title error-color">Could Not Load Receipt</h1>
            <p className="state-desc">{error}</p>
            <button className="action-btn" onClick={fetchReceipt}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const items = receipt?.items || [];
  const title = billTitle || receipt?.bill_title || 'Your Bill';
  const myClaimedItems = items.filter(item =>
    item.claimed_by?.some(c => c.name === memberName || c.nickname === memberName)
  );
  const hasAnyClaims = myClaimedItems.length > 0;

  return (
    <div className="receipt-page">
      <div className="receipt-page-container">
        <header className="brand-header"><span className="brand">settld</span></header>

        <div className="receipt-hero">
          <div className="receipt-hero-icon"><span style={{ fontSize: 28 }}>🧾</span></div>
          <h1 className="receipt-hero-title">{title}</h1>
          <p className="receipt-hero-subtitle">
            Hi <strong>{memberName}</strong> — tap items you had
          </p>
        </div>

        {error && (
          <div className="receipt-inline-error" role="alert">{error}</div>
        )}

        <div className="items-card">
          {items.map((item) => {
            const isMine = item.claimed_by?.some(
              c => c.name === memberName || c.nickname === memberName
            );
            const claimCount = item.claimed_by?.length || 0;
            const othersText = item.claimed_by
              ?.filter(c => c.name !== memberName && c.nickname !== memberName)
              .map(c => c.name || c.nickname)
              .join(', ');
            const isBusy = claiming === item.id;

            return (
              <button
                key={item.id}
                className={`claim-item ${isMine ? 'claimed' : ''}`}
                onClick={() => handleClaim(item.id, isMine ? 'unclaim' : 'claim')}
                disabled={isBusy}
                aria-pressed={isMine}
              >
                <div className="claim-item-left">
                  <span className={`claim-check ${isMine ? 'checked' : ''}`}>
                    {isMine ? '✓' : ''}
                  </span>
                  <div className="claim-item-info">
                    <span className="claim-item-name">{item.name}</span>
                    {claimCount > 0 && (
                      <span className="claim-item-people">
                        {isMine && othersText ? `You, ${othersText}` : isMine ? 'You' : othersText}
                        {claimCount > 1 ? ` · split ${claimCount} ways` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className="claim-item-price">
                  {formatCurrency(item.price ?? item.amount)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="receipt-footer-sticky">
          <button
            className="action-btn continue-btn"
            onClick={handleContinue}
            disabled={!hasAnyClaims}
          >
            {hasAnyClaims ? 'Continue to Payment' : 'Select at least one item'}
          </button>
        </div>
      </div>
    </div>
  );
}
