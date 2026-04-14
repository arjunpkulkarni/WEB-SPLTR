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
  const pollRef = useRef(null);

  const fetchReceipt = useCallback(async () => {
    try {
      const data = await getReceipt(token);
      setReceipt(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReceipt(); }, [fetchReceipt]);

  // WebSocket for real-time updates; falls back to polling every 5s
  useEffect(() => {
    let ws;
    let wsConnected = false;

    try {
      ws = new WebSocket(buildPartyWsUrl(token));
      ws.onopen = () => {
        wsRef.current = ws;
        wsConnected = true;
        clearInterval(pollRef.current);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'assignment_update' || msg.type === 'member_joined' || msg.type === 'payment_complete') {
            fetchReceipt();
          }
        } catch {}
      };
      ws.onerror = () => {};
      ws.onclose = () => {
        wsRef.current = null;
        wsConnected = false;
        // WebSocket died — start polling as fallback
        if (!pollRef.current) {
          pollRef.current = setInterval(fetchReceipt, 5000);
        }
      };
    } catch {
      // WebSocket not available — use polling
    }

    // Start polling immediately as fallback until WebSocket connects
    pollRef.current = setInterval(() => {
      if (!wsConnected) fetchReceipt();
    }, 5000);

    return () => {
      ws?.close();
      clearInterval(pollRef.current);
    };
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
      state: { memberName, billTitle: title },
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
  const title = billTitle || receipt?.bill_title || receipt?.bill_name || receipt?.title || receipt?.name || 'Your Bill';
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
            const myClaim = item.claimed_by?.find(
              c => c.name === memberName || c.nickname === memberName
            );
            const isMine = !!myClaim;
            const claimCount = item.claimed_by?.length || 0;
            const fullPrice = parseFloat(item.total_price || item.unit_price || 0);

            // Show what I owe (split amount) vs the full item price
            const myAmount = myClaim ? parseFloat(myClaim.amount_owed || 0) : null;
            const isSplit = claimCount > 1;

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
                        {isSplit ? ` · split ${claimCount} ways` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="claim-item-prices">
                  {isMine && isSplit ? (
                    <>
                      <span className="claim-item-my-price">{formatCurrency(myAmount)}</span>
                      <span className="claim-item-full-price">{formatCurrency(fullPrice)}</span>
                    </>
                  ) : (
                    <span className="claim-item-price">{formatCurrency(fullPrice)}</span>
                  )}
                </div>
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
