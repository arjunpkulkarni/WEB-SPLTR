import { useLocation, useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = location.state || { message: 'An unexpected error occurred.' };

  const getErrorDetails = () => {
    const msg = message.toLowerCase();
    
    if (msg.includes('expired')) {
      return {
        title: 'Link Expired',
        description: 'This payment link has expired. Please request a new payment link.',
        icon: 'clock',
      };
    }
    
    if (msg.includes('already paid') || msg.includes('paid')) {
      return {
        title: 'Already Paid',
        description: 'This bill has already been paid. No further action is needed.',
        icon: 'check',
      };
    }
    
    if (msg.includes('invalid') || msg.includes('not found')) {
      return {
        title: 'Invalid Link',
        description: 'This payment link is invalid. Please check the link and try again.',
        icon: 'alert',
      };
    }
    
    if (msg.includes('network') || msg.includes('connection')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
        icon: 'wifi',
      };
    }
    
    return {
      title: 'Payment Error',
      description: message,
      icon: 'alert',
    };
  };

  const errorDetails = getErrorDetails();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon-wrapper">
          {errorDetails.icon === 'clock' && (
            <svg
              className="error-icon clock-icon"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="30" stroke="#f59e0b" strokeWidth="4" />
              <path
                d="M40 24V40L50 50"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          
          {errorDetails.icon === 'check' && (
            <svg
              className="error-icon check-icon"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="30" stroke="#10b981" strokeWidth="4" />
              <path
                d="M28 40L36 48L52 32"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          
          {errorDetails.icon === 'wifi' && (
            <svg
              className="error-icon wifi-icon"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 35C26 29 33 26 40 26C47 26 54 29 60 35M28 43C32 39 36 37 40 37C44 37 48 39 52 43M36 51C37.5 49.5 38.7 49 40 49C41.3 49 42.5 49.5 44 51M40 57V57.01"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          
          {errorDetails.icon === 'alert' && (
            <svg
              className="error-icon alert-icon"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="30" stroke="#ef4444" strokeWidth="4" />
              <path
                d="M40 28V44M40 52V52.01"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <h1 className="error-title">{errorDetails.title}</h1>
        <p className="error-description">{errorDetails.description}</p>

        <div className="error-actions">
          <button onClick={handleGoBack} className="back-button">
            Go Back
          </button>
        </div>

        <div className="error-footer">
          <p>Need help? Contact support for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
